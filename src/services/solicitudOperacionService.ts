import { supabase } from '@/integrations/supabase/client';
import { SolicitudOperacion, SolicitudOperacionInsert, SolicitudOperacionUpdate } from '@/types/solicitud-operacion';

export class SolicitudOperacionService {
  static async create(solicitudData: Omit<SolicitudOperacionInsert, 'user_id'>): Promise<SolicitudOperacion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dataToInsert = {
      ...solicitudData,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating Solicitud de Operacion:', error);
      throw new Error(`Error creating Solicitud de Operacion: ${error.message}`);
    }
    if (!data) {
      throw new Error('Insert succeeded but no data was returned.');
    }
    return data;
  }

  static async getAll(): Promise<SolicitudOperacion[]> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Solicitudes de Operacion:', error);
      throw new Error(`Error fetching Solicitudes de Operacion: ${error.message}`);
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
      console.error('Error fetching Solicitud de Operacion by ID:', error);
      // Don't throw if not found, just return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching Solicitud de Operacion by ID: ${error.message}`);
    }
    return data;
  }

  static async update(id: string, solicitudData: SolicitudOperacionUpdate): Promise<SolicitudOperacion> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .update({ ...solicitudData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating Solicitud de Operacion:', error);
      throw new Error(`Error updating Solicitud de Operacion: ${error.message}`);
    }
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('solicitudes_operacion')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting Solicitud de Operacion:', error);
      throw new Error(`Error deleting Solicitud de Operacion: ${error.message}`);
    }
  }
}