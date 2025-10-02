import { supabase } from '@/integrations/supabase/client';
import { ComportamientoCrediticio, ComportamientoCrediticioInsert, ComportamientoCrediticioUpdate } from '@/types/comportamientoCrediticio';

export class ComportamientoCrediticioService {
  static async getAll(): Promise<ComportamientoCrediticio[]> {
    const { data, error } = await supabase
      .from('comportamiento_crediticio')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async create(insertData: Omit<ComportamientoCrediticioInsert, 'user_id'>): Promise<ComportamientoCrediticio> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('comportamiento_crediticio')
      .insert({ ...insertData, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updateData: ComportamientoCrediticioUpdate): Promise<ComportamientoCrediticio> {
    const { data, error } = await supabase
      .from('comportamiento_crediticio')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('comportamiento_crediticio')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}