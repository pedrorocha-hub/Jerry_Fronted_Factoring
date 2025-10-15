import supabase from '@/integrations/supabase/client';

export interface RibReporteTributarioSummary {
  id: string;
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: string | null;
  creator_name: string | null;
  solicitud_id?: string | null;
}

export const RibReporteTributarioService = {
  async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');

    if (error) {
      console.error('Error fetching RIB Reporte Tributario summaries:', error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting RIB Reporte Tributario:', error);
      throw new Error(error.message);
    }
  },
};