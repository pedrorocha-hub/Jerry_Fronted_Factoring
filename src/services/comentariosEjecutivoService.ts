import { supabase } from '@/integrations/supabase/client';

export interface ComentarioEjecutivo {
  id?: string;
  comentario: string;
  archivos_adjuntos: string[];
  solicitud_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ComentarioEjecutivoInsert {
  comentario: string;
  archivos_adjuntos: string[];
  solicitud_id: string;
}

export interface ComentarioEjecutivoUpdate {
  comentario?: string;
  archivos_adjuntos?: string[];
  solicitud_id?: string;
}

export class ComentariosEjecutivoService {
  /**
   * Crear un nuevo comentario del ejecutivo
   */
  static async create(data: ComentarioEjecutivoInsert): Promise<ComentarioEjecutivo> {
    const { data: result, error } = await supabase
      .from('comentarios_ejecutivo')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creando comentario: ${error.message}`);
    }

    return result;
  }


  /**
   * Obtener comentarios por Solicitud ID
   */
  static async getBySolicitudId(solicitudId: string): Promise<ComentarioEjecutivo | null> {
    const { data, error } = await supabase
      .from('comentarios_ejecutivo')
      .select('*')
      .eq('solicitud_id', solicitudId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error obteniendo comentarios: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualizar comentario existente
   */
  static async update(id: string, data: ComentarioEjecutivoUpdate): Promise<ComentarioEjecutivo> {
    const { data: result, error } = await supabase
      .from('comentarios_ejecutivo')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error actualizando comentario: ${error.message}`);
    }

    return result;
  }

  /**
   * Eliminar comentario
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('comentarios_ejecutivo')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error eliminando comentario: ${error.message}`);
    }
  }


  /**
   * Crear o actualizar comentario (upsert) por Solicitud ID
   */
  static async upsertBySolicitudId(solicitudId: string, data: ComentarioEjecutivoInsert): Promise<ComentarioEjecutivo> {
    // Primero intentar obtener el comentario existente
    const existing = await this.getBySolicitudId(solicitudId);
    
    if (existing) {
      // Actualizar existente
      return await this.update(existing.id!, {
        comentario: data.comentario,
        archivos_adjuntos: data.archivos_adjuntos
      });
    } else {
      // Crear nuevo
      return await this.create({ ...data, solicitud_id: solicitudId });
    }
  }

  /**
   * Obtener todos los comentarios
   */
  static async getAll(): Promise<ComentarioEjecutivo[]> {
    const { data, error } = await supabase
      .from('comentarios_ejecutivo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo comentarios: ${error.message}`);
    }

    return data || [];
  }
}
