import { supabase } from '@/integrations/supabase/client';
import { SolicitudOperacion } from '@/types/solicitudOperacion';

export class SolicitudOperacionService {
  static async getAll(): Promise<SolicitudOperacion[]> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<SolicitudOperacion | null> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getByRuc(ruc: string): Promise<SolicitudOperacion[]> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select('*')
      .eq('ruc', ruc)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async create(solicitud: Partial<SolicitudOperacion>): Promise<SolicitudOperacion> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .insert({
        ...solicitud,
        user_id: user?.id,
        status: solicitud.status || 'Borrador',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, solicitud: Partial<SolicitudOperacion>): Promise<SolicitudOperacion> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .update(solicitud)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('solicitudes_operacion')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async updateStatus(id: string, status: string): Promise<SolicitudOperacion> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}