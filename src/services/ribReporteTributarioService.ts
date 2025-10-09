import { supabase } from '@/integrations/supabase/client';

export type RibReporteTributarioStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface RibReporteTributario {
  id: string;
  ruc: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  status: RibReporteTributarioStatus;
  validado_por?: string;

  // Campos del deudor - Estado de situación
  cuentas_por_cobrar_giro_2022?: number;
  cuentas_por_cobrar_giro_2023?: number;
  cuentas_por_cobrar_giro_2024?: number;
  total_activos_2022?: number;
  total_activos_2023?: number;
  total_activos_2024?: number;
  cuentas_por_pagar_giro_2022?: number;
  cuentas_por_pagar_giro_2023?: number;
  cuentas_por_pagar_giro_2024?: number;
  total_pasivos_2022?: number;
  total_pasivos_2023?: number;
  total_pasivos_2024?: number;
  capital_pagado_2022?: number;
  capital_pagado_2023?: number;
  capital_pagado_2024?: number;
  total_patrimonio_2022?: number;
  total_patrimonio_2023?: number;
  total_patrimonio_2024?: number;
  total_pasivo_patrimonio_2022?: number;
  total_pasivo_patrimonio_2023?: number;
  total_pasivo_patrimonio_2024?: number;

  // Estados de resultados
  ingreso_ventas_2022?: number;
  ingreso_ventas_2023?: number;
  ingreso_ventas_2024?: number;
  utilidad_bruta_2022?: number;
  utilidad_bruta_2023?: number;
  utilidad_bruta_2024?: number;
  utilidad_antes_impuesto_2022?: number;
  utilidad_antes_impuesto_2023?: number;
  utilidad_antes_impuesto_2024?: number;

  // Índices financieros
  solvencia_2022?: number;
  solvencia_2023?: number;
  solvencia_2024?: number;
  gestion_2022?: number;
  gestion_2023?: number;
  gestion_2024?: number;

  // Campos del proveedor - Estado de situación
  cuentas_por_cobrar_giro_2022_proveedor?: number;
  cuentas_por_cobrar_giro_2023_proveedor?: number;
  cuentas_por_cobrar_giro_2024_proveedor?: number;
  total_activos_2022_proveedor?: number;
  total_activos_2023_proveedor?: number;
  total_activos_2024_proveedor?: number;
  cuentas_por_pagar_giro_2022_proveedor?: number;
  cuentas_por_pagar_giro_2023_proveedor?: number;
  cuentas_por_pagar_giro_2024_proveedor?: number;
  total_pasivos_2022_proveedor?: number;
  total_pasivos_2023_proveedor?: number;
  total_pasivos_2024_proveedor?: number;
  capital_pagado_2022_proveedor?: number;
  capital_pagado_2023_proveedor?: number;
  capital_pagado_2024_proveedor?: number;
  total_patrimonio_2022_proveedor?: number;
  total_patrimonio_2023_proveedor?: number;
  total_patrimonio_2024_proveedor?: number;
  total_pasivo_patrimonio_2022_proveedor?: number;
  total_pasivo_patrimonio_2023_proveedor?: number;
  total_pasivo_patrimonio_2024_proveedor?: number;

  // Estados de resultados proveedor
  ingreso_ventas_2022_proveedor?: number;
  ingreso_ventas_2023_proveedor?: number;
  ingreso_ventas_2024_proveedor?: number;
  utilidad_bruta_2022_proveedor?: number;
  utilidad_bruta_2023_proveedor?: number;
  utilidad_bruta_2024_proveedor?: number;
  utilidad_antes_impuesto_2022_proveedor?: number;
  utilidad_antes_impuesto_2023_proveedor?: number;
  utilidad_antes_impuesto_2024_proveedor?: number;

  // Índices financieros proveedor
  solvencia_2022_proveedor?: number;
  solvencia_2023_proveedor?: number;
  solvencia_2024_proveedor?: number;
  gestion_2022_proveedor?: number;
  gestion_2023_proveedor?: number;
  gestion_2024_proveedor?: number;

  // RUC del proveedor
  proveedor_ruc?: string;
}

export interface RibReporteTributarioSummary {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: RibReporteTributarioStatus;
  creator_name: string;
}

export class RibReporteTributarioService {
  static async getByRuc(ruc: string): Promise<RibReporteTributario | null> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('ruc', ruc)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw error;
    }

    return data;
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const dataToUpsert = {
      ...reportData,
      user_id: user?.id,
      updated_at: new Date().toISOString(),
    };

    // Si no tiene ID, es una inserción
    if (!reportData.id) {
      dataToUpsert.created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .upsert(dataToUpsert, {
        onConflict: 'ruc'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting RIB reporte:', error);
      throw error;
    }

    return data;
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');

    if (error) {
      console.error('Error fetching RIB summaries:', error);
      throw error;
    }

    return data || [];
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}