import { supabase } from '@/integrations/supabase/client';
import { Accionista, AccionistaInsert, AccionistaUpdate } from '@/types/accionista';

export class AccionistaService {
  static async getByRuc(ruc: string): Promise<Accionista[]> {
    const { data, error } = await supabase
      .from('ficha_ruc_accionistas')
      .select('*')
      .eq('ruc', ruc)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accionistas by RUC:', error);
      throw error;
    }
    return data || [];
  }

  static async create(accionistaData: AccionistaInsert): Promise<Accionista> {
    const { data, error } = await supabase
      .from('ficha_ruc_accionistas')
      .insert(accionistaData)
      .select()
      .single();

    if (error) {
      console.error('Error creating accionista:', error);
      throw error;
    }
    return data;
  }

  static async update(id: string, accionistaData: AccionistaUpdate): Promise<Accionista> {
    const { data, error } = await supabase
      .from('ficha_ruc_accionistas')
      .update({ ...accionistaData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating accionista:', error);
      throw error;
    }
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ficha_ruc_accionistas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting accionista:', error);
      throw error;
    }
  }
}