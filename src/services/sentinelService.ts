import { supabase } from '@/integrations/supabase/client';
import { Sentinel } from '@/types/sentinel';

const TABLE_NAME = 'sentinel';

export const SentinelService = {
  async getAll() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as Sentinel[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data as Sentinel;
  },

  async create(sentinelData: Omit<Sentinel, 'id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ ...sentinelData, user_id: user.id }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Sentinel;
  },

  async update(id: string, sentinelData: Partial<Omit<Sentinel, 'id'>>) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...sentinelData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Sentinel;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },
};