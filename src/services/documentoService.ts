import { supabase } from '@/integrations/supabase/client';
import { Documento, DocumentoTipo } from '@/types/documento';

export const DocumentoService = {
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
      // Estructura: solicitudes/{solicitudId}/{timestamp}_{filename}
      // Limpiamos el nombre de archivo para evitar caracteres extraños
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = new Date().getTime();
      
      let folderPath = 'general';
      if (solicitudId) {
        folderPath = `solicitudes/${solicitudId}`;
      }
      
      const storagePath = `${folderPath}/${timestamp}_${cleanFileName}`;

      // 3. Subir al Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documentos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 4. Insertar registro en BD
      const { data: dbData, error: dbError } = await supabase
        .from('documentos')
        .insert({
          solicitud_id: solicitudId,
          tipo: tipo,
          storage_path: storagePath,
          nombre_archivo: file.name,
          tamaño_archivo: file.size,
          estado: 'uploaded',
          created_by: user?.id
        })
        .select()
        .single();

      if (dbError) {
        // Si falla la BD, intentamos limpiar el archivo subido para no dejar basura
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
      .createSignedUrl(path, 3600); // URL válida por 1 hora
      
    if (error) throw error;
    return data.signedUrl;
  }
};