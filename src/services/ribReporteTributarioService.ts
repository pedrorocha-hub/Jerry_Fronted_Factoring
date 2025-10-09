import { supabase } from '@/integrations/supabase/client';

export interface RibReporteTributario {
  id?: string;
  ruc: string;
  proveedor_ruc?: string | null;
  
  // Estado de situación - Activos (Deudor)
  cuentas_por_cobrar_giro_2022?: number | null;
  cuentas_por_cobrar_giro_2023?: number | null;
  cuentas_por_cobrar_giro_2024?: number | null;
  total_activos_2022?: number | null;
  total_activos_2023?: number | null;
  total_activos_2024?: number | null;
  
  // Estado de situación - Pasivos (Deudor)
  cuentas_por_pagar_giro_2022?: number | null;
  cuentas_por_pagar_giro_2023?: number | null;
  cuentas_por_pagar_giro_2024?: number | null;
  total_pasivos_2022?: number | null;
  total_pasivos_2023?: number | null;
  total_pasivos_2024?: number | null;
  
  // Estado de situación - Patrimonio (Deudor)
  capital_pagado_2022?: number | null;
  capital_pagado_2023?: number | null;
  capital_pagado_2024?: number | null;
  total_patrimonio_2022?: number | null;
  total_patrimonio_2023?: number | null;
  total_patrimonio_2024?: number | null;
  total_pasivo_patrimonio_2022?: number | null;
  total_pasivo_patrimonio_2023?: number | null;
  total_pasivo_patrimonio_2024?: number | null;
  
  // Estados de resultados (Deudor)
  ingreso_ventas_2022?: number | null;
  ingreso_ventas_2023?: number | null;
  ingreso_ventas_2024?: number | null;
  utilidad_bruta_2022?: number | null;
  utilidad_bruta_2023?: number | null;
  utilidad_bruta_2024?: number | null;
  utilidad_antes_impuesto_2022?: number | null;
  utilidad_antes_impuesto_2023?: number | null;
  utilidad_antes_impuesto_2024?: number | null;
  
  // Índices financieros (Deudor)
  solvencia_2022?: number | null;
  solvencia_2023?: number | null;
  solvencia_2024?: number | null;
  gestion_2022?: number | null;
  gestion_2023?: number | null;
  gestion_2024?: number | null;
  
  // Estado de situación - Activos (Proveedor)
  cuentas_por_cobrar_giro_2022_proveedor?: number | null;
  cuentas_por_cobrar_giro_2023_proveedor?: number | null;
  cuentas_por_cobrar_giro_2024_proveedor?: number | null;
  total_activos_2022_proveedor?: number | null;
  total_activos_2023_proveedor?: number | null;
  total_activos_2024_proveedor?: number | null;
  
  // Estado de situación - Pasivos (Proveedor)
  cuentas_por_pagar_giro_2022_proveedor?: number | null;
  cuentas_por_pagar_giro_2023_proveedor?: number | null;
  cuentas_por_pagar_giro_2024_proveedor?: number | null;
  total_pasivos_2022_proveedor?: number | null;
  total_pasivos_2023_proveedor?: number | null;
  total_pasivos_2024_proveedor?: number | null;
  
  // Estado de situación - Patrimonio (Proveedor)
  capital_pagado_2022_proveedor?: number | null;
  capital_pagado_2023_proveedor?: number | null;
  capital_pagado_2024_proveedor?: number | null;
  total_patrimonio_2022_proveedor?: number | null;
  total_patrimonio_2023_proveedor?: number | null;
  total_patrimonio_2024_proveedor?: number | null;
  total_pasivo_patrimonio_2022_proveedor?: number | null;
  total_pasivo_patrimonio_2023_proveedor?: number | null;
  total_pasivo_patrimonio_2024_proveedor?: number | null;
  
  // Estados de resultados (Proveedor)
  ingreso_ventas_2022_proveedor?: number | null;
  ingreso_ventas_2023_proveedor?: number | null;
  ingreso_ventas_2024_proveedor?: number | null;
  utilidad_bruta_2022_proveedor?: number | null;
  utilidad_bruta_2023_proveedor?: number | null;
  utilidad_bruta_2024_proveedor?: number | null;
  utilidad_antes_impuesto_2022_proveedor?: number | null;
  utilidad_antes_impuesto_2023_proveedor?: number | null;
  utilidad_antes_impuesto_2024_proveedor?: number | null;
  
  // Índices financieros (Proveedor)
  solvencia_2022_proveedor?: number | null;
  solvencia_2023_proveedor?: number | null;
  solvencia_2024_proveedor?: number | null;
  gestion_2022_proveedor?: number | null;
  gestion_2023_proveedor?: number | null;
  gestion_2024_proveedor?: number | null;
  
  user_id?: string | null;
  status?: 'Borrador' | 'En revisión' | 'Completado';
  created_at?: string;
  updated_at?: string;
}

export interface RibReporteTributarioSummary {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: 'Borrador' | 'En revisión' | 'Completado';
  creator_name: string;
}

export class RibReporteTributarioService {
  static async getByRuc(ruc: string): Promise<RibReporteTributario | null> {
    try {
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
    } catch (error) {
      console.error('Error fetching rib reporte tributario:', error);
      throw error;
    }
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    try {
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
          onConflict: 'ruc',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting rib reporte tributario:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in upsert operation:', error);
      throw error;
    }
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_rib_reporte_tributario_summaries');

      if (error) {
        console.error('Error fetching summaries:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSummaries:', error);
      throw error;
    }
  }

  static async deleteByRuc(ruc: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rib_reporte_tributario')
        .delete()
        .eq('ruc', ruc);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting rib reporte tributario:', error);
      throw error;
    }
  }
}