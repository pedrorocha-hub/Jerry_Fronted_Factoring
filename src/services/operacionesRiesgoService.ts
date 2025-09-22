import { supabase } from '@/integrations/supabase/client';
import { OperacionRiesgo, OperacionRiesgoInsert } from '@/types/operacionesRiesgo';

export class OperacionesRiesgoService {
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
}