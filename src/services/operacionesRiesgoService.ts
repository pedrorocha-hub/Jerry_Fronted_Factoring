import { supabase } from '@/integrations/supabase/client';
import { OperacionRiesgo, OperacionRiesgoInsert, OperacionRiesgoUpdate } from '@/types/operacionesRiesgo';

export class OperacionesRiesgoService {
  static async getAll(): Promise<OperacionRiesgo[]> {
    const { data, error } = await supabase
      .from('operaciones_riesgo')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching operaciones de riesgo:', error);
      throw error;
    }
    return data || [];
  }

  static async create(operacionData: OperacionRiesgoInsert): Promise<OperacionRiesgo> {
    const { data, error } = await supabase
      .from('operaciones_riesgo')
      .insert(operacionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating operacion de riesgo:', error);
      throw error;
    }

    return data;
  }

  static async update(id: string, operacionData: OperacionRiesgoUpdate): Promise<OperacionRiesgo> {
    const { data, error } = await supabase
      .from('operaciones_riesgo')
      .update({ ...operacionData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating operacion de riesgo:', error);
      throw error;
    }
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('operaciones_riesgo')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting operacion de riesgo:', error);
      throw error;
    }
  }
}