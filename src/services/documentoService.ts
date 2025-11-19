import { supabase } from '@/integrations/supabase/client';
import { Documento, DocumentoInsert, DocumentoTipo, UploadProgress } from '@/types/documento';
import { DispatchService } from './dispatchService';

export class DocumentoService {
  private static readonly BUCKET_NAME = 'documentos';

  // Verificar y crear bucket si no existe
  private static async ensureBucketExists(): Promise<void> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      if (error) {
        const { data: createData, error: createError } = await supabase.storage
          .createBucket(this.BUCKET_NAME, {
            public: false,
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['application/pdf']
          });

        if (createError) {
          throw new Error(`No se pudo crear el bucket: ${createError.message}`);
        }
      }
    } catch (error) {
      console.error('Error verificando/creando bucket:', error);
      throw error;
    }
  }

  // Verificar qué tipos de documento están permitidos
  static async getValidDocumentTypes(): Promise<string[]> {
    // Devolver todos los tipos que deberían estar permitidos
    return [
      'ficha_ruc',
      'representante_legal', 
      'cuenta_bancaria',
      'vigencia_poderes',
      'factura_negociar',
      'reporte_tributario',
      'sentinel'
    ];
  }

  // Subir archivo y crear registro en base de datos
  static async uploadAndInsert(
    file: File, 
    tipo: DocumentoTipo,
    onProgress?: (progress: number) => void,
    autoDispatch: boolean = true
  ): Promise<Documento> {
    const fileId = crypto.randomUUID();
    const fileName = file.name;
    const path = `${fileId}_${fileName}`;

    try {
      console.log('DocumentoService: Starting upload with tipo:', tipo);
      onProgress?.(5);
      await this.ensureBucketExists();
      onProgress?.(15);

      const { data: { user } } = await supabase.auth.getUser();
      onProgress?.(25);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      onProgress?.(50);

      const documentoData: DocumentoInsert = {
        tipo,
        storage_path: path,
        estado: 'pending',
        nombre_archivo: fileName,
        tamaño_archivo: file.size
      };

      console.log('DocumentoService: Inserting document with data:', documentoData);

      const { data: dbData, error: dbError } = await supabase
        .from('documentos')
        .insert([documentoData])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        
        // Limpiar archivo subido si falla la inserción en BD
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([path]);
        
        // Proporcionar un mensaje de error más específico
        if (dbError.message.includes('violates check constraint "documentos_tipo_check"')) {
          throw new Error(`Tipo de documento "${tipo}" no está permitido. Verifica la configuración de la base de datos.`);
        }
        
        throw new Error(`Error guardando registro: ${dbError.message}`);
      }

      onProgress?.(70);

      if (autoDispatch) {
        // The dispatch is now handled by a database webhook that triggers on INSERT
        // into the 'documentos' table. The explicit call from the client is
        // no longer needed and was causing authentication issues.
        // try {
        //   await DispatchService.autoDispatchAfterUpload(dbData.id);
        // } catch (dispatchError) {
        //   console.error('Error en auto dispatch:', dispatchError);
        // }
      }

      onProgress?.(100);
      return dbData;

    } catch (error) {
      console.error('Error en upload:', error);
      throw error;
    }
  }

  // Obtener URL firmada para descargar archivo
  static async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      throw new Error(`Error creando URL firmada: ${error.message}`);
    }

    return data.signedUrl;
  }

  // Obtener últimos documentos
  static async getRecentDocuments(limit: number = 20): Promise<Documento[]> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Obtener todos los documentos
  static async getAll(): Promise<Documento[]> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Obtener documento por ID
  static async getById(id: string): Promise<Documento | null> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // Actualizar estado de documento
  static async updateEstado(id: string, estado: DocumentoEstado): Promise<Documento> {
    const { data, error } = await supabase
      .from('documentos')
      .update({ 
        estado, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando estado: ${error.message}`);
    }

    return data;
  }

  // Reprocesar documento
  static async reprocess(id: string): Promise<void> {
    try {
      // Actualizar estado a pending
      await this.updateEstado(id, 'pending');
      
      // Intentar redispatch
      await DispatchService.autoDispatchAfterUpload(id);
    } catch (error) {
      console.error('Error reprocesando documento:', error);
      throw new Error(`Error reprocesando documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Eliminar documento
  static async delete(id: string): Promise<void> {
    const documento = await this.getById(id);
    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([documento.storage_path]);

    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) {
      throw new Error(`Error eliminando registro: ${dbError.message}`);
    }
  }

  // Obtener estadísticas
  static async getStats() {
    const { data, error } = await supabase.from('documentos').select('tipo, estado, created_at');
    if (error) throw error;
    if (!data) {
      return {
        total: 0,
        procesados: 0,
        pendientes: 0,
        errores: 0,
        thisMonth: 0,
        typeDistribution: {},
        statusDistribution: {}
      };
    }

    const total = data.length;
    const typeDistribution: { [key: string]: number } = {};
    const statusDistribution: { [key: string]: number } = {};
    let thisMonth = 0;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    data.forEach(doc => {
      if (doc.tipo) typeDistribution[doc.tipo] = (typeDistribution[doc.tipo] || 0) + 1;
      if (doc.estado) statusDistribution[doc.estado] = (statusDistribution[doc.estado] || 0) + 1;
      if (new Date(doc.created_at) >= oneMonthAgo) thisMonth++;
    });

    const procesados = statusDistribution['completed'] || 0;
    const pendientes = (statusDistribution['pending'] || 0) + (statusDistribution['processing'] || 0);
    const errores = statusDistribution['error'] || 0;

    return { total, procesados, pendientes, errores, thisMonth, typeDistribution, statusDistribution };
  }
}

export type DocumentoEstado = Documento['estado'];