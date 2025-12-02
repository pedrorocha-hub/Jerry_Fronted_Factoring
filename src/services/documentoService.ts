import { supabase } from '@/integrations/supabase/client';
import { Documento, DocumentoTipo } from '@/types/documento';

export const DocumentoService = {
  async uploadAndInsert(
    file: File,
    tipo: DocumentoTipo,
    customName?: string,
    isManualUpload: boolean = false,
    solicitudId?: string
  ): Promise<Documento> {
    try {
      // 1. Definir el path
      const fileName = customName || file.name;
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = new Date().getTime();
      const finalName = `${timestamp}_${cleanFileName}`;
      
      let storagePath = '';
      
      if (solicitudId) {
        // Si hay solicitud ID, va a la carpeta de solicitudes
        storagePath = `solicitudes/${solicitudId}/${finalName}`;
      } else {
        // Si no, va a la carpeta del tipo de documento
        storagePath = `${tipo}/${finalName}`;
      }

      // 2. Subir al Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Insertar en la tabla documentos
      const { data: docData, error: docError } = await supabase
        .from('documentos')
        .insert({
          tipo,
          nombre_archivo: fileName,
          storage_path: storagePath,
          tamaño_archivo: file.size,
          estado: isManualUpload ? 'pending' : 'pending', // Dejar en pending para triggers
          solicitud_id: solicitudId || null
        })
        .select()
        .single();

      if (docError) throw docError;

      return docData;
    } catch (error) {
      console.error('Error in uploadAndInsert:', error);
      throw error;
    }
  },

  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('documentos')
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  },

  async deleteDocumento(id: string, path: string): Promise<void> {
    // 1. Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documentos')
      .remove([path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue to delete metadata even if storage fails
    }

    // 2. Delete from database
    const { error: dbError } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;
  }
};