import { supabase } from '@/integrations/supabase/client';
import { Rib, RibInsert, RibUpdate } from '@/types/rib';

export class RibService {
  static async getAll(): Promise<Rib[]> {
    const { data, error } = await supabase
      .from('rib')
      .select(`*`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all RIB data:', error);
      throw error;
    }
    return data || [];
  }

  static async getByRuc(ruc: string): Promise<Rib[]> {
    const { data, error } = await supabase
      .from('rib')
      .select('*')
      .eq('ruc', ruc)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RIB data by RUC:', error);
      throw error;
    }
    return data || [];
  }

  static async create(ribData: Omit<RibInsert, 'user_id'>): Promise<Rib> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dataToInsert = {
      ...ribData,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('rib')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating RIB:', error);
      throw error;
    }
    return data;
  }

  static async update(id: string, ribData: RibUpdate): Promise<Rib> {
    const { data, error } = await supabase
      .from('rib')
      .update({ ...ribData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating RIB:', error);
      throw error;
    }
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rib')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting RIB:', error);
      throw error;
    }
  }
}