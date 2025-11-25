import { supabase } from '@/integrations/supabase/client';
import { Documento, DocumentoTipo } from '@/types/documento';

// Tipos de documentos que requieren procesamiento por IA (Webhook)
const AI_PROCESS_TYPES: DocumentoTipo[] = ['ficha_ruc', 'reporte_tributario', 'sentinel'];

export const DocumentoService = {
  async getAll(): Promise<Documento[]> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Documento | null> {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAndInsert(
    file: File,
    tipo: DocumentoTipo,
    oldPath?: string,
    isUpdate: boolean = false,
    solicitudId?: string
  ): Promise<Documento | null> {
    try {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. Definir ruta de almacenamiento
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = new Date().getTime();
      
      let folderPath = 'general';
      if (solicitudId) {
        folderPath = `solicitudes/${solicitudId}`;
      }
      
      const storagePath = `${folderPath}/${timestamp}_${cleanFileName}`;

      // 3. Subir al Storage (IMPORTANTE: especificar contentType)
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documentos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream'
        });

      if (storageError) throw storageError;

      // Determinar estado inicial
      // Si es un tipo que requiere IA, va a 'pending' -> webhook -> processing
      // Si NO requiere IA (evidencias, facturas, etc.), va directo a 'completed'
      const initialStatus = AI_PROCESS_TYPES.includes(tipo) ? 'pending' : 'completed';

      // 4. Insertar registro en BD
      const { data: dbData, error: dbError } = await supabase
        .from('documentos')
        .insert({
          solicitud_id: solicitudId,
          tipo: tipo,
          storage_path: storagePath,
          nombre_archivo: file.name,
          tamaño_archivo: file.size,
          estado: initialStatus, 
          created_by: user?.id
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage.from('documentos').remove([storagePath]);
        throw dbError;
      }

      return dbData;
    } catch (error) {
      console.error('Error en uploadAndInsert:', error);
      throw error;
    }
  },
  
  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(path, 3600); 
      
    if (error) throw error;
    return data.signedUrl;
  },

  async delete(id: string): Promise<void> {
    const { data: doc } = await supabase.from('documentos').select('storage_path').eq('id', id).single();
    
    if (doc?.storage_path) {
      await supabase.storage.from('documentos').remove([doc.storage_path]);
    }

    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reprocess(id: string): Promise<void> {
    const { error } = await supabase
      .from('documentos')
      .update({ 
        estado: 'pending', 
        error_msg: null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) throw error;
  },

  async getStats() {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();

    const { count: thisMonth } = await supabase
      .from('documentos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDay);

    const { count: pendientes } = await supabase
      .from('documentos')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pending', 'processing']);

    const { count: errores } = await supabase
      .from('documentos')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'error');

    return {
      thisMonth: thisMonth || 0,
      pendientes: pendientes || 0,
      errores: errores || 0
    };
  }
};