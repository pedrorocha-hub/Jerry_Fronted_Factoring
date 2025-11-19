import { supabase } from '@/integrations/supabase/client';

export interface EstadoSituacionData {
  year: number;
  cuentas_por_cobrar_del_giro: number | null;
  total_activos: number | null;
  cuentas_por_pagar_del_giro: number | null;
  total_patrimonio: number | null;
  capital_pagado: number | null;
  total_pasivos: number | null;
  total_pasivo_y_patrimonio: number | null;
  warnings: string[];
}

export interface EstadoSituacionResponse {
  ruc: string;
  empresa_nombre?: string;
  data_2022: EstadoSituacionData;
  data_2023: EstadoSituacionData;
  data_2024: EstadoSituacionData;
  global_warnings: string[];
}

export class EstadoSituacionService {
  static async getEstadoSituacion(ruc: string): Promise<EstadoSituacionResponse> {
    const years = [2022, 2023, 2024];
    const result: EstadoSituacionResponse = {
      ruc,
      data_2022: this.createEmptyYearData(2022),
      data_2023: this.createEmptyYearData(2023),
      data_2024: this.createEmptyYearData(2024),
      global_warnings: []
    };

    // Obtener datos para cada año
    for (const year of years) {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select(`
          anio_reporte,
          razon_social,
          renta_cuentas_por_cobrar_comerciales_terceros,
          renta_total_activos_netos,
          renta_total_cuentas_por_pagar,
          renta_total_patrimonio,
          renta_capital_social
        `)
        .eq('ruc', ruc)
        .eq('anio_reporte', year)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Error diferente a "no encontrado"
        console.error(`Error obteniendo datos para ${year}:`, error);
        result.global_warnings.push(`Error obteniendo datos para ${year}: ${error.message}`);
        continue;
      }

      if (!data) {
        // No existe registro para este año, mantener valores null
        continue;
      }

      // Establecer nombre de empresa si no lo tenemos
      if (!result.empresa_nombre && data.razon_social) {
        result.empresa_nombre = data.razon_social;
      }

      // Procesar datos del año
      const yearData = this.processYearData(year, data);
      
      if (year === 2022) result.data_2022 = yearData;
      else if (year === 2023) result.data_2023 = yearData;
      else if (year === 2024) result.data_2024 = yearData;
    }

    return result;
  }

  private static createEmptyYearData(year: number): EstadoSituacionData {
    return {
      year,
      cuentas_por_cobrar_del_giro: null,
      total_activos: null,
      cuentas_por_pagar_del_giro: null,
      total_patrimonio: null,
      capital_pagado: null,
      total_pasivos: null,
      total_pasivo_y_patrimonio: null,
      warnings: []
    };
  }

  private static processYearData(year: number, data: any): EstadoSituacionData {
    const yearData: EstadoSituacionData = {
      year,
      cuentas_por_cobrar_del_giro: data.renta_cuentas_por_cobrar_comerciales_terceros,
      total_activos: data.renta_total_activos_netos,
      cuentas_por_pagar_del_giro: data.renta_total_cuentas_por_pagar,
      total_patrimonio: data.renta_total_patrimonio,
      capital_pagado: data.renta_capital_social,
      total_pasivos: null,
      total_pasivo_y_patrimonio: null,
      warnings: []
    };

    // Calcular total_pasivos = total_activos - total_patrimonio
    if (yearData.total_activos !== null && yearData.total_patrimonio !== null) {
      yearData.total_pasivos = yearData.total_activos - yearData.total_patrimonio;
      
      if (yearData.total_pasivos < 0) {
        yearData.warnings.push(`Total pasivos negativo en ${year}: ${yearData.total_pasivos}`);
      }
    }

    // Calcular total_pasivo_y_patrimonio = total_pasivos + total_patrimonio
    if (yearData.total_pasivos !== null && yearData.total_patrimonio !== null) {
      yearData.total_pasivo_y_patrimonio = yearData.total_pasivos + yearData.total_patrimonio;
    }

    // Validación contable: total_pasivo_y_patrimonio debe ser igual a total_activos (±1)
    if (yearData.total_pasivo_y_patrimonio !== null && yearData.total_activos !== null) {
      const diferencia = Math.abs(yearData.total_pasivo_y_patrimonio - yearData.total_activos);
      if (diferencia > 1) {
        yearData.warnings.push(`No cuadra con total_activos (año ${year}). Diferencia: ${diferencia}`);
      }
    }

    return yearData;
  }
}