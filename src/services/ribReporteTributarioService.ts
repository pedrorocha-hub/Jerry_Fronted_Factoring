import { supabase } from '@/integrations/supabase/client';

export interface RibReporteTributarioSummary {
  id: string;
  ruc: string;
  nombre_empresa: string | null;
  updated_at: string;
  status: string;
  creator_name: string | null;
  solicitud_id: string | null;
  anio: number;
}

export interface RibReporteTributario {
  id?: string;
  ruc: string;
  proveedor_ruc?: string | null;
  anio: number;
  tipo_entidad: 'proveedor' | 'deudor';
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
  status?: string;
  solicitud_id?: string | null;
}

export class RibReporteTributarioService {
  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');
    
    if (error) {
      console.error('Error fetching RIB reporte tributario summaries:', error);
      throw new Error(`Error al obtener los reportes: ${error.message}`);
    }
    
    return data || [];
  }

  static async getById(id: string): Promise<RibReporteTributario> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching RIB reporte tributario by ID:', error);
      throw new Error(`Error al obtener el reporte: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Reporte no encontrado');
    }
    
    return data;
  }

  static async create(report: RibReporteTributario): Promise<RibReporteTributario> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .insert({
        ...report,
        user_id: user?.id,
        status: report.status || 'Borrador'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating RIB reporte tributario:', error);
      throw new Error(`Error al crear el reporte: ${error.message}`);
    }
    
    return data;
  }

  static async update(id: string, report: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .update({
        ...report,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating RIB reporte tributario:', error);
      throw new Error(`Error al actualizar el reporte: ${error.message}`);
    }
    
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting RIB reporte tributario:', error);
      throw new Error(`Error al eliminar el reporte: ${error.message}`);
    }
  }
}