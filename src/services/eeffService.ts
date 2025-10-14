import { supabase } from '@/integrations/supabase/client';
import { Eeff } from '@/types/eeff';

const TABLE_NAME = 'eeff';

export const EeffService = {
  async getByRuc(ruc: string): Promise<Eeff[]> {
    if (!ruc) return [];
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('ruc', ruc)
      .order('anio_reporte', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  },
};