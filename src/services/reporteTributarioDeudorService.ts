import { supabase } from '@/integrations/supabase/client';

export interface ReporteTributarioDeudor {
  id: string;
  ruc: string;
  
  cuentas_por_cobrar_giro_2022?: number | null;
  cuentas_por_cobrar_giro_2023?: number | null;
  cuentas_por_cobrar_giro_2024?: number | null;
  
  total_activos_2022?: number | null;
  total_activos_2023?: number | null;
  total_activos_2024?: number | null;
  
  cuentas_por_pagar_giro_2022?: number | null;
  cuentas_por_pagar_giro_2023?: number | null;
  cuentas_por_pagar_giro_2024?: number | null;
  
  total_pasivos_2022?: number | null;
  total_pasivos_2023?: number | null;
  total_pasivos_2024?: number | null;
  
  capital_pagado_2022?: number | null;
  capital_pagado_2023?: number | null;
  capital_pagado_2024?: number | null;
  
  total_patrimonio_2022?: number | null;
  total_patrimonio_2023?: number | null;
  total_patrimonio_2024?: number | null;
  
  total_pasivo_patrimonio_2022?: number | null;
  total_pasivo_patrimonio_2023?: number | null;
  total_pasivo_patrimonio_2024?: number | null;
  
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type ReporteTributarioDeudorInsert = Omit<ReporteTributarioDeudor, 'id' | 'created_at' | 'updated_at'>;

export interface ReporteTributarioDeudorSummary {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
}

export class ReporteTributarioDeudorService {
  static async getByRuc(ruc: string): Promise<ReporteTributarioDeudor | null> {
    const { data, error } = await supabase
      .from('reporte_tributario_deudor')
      .select('*')
      .eq('ruc', ruc)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching Reporte Tributario Deudor by RUC:', error);
      throw error;
    }
    return data;
  }

  static async upsert(report: ReporteTributarioDeudorInsert): Promise<ReporteTributarioDeudor> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const reportWithUser = {
      ...report,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reporte_tributario_deudor')
      .upsert(reportWithUser, { onConflict: 'ruc' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting Reporte Tributario Deudor:', error);
      throw error;
    }
    return data;
  }

  static async getAllSummaries(): Promise<ReporteTributarioDeudorSummary[]> {
    try {
      console.log('Fetching report summaries...');
      
      // Consulta simple y directa
      const { data, error } = await supabase
        .from('reporte_tributario_deudor')
        .select('ruc, updated_at')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching report summaries:', error);
        throw error;
      }

      console.log('Raw data from reporte_tributario_deudor:', data);

      if (!data || data.length === 0) {
        console.log('No reports found in database');
        return [];
      }

      // Para cada RUC, buscar el nombre de la empresa
      const summaries: ReporteTributarioDeudorSummary[] = [];
      
      for (const report of data) {
        try {
          const { data: fichaData, error: fichaError } = await supabase
            .from('ficha_ruc')
            .select('nombre_empresa')
            .eq('ruc', report.ruc)
            .single();

          summaries.push({
            ruc: report.ruc,
            nombre_empresa: fichaData?.nombre_empresa || 'Empresa no encontrada',
            updated_at: report.updated_at
          });
        } catch (fichaError) {
          console.warn(`Could not find ficha for RUC ${report.ruc}:`, fichaError);
          summaries.push({
            ruc: report.ruc,
            nombre_empresa: 'Empresa no encontrada',
            updated_at: report.updated_at
          });
        }
      }

      console.log('Final summaries:', summaries);
      return summaries;

    } catch (error) {
      console.error('Error in getAllSummaries:', error);
      throw error;
    }
  }
}