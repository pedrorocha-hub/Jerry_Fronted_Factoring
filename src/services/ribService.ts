import { supabase } from '@/integrations/supabase/client';
import { Rib, RibInsert } from '@/types/rib';

export class RibService {
  static async getAll(): Promise<Rib[]> {
    const { data, error } = await supabase
      .from('ribs')
      .select(`
        *,
        ficha_ruc:ruc (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ribs:', error);
      throw error;
    }
    return data || [];
  }

  static async create(ribData: RibInsert): Promise<Rib> {
    const { data, error } = await supabase
      .from('ribs')
      .insert(ribData)
      .select()
      .single();

    if (error) {
      console.error('Error creating rib:', error);
      throw error;
    }
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ribs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting rib:', error);
      throw error;
    }
  }
}