import { supabase } from '@/integrations/supabase/client';

export interface DispatchDocumentRequest {
  id: string;
  tipo: string;
  storage_path: string;
  nombre_archivo: string;
  size_bytes: number;
}

export interface DispatchDocumentResponse {
  success: boolean;
  message?: string;
  documento_id?: string;
  status?: string;
  error?: string;
  details?: string;
}

export class DispatchService {
  private static readonly EDGE_FUNCTION_URL = 'https://kjeprmbqwtzeadtfrxie.supabase.co/functions/v1/dispatch-document';

  static async dispatchDocument(documentData: DispatchDocumentRequest): Promise<DispatchDocumentResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(documentData)
      });

      let result;
      try {
        const responseText = await response.text();
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`Error parseando respuesta JSON: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return result;

    } catch (error) {
      console.error('Error en dispatch:', error);
      throw error;
    }
  }

  // Método de conveniencia para dispatch automático después de upload
  static async autoDispatchAfterUpload(documentId: string): Promise<DispatchDocumentResponse> {
    try {
      console.log('🚀 DispatchService: Starting auto dispatch for document:', documentId);
      // Obtener datos del documento desde la base de datos
      const { data: documento, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        throw new Error(`Error obteniendo documento: ${error.message}`);
      }

      if (!documento) {
        throw new Error('Documento no encontrado');
      }

      // Preparar datos para dispatch
      const dispatchData: DispatchDocumentRequest = {
        id: documento.id,
        tipo: documento.tipo,
        storage_path: documento.storage_path,
        nombre_archivo: documento.nombre_archivo || 'unknown.pdf',
        size_bytes: documento.tamaño_archivo || 0
      };

      console.log('🚀 DispatchService: Calling dispatch-document Edge Function with:', dispatchData);
      const result = await this.dispatchDocument(dispatchData);
      console.log('🚀 DispatchService: Edge Function response:', result);
      return result;

    } catch (error) {
      console.error('Error en auto dispatch:', error);
      throw error;
    }
  }

  // Método para probar la Edge Function manualmente
  static async testEdgeFunction(): Promise<void> {
    const testData: DispatchDocumentRequest = {
      id: 'test-id-123',
      tipo: 'ficha_ruc',
      storage_path: 'test-path.pdf',
      nombre_archivo: 'test.pdf',
      size_bytes: 12345
    };

    try {
      const result = await this.dispatchDocument(testData);
      console.log('Prueba exitosa:', result);
    } catch (error) {
      console.error('Prueba falló:', error);
    }
  }
}