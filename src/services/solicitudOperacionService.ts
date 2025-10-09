import { supabase } from '@/integrations/supabase/client';
import { SolicitudOperacion } from '@/types/solicitud-operacion';

export class SolicitudOperacionService {
  static async getAll(): Promise<SolicitudOperacion[]> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching solicitudes:', error);
      throw new Error(`Error al obtener las solicitudes: ${error.message}`);
    }

    return data || [];
  }

  static async getById(id: string): Promise<SolicitudOperacion | null> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      console.error('Error fetching solicitud by ID:', error);
      throw new Error(`Error al obtener la solicitud: ${error.message}`);
    }

    return data;
  }

  static async getByRuc(ruc: string): Promise<SolicitudOperacion[]> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select('*')
      .eq('ruc', ruc)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching solicitudes by RUC:', error);
      throw new Error(`Error al obtener las solicitudes por RUC: ${error.message}`);
    }

    return data || [];
  }

  static async create(solicitudData: Partial<SolicitudOperacion>): Promise<SolicitudOperacion> {
    const { data: userData } = await supabase.auth.getUser();
    
    const dataToInsert = {
      ...solicitudData,
      user_id: userData.user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error creating solicitud:', error);
      throw new Error(`Error al crear la solicitud: ${error.message}`);
    }

    return data;
  }

  static async update(id: string, solicitudData: Partial<SolicitudOperacion>): Promise<SolicitudOperacion> {
    const dataToUpdate = {
      ...solicitudData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating solicitud:', error);
      throw new Error(`Error al actualizar la solicitud: ${error.message}`);
    }

    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('solicitudes_operacion')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting solicitud:', error);
      throw new Error(`Error al eliminar la solicitud: ${error.message}`);
    }
  }
}