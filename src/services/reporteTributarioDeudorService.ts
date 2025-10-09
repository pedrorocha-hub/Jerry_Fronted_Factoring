import { supabase } from '@/integrations/supabase/client';

export interface ReporteTributarioDeudor {
  id?: string;
  ruc: string;
  // Estado de situación - Activos
  cuentas_por_cobrar_giro_2022?: number | null;
  cuentas_por_cobrar_giro_2023?: number | null;
  cuentas_por_cobrar_giro_2024?: number | null;
  total_activos_2022?: number | null;
  total_activos_2023?: number | null;
  total_activos_2024?: number | null;
  
  // Estado de situación - Pasivos
  cuentas_por_pagar_giro_2022?: number | null;
  cuentas_por_pagar_giro_2023?: number | null;
  cuentas_por_pagar_giro_2024?: number | null;
  total_pasivos_2022?: number | null;
  total_pasivos_2023?: number | null;
  total_pasivos_2024?: number | null;
  
  // Estado de situación - Patrimonio
  capital_pagado_2022?: number | null;
  capital_pagado_2023?: number | null;
  capital_pagado_2024?: number | null;
  total_patrimonio_2022?: number | null;
  total_patrimonio_2023?: number | null;
  total_patrimonio_2024?: number | null;
  total_pasivo_patrimonio_2022?: number | null;
  total_pasivo_patrimonio_2023?: number | null;
  total_pasivo_patrimonio_2024?: number | null;
  
  // Estados de resultados - NUEVOS CAMPOS
  ingreso_ventas_2022?: number | null;
  ingreso_ventas_2023?: number | null;
  ingreso_ventas_2024?: number | null;
  utilidad_bruta_2022?: number | null;
  utilidad_bruta_2023?: number | null;
  utilidad_bruta_2024?: number | null;
  utilidad_antes_impuesto_2022?: number | null;
  utilidad_antes_impuesto_2023?: number | null;
  utilidad_antes_impuesto_2024?: number | null;
  
  user_id?: string | null;
  status?: 'Borrador' | 'En revisión' | 'Completado';
  created_at?: string;
  updated_at?: string;
}

export interface ReporteTributarioDeudorSummary {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: 'Borrador' | 'En revisión' | 'Completado';
  creator_name: string;
}

export class ReporteTributarioDeudorService {
  static async getByRuc(ruc: string): Promise<ReporteTributarioDeudor | null> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario_deudor')
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
      console.error('Error fetching reporte tributario deudor:', error);
      throw error;
    }
  }

  static async upsert(reportData: Partial<ReporteTributarioDeudor>): Promise<ReporteTributarioDeudor> {
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
        .from('reporte_tributario_deudor')
        .upsert(dataToUpsert, {
          onConflict: 'ruc',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting reporte tributario deudor:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in upsert operation:', error);
      throw error;
    }
  }

  static async getAllSummaries(): Promise<ReporteTributarioDeudorSummary[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_reporte_tributario_deudor_summaries');

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
        .from('reporte_tributario_deudor')
        .delete()
        .eq('ruc', ruc);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting reporte tributario deudor:', error);
      throw error;
    }
  }
}