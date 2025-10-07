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
    const { data, error } = await supabase.rpc('get_reporte_tributario_deudor_summaries');

    if (error) {
      console.error('Error fetching report summaries:', error);
      throw error;
    }
    return (data as ReporteTributarioDeudorSummary[]) || [];
  }
}