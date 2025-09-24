import { supabase } from '@/integrations/supabase/client';
import { Rib, RibInsert, RibUpdate } from '@/types/rib';

export class RibService {
  static async create(ribData: RibInsert): Promise<Rib> {
    const { data, error } = await supabase
      .from('ribs')
      .insert(ribData)
      .select()
      .single();

    if (error) {
      console.error('Error creating Rib:', error);
      throw new Error(`Error creating Rib: ${error.message}`);
    }
    return data;
  }

  static async getAll(): Promise<Rib[]> {
    const { data, error } = await supabase
      .from('ribs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Ribs:', error);
      throw new Error(`Error fetching Ribs: ${error.message}`);
    }
    return data || [];
  }

  static async getById(id: string): Promise<Rib | null> {
    const { data, error } = await supabase
      .from('ribs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching Rib by ID:', error);
      // Don't throw if not found, just return null
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error fetching Rib by ID: ${error.message}`);
    }
    return data;
  }

  static async update(id: string, ribData: RibUpdate): Promise<Rib> {
    const { data, error } = await supabase
      .from('ribs')
      .update({ ...ribData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating Rib:', error);
      throw new Error(`Error updating Rib: ${error.message}`);
    }
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ribs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting Rib:', error);
      throw new Error(`Error deleting Rib: ${error.message}`);
    }
  }
}