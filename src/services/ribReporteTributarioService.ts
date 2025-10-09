import { supabase } from '@/integrations/supabase/client';

export type RibReporteTributarioStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface RibReporteTributario {
  id?: string;
  ruc: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: RibReporteTributarioStatus;
  validado_por?: string;

  // Campos del deudor - Estado de situación
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

  // Estados de resultados
  ingreso_ventas_2022?: number | null;
  ingreso_ventas_2023?: number | null;
  ingreso_ventas_2024?: number | null;
  utilidad_bruta_2022?: number | null;
  utilidad_bruta_2023?: number | null;
  utilidad_bruta_2024?: number | null;
  utilidad_antes_impuesto_2022?: number | null;
  utilidad_antes_impuesto_2023?: number | null;
  utilidad_antes_impuesto_2024?: number | null;

  // Índices financieros
  solvencia_2022?: number | null;
  solvencia_2023?: number | null;
  solvencia_2024?: number | null;
  gestion_2022?: number | null;
  gestion_2023?: number | null;
  gestion_2024?: number | null;

  // Campos del proveedor - Estado de situación
  cuentas_por_cobrar_giro_2022_proveedor?: number | null;
  cuentas_por_cobrar_giro_2023_proveedor?: number | null;
  cuentas_por_cobrar_giro_2024_proveedor?: number | null;
  total_activos_2022_proveedor?: number | null;
  total_activos_2023_proveedor?: number | null;
  total_activos_2024_proveedor?: number | null;
  cuentas_por_pagar_giro_2022_proveedor?: number | null;
  cuentas_por_pagar_giro_2023_proveedor?: number | null;
  cuentas_por_pagar_giro_2024_proveedor?: number | null;
  total_pasivos_2022_proveedor?: number | null;
  total_pasivos_2023_proveedor?: number | null;
  total_pasivos_2024_proveedor?: number | null;
  capital_pagado_2022_proveedor?: number | null;
  capital_pagado_2023_proveedor?: number | null;
  capital_pagado_2024_proveedor?: number | null;
  total_patrimonio_2022_proveedor?: number | null;
  total_patrimonio_2023_proveedor?: number | null;
  total_patrimonio_2024_proveedor?: number | null;
  total_pasivo_patrimonio_2022_proveedor?: number | null;
  total_pasivo_patrimonio_2023_proveedor?: number | null;
  total_pasivo_patrimonio_2024_proveedor?: number | null;

  // Estados de resultados proveedor
  ingreso_ventas_2022_proveedor?: number | null;
  ingreso_ventas_2023_proveedor?: number | null;
  ingreso_ventas_2024_proveedor?: number | null;
  utilidad_bruta_2022_proveedor?: number | null;
  utilidad_bruta_2023_proveedor?: number | null;
  utilidad_bruta_2024_proveedor?: number | null;
  utilidad_antes_impuesto_2022_proveedor?: number | null;
  utilidad_antes_impuesto_2023_proveedor?: number | null;
  utilidad_antes_impuesto_2024_proveedor?: number | null;

  // Índices financieros proveedor
  solvencia_2022_proveedor?: number | null;
  solvencia_2023_proveedor?: number | null;
  solvencia_2024_proveedor?: number | null;
  gestion_2022_proveedor?: number | null;
  gestion_2023_proveedor?: number | null;
  gestion_2024_proveedor?: number | null;

  // RUC del proveedor
  proveedor_ruc?: string;

  // Campos adicionales que pueden existir
  [key: string]: any;
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
    console.log('Guardando datos RIB:', reportData); // Debug
    
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

    console.log('Datos a guardar:', dataToUpsert); // Debug

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

    console.log('Datos guardados exitosamente:', data); // Debug
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