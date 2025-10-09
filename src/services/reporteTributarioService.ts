import { supabase } from '@/integrations/supabase/client';
import { ReporteTributario } from '@/types/reporteTributario';

export class ReporteTributarioService {
  static async getByRucAndYear(ruc: string, year: number): Promise<ReporteTributario | null> {
    const { data, error } = await supabase
      .from('reporte_tributario')
      .select('*')
      .eq('ruc', ruc)
      .eq('anio_reporte', year)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching reporte tributario:', error);
      throw error;
    }
    return data;
  }

  static async getReportesByRuc(ruc: string): Promise<ReporteTributario[]> {
    const { data, error } = await supabase
      .from('reporte_tributario')
      .select('*')
      .eq('ruc', ruc);

    if (error) {
      console.error('Error fetching reportes tributarios by RUC:', error);
      throw error;
    }
    return data || [];
  }

  static async saveReporte(reporte: Partial<ReporteTributario>): Promise<ReporteTributario> {
    const { data, error } = await supabase
      .from('reporte_tributario')
      .upsert(reporte, { onConflict: 'ruc, anio_reporte' })
      .select()
      .single();

    if (error) {
      console.error('Error saving reporte tributario:', error);
      throw error;
    }
    return data;
  }
}