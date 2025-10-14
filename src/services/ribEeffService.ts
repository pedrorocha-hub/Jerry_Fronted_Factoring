import { supabase } from '@/integrations/supabase/client';
import { RibEeff, CreateRibEeffDto, UpdateRibEeffDto } from '@/types/ribEeff';

const TABLE_NAME = 'rib_eeff';

export const RibEeffService = {
  async getAll(): Promise<RibEeff[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getById(id: string): Promise<RibEeff | null> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  },

  async create(dto: CreateRibEeffDto): Promise<RibEeff> {
    const { data, error } = await supabase.from(TABLE_NAME).insert(dto).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, dto: UpdateRibEeffDto): Promise<RibEeff> {
    const { data, error } = await supabase.from(TABLE_NAME).update(dto).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};