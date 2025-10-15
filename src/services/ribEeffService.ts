import { supabase } from '@/integrations/supabase/client';
import { RibEeff, CreateRibEeffDto, UpdateRibEeffDto } from '@/types/rib-eeff';

const TABLE_NAME = 'rib_eeff';

export const RibEeffService = {
  async getAll(): Promise<RibEeff[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getById(id: string): Promise<RibEeff | null> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getByRuc(ruc: string): Promise<RibEeff[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('ruc', ruc);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getBySolicitudId(solicitudId: string): Promise<RibEeff[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('solicitud_id', solicitudId);
    if (error) throw new Error(error.message);
    return data || [];
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

  async deleteBySolicitudId(solicitudId: string): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('solicitud_id', solicitudId);
    if (error) throw new Error(error.message);
  },

  async upsertMultiple(records: Partial<RibEeff>[]): Promise<RibEeff[]> {
    if (records.length === 0) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const solicitudId = records[0].solicitud_id;
    if (!solicitudId) throw new Error('solicitud_id is required for upserting multiple records.');

    // Delete existing records for this solicitud_id
    await this.deleteBySolicitudId(solicitudId);

    // Insert new records
    const recordsToInsert = records.map(record => ({
      ...record,
      user_id: user.id,
      solicitud_id: solicitudId,
    }));

    const { data, error } = await supabase.from(TABLE_NAME).insert(recordsToInsert).select();
    if (error) throw new Error(error.message);
    return data;
  },
};