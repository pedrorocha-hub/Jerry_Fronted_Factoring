import { supabase } from '@/integrations/supabase/client';
import { ProfileService } from './profileService';

export type RibReporteTributario = {
  id: string;
  ruc: string;
  proveedor_ruc?: string | null;
  anio: number;
  tipo_entidad: string;
  cuentas_por_cobrar_giro?: number | null;
  total_activos?: number | null;
  cuentas_por_pagar_giro?: number | null;
  total_pasivos?: number | null;
  capital_pagado?: number | null;
  total_patrimonio?: number | null;
  total_pasivo_patrimonio?: number | null;
  ingreso_ventas?: number | null;
  utilidad_bruta?: number | null;
  utilidad_antes_impuesto?: number | null;
  solvencia?: number | null;
  gestion?: number | null;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: 'Borrador' | 'En revisión' | 'Completado';
};

export type RibReporteTributarioSummary = {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: 'Borrador' | 'En revisión' | 'Completado';
  creator_name: string;
};

export class RibReporteTributarioService {
  static async getReportsByRuc(ruc: string): Promise<RibReporteTributario[]> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('ruc', ruc)
      .order('anio', { ascending: true });

    if (error) {
      console.error('Error fetching RIB reports by RUC:', error);
      throw error;
    }
    return data || [];
  }

  static async upsertMultiple(reports: Partial<RibReporteTributario>[]): Promise<RibReporteTributario[]> {
    const { user } = await ProfileService.getAuthenticatedUser();
    if (!user) throw new Error('Usuario no autenticado');

    const dataToUpsert = reports.map(report => ({
      ...report,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .upsert(dataToUpsert, { onConflict: 'ruc,anio' })
      .select();

    if (error) {
      console.error('Error upserting multiple RIB reports:', error);
      throw error;
    }
    return data || [];
  }

  static async delete(ruc: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('ruc', ruc);

    if (error) {
      console.error('Error deleting RIB report:', error);
      throw error;
    }
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');

    if (error) {
      console.error('Error fetching RIB report summaries:', error);
      throw error;
    }
    return data || [];
  }
}