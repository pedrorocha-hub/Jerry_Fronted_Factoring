import { supabase } from '@/integrations/supabase/client';
import { RibEeff, CreateRibEeffDto, UpdateRibEeffDto } from '@/types/rib-eeff';

const TABLE_NAME = 'rib_eeff';

export const RibEeffService = {
  async getAllSummaries(): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_rib_eeff_summaries');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getById(id: string): Promise<RibEeff[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id);
    if (error) throw new Error(error.message);
    return data || [];
  },

  async upsertMultiple(records: Partial<RibEeff>[]): Promise<RibEeff[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(records, { onConflict: 'id,anio_reporte,tipo_entidad' })
      .select();
      
    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};