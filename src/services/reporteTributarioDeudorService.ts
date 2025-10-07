import { supabase } from '@/integrations/supabase/client';

export interface ReporteTributarioDeudor {
  id: string;
  ruc: string;
  año: number;
  cuentas_por_cobrar_giro?: number | null;
  total_activos?: number | null;
  cuentas_por_pagar_giro?: number | null;
  total_pasivos?: number | null;
  capital_pagado?: number | null;
  total_patrimonio?: number | null;
  total_pasivo_patrimonio?: number | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type ReporteTributarioDeudorInsert = Omit<ReporteTributarioDeudor, 'id' | 'created_at' | 'updated_at'>;

export class ReporteTributarioDeudorService {
  static async getByRuc(ruc: string): Promise<ReporteTributarioDeudor[]> {
    const { data, error } = await supabase
      .from('reporte_tributario_deudor')
      .select('*')
      .eq('ruc', ruc);

    if (error) {
      console.error('Error fetching Reporte Tributario Deudor by RUC:', error);
      throw error;
    }
    return data || [];
  }

  static async upsert(reports: ReporteTributarioDeudorInsert[]): Promise<ReporteTributarioDeudor[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const reportsWithUser = reports.map(report => ({
      ...report,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from('reporte_tributario_deudor')
      .upsert(reportsWithUser, { onConflict: 'ruc,año' })
      .select();

    if (error) {
      console.error('Error upserting Reporte Tributario Deudor:', error);
      throw error;
    }
    return data || [];
  }
}