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
            allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
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
    return [
      'ficha_ruc',
      'representante_legal', 
      'cuenta_bancaria',
      'vigencia_poderes',
      'factura_negociar',
      'reporte_tributario',
      'sentinel',
      'sustentos',
      'vigencia_poder',
      'evidencia_visita',
      'eeff'
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
        tamaño_archivo: file.size,
        created_by: user?.id
      };

      console.log('DocumentoService: Inserting document with data:', documentoData);

      const { data: dbData, error: dbError } = await supabase
        .from('documentos')
        .insert([documentoData])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        await supabase.storage.from(this.BUCKET_NAME).remove([path]);
        throw new Error(`Error guardando registro: ${dbError.message}`);
      }

      onProgress?.(70);

      // Solo despachamos si no es evidencia (las fotos no se procesan por IA por ahora)
      if (autoDispatch && tipo !== 'evidencia_visita') {
         // Dispatch handled by webhook usually
      }

      onProgress?.(100);
      return dbData;

    } catch (error) {
      console.error('Error en upload:', error);
      throw error;
    }
  }

  static async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn);

    if (error) throw new Error(`Error creando URL firmada: ${error.message}`);
    return data.signedUrl;
  }

  // Métodos estándar de CRUD...
  static async getAll(): Promise<Documento[]> {
    const { data, error } = await supabase.from('documentos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
  
  static async delete(id: string): Promise<void> {
    const { data: doc } = await supabase.from('documentos').select('storage_path').eq('id', id).single();
    if (doc) {
        await supabase.storage.from(this.BUCKET_NAME).remove([doc.storage_path]);
    }
    const { error } = await supabase.from('documentos').delete().eq('id', id);
    if (error) throw error;
  }

  static async reprocess(id: string): Promise<void> {
     // Logic placeholder
  }
  
  static async getStats() {
      // Logic placeholder
      return { total: 0, procesados: 0, pendientes: 0, errores: 0, thisMonth: 0 };
  }
}