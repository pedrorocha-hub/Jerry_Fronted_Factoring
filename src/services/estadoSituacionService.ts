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
    console.log('🔍 EstadoSituacionService: Buscando datos para RUC:', ruc);
    
    const result: EstadoSituacionResponse = {
      ruc,
      data_2022: this.createEmptyYearData(2022),
      data_2023: this.createEmptyYearData(2023),
      data_2024: this.createEmptyYearData(2024),
      global_warnings: []
    };

    try {
      // CORRECCIÓN: Buscar en rib_reporte_tributario en vez de reporte_tributario
      const { data: ribData, error: ribError } = await supabase
        .from('rib_reporte_tributario')
        .select('*')
        .eq('ruc', ruc)
        .order('created_at', { ascending: false });

      if (ribError) {
        console.error('❌ Error buscando en rib_reporte_tributario:', ribError);
        result.global_warnings.push('No se pudieron cargar datos previos');
        return result;
      }

      if (!ribData || ribData.length === 0) {
        console.log('ℹ️ No se encontraron datos en rib_reporte_tributario para RUC:', ruc);
        result.global_warnings.push('No hay datos previos. Puede ingresar valores manualmente.');
        return result;
      }

      console.log('✅ Datos encontrados en rib_reporte_tributario:', ribData.length, 'registros');

      // Obtener nombre de empresa del primer registro
      if (ribData[0].nombre_empresa) {
        result.empresa_nombre = ribData[0].nombre_empresa;
      }

      // Procesar datos por año
      const years = [2022, 2023, 2024];
      years.forEach(year => {
        // Buscar registro para este año
        const yearRecord = ribData.find(r => r.anio === year);
        
        if (yearRecord) {
          const yearData = this.processYearDataFromRib(year, yearRecord);
          
          if (year === 2022) result.data_2022 = yearData;
          else if (year === 2023) result.data_2023 = yearData;
          else if (year === 2024) result.data_2024 = yearData;
        }
      });

    } catch (error) {
      console.error('❌ Error inesperado en getEstadoSituacion:', error);
      result.global_warnings.push('Error al cargar datos');
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

  private static processYearDataFromRib(year: number, data: any): EstadoSituacionData {
    const yearData: EstadoSituacionData = {
      year,
      cuentas_por_cobrar_del_giro: data[`cuentas_por_cobrar_giro_${year}`] || null,
      total_activos: data[`total_activos_${year}`] || null,
      cuentas_por_pagar_del_giro: data[`cuentas_por_pagar_giro_${year}`] || null,
      total_patrimonio: data[`total_patrimonio_${year}`] || null,
      capital_pagado: data[`capital_pagado_${year}`] || null,
      total_pasivos: data[`total_pasivos_${year}`] || null,
      total_pasivo_y_patrimonio: data[`total_pasivo_patrimonio_${year}`] || null,
      warnings: []
    };

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