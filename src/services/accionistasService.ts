import { supabase } from '@/integrations/supabase/client';
import { Accionista } from '@/types/accionista';

export const AccionistasService = {
  async getByRuc(ruc: string): Promise<Accionista[]> {
    const { data, error } = await supabase
      .from('accionistas')
      .select('*')
      .eq('ruc', ruc);

    if (error) {
      console.error('Error fetching accionistas:', error);
      throw new Error('Could not fetch accionistas.');
    }

    return data || [];
  },
};