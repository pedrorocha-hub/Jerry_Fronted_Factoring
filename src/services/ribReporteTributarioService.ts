import { supabase } from '@/integrations/supabase/client';

export type Status = 'Borrador' | 'En revisión' | 'Completado';

export interface RibReporteTributario {
  id?: string;
  ruc: string;
  user_id?: string;
  status?: Status;
  created_at?: string;
  updated_at?: string;
  
  // Deudor - Estado de situación
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

  // Deudor - Estados de resultados
  ingreso_ventas_2022?: number;
  ingreso_ventas_2023?: number;
  ingreso_ventas_2024?: number;
  utilidad_bruta_2022?: number;
  utilidad_bruta_2023?: number;
  utilidad_bruta_2024?: number;
  utilidad_antes_impuesto_2022?: number;
  utilidad_antes_impuesto_2023?: number;
  utilidad_antes_impuesto_2024?: number;

  // Deudor - Índices financieros
  solvencia_2022?: number;
  solvencia_2023?: number;
  solvencia_2024?: number;
  gestion_2022?: number;
  gestion_2023?: number;
  gestion_2024?: number;

  // Proveedor - Estado de situación
  proveedor_ruc?: string;
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

  // Proveedor - Estados de resultados
  ingreso_ventas_2022_proveedor?: number;
  ingreso_ventas_2023_proveedor?: number;
  ingreso_ventas_2024_proveedor?: number;
  utilidad_bruta_2022_proveedor?: number;
  utilidad_bruta_2023_proveedor?: number;
  utilidad_bruta_2024_proveedor?: number;
  utilidad_antes_impuesto_2022_proveedor?: number;
  utilidad_antes_impuesto_2023_proveedor?: number;
  utilidad_antes_impuesto_2024_proveedor?: number;

  // Proveedor - Índices financieros
  solvencia_2022_proveedor?: number;
  solvencia_2023_proveedor?: number;
  solvencia_2024_proveedor?: number;
  gestion_2022_proveedor?: number;
  gestion_2023_proveedor?: number;
  gestion_2024_proveedor?: number;
}

export interface RibReporteTributarioSummary {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: Status;
  creator_name: string;
}

export interface EstadoSituacionAnio {
  cuentas_por_cobrar_del_giro: number | null;
  total_activos: number | null;
  cuentas_por_pagar_del_giro: number | null;
  total_pasivos: number | null;
  capital_pagado: number | null;
  total_patrimonio: number | null;
  total_pasivo_y_patrimonio: number | null;
  warning?: string;
}

export interface EstadoSituacionCompleto {
  ruc: string;
  data_2022: EstadoSituacionAnio | null;
  data_2023: EstadoSituacionAnio | null;
  data_2024: EstadoSituacionAnio | null;
  success: boolean;
  message: string;
}

export class RibReporteTributarioService {
  static async getAll(): Promise<RibReporteTributario[]> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase
      .rpc('get_rib_reporte_tributario_summaries');

    if (error) throw error;
    return data || [];
  }

  static async getByRuc(ruc: string): Promise<RibReporteTributario | null> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('ruc', ruc)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const dataToUpsert = {
      ...reportData,
      user_id: user?.id,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .upsert(dataToUpsert, { 
        onConflict: 'ruc',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Nueva función para completar estado de situación desde reporte tributario
  static async completarEstadoSituacion(ruc: string): Promise<EstadoSituacionCompleto> {
    try {
      const response = await supabase.functions.invoke('completar-estado-situacion', {
        body: { ruc_input: ruc }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error invocando función');
      }

      return response.data;
    } catch (error) {
      console.error('Error completando estado de situación:', error);
      throw error;
    }
  }

  // Función para aplicar los datos del estado de situación al reporte RIB
  static async aplicarEstadoSituacion(ruc: string, estadoSituacion: EstadoSituacionCompleto): Promise<RibReporteTributario> {
    const reporteActual = await this.getByRuc(ruc);
    
    const datosActualizados: Partial<RibReporteTributario> = {
      ...reporteActual,
      ruc
    };

    // Aplicar datos del 2022
    if (estadoSituacion.data_2022) {
      const data = estadoSituacion.data_2022;
      datosActualizados.cuentas_por_cobrar_giro_2022 = data.cuentas_por_cobrar_del_giro;
      datosActualizados.total_activos_2022 = data.total_activos;
      datosActualizados.cuentas_por_pagar_giro_2022 = data.cuentas_por_pagar_del_giro;
      datosActualizados.total_pasivos_2022 = data.total_pasivos;
      datosActualizados.capital_pagado_2022 = data.capital_pagado;
      datosActualizados.total_patrimonio_2022 = data.total_patrimonio;
      datosActualizados.total_pasivo_patrimonio_2022 = data.total_pasivo_y_patrimonio;
    }

    // Aplicar datos del 2023
    if (estadoSituacion.data_2023) {
      const data = estadoSituacion.data_2023;
      datosActualizados.cuentas_por_cobrar_giro_2023 = data.cuentas_por_cobrar_del_giro;
      datosActualizados.total_activos_2023 = data.total_activos;
      datosActualizados.cuentas_por_pagar_giro_2023 = data.cuentas_por_pagar_del_giro;
      datosActualizados.total_pasivos_2023 = data.total_pasivos;
      datosActualizados.capital_pagado_2023 = data.capital_pagado;
      datosActualizados.total_patrimonio_2023 = data.total_patrimonio;
      datosActualizados.total_pasivo_patrimonio_2023 = data.total_pasivo_y_patrimonio;
    }

    // Aplicar datos del 2024
    if (estadoSituacion.data_2024) {
      const data = estadoSituacion.data_2024;
      datosActualizados.cuentas_por_cobrar_giro_2024 = data.cuentas_por_cobrar_del_giro;
      datosActualizados.total_activos_2024 = data.total_activos;
      datosActualizados.cuentas_por_pagar_giro_2024 = data.cuentas_por_pagar_del_giro;
      datosActualizados.total_pasivos_2024 = data.total_pasivos;
      datosActualizados.capital_pagado_2024 = data.capital_pagado;
      datosActualizados.total_patrimonio_2024 = data.total_patrimonio;
      datosActualizados.total_pasivo_patrimonio_2024 = data.total_pasivo_y_patrimonio;
    }

    return await this.upsert(datosActualizados);
  }
}