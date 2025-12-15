import { supabase } from '@/integrations/supabase/client';

export interface BalanceData {
  cuentas_por_cobrar_del_giro: number | null;
  total_activos: number | null;
  cuentas_por_pagar_del_giro: number | null;
  total_pasivos: number | null;
  capital_pagado: number | null;
  total_patrimonio: number | null;
  total_pasivo_y_patrimonio: number | null;
  ingreso_ventas: number | null;
  utilidad_bruta: number | null;
  utilidad_antes_impuesto: number | null;
  solvencia: number | null;
  gestion: number | null;
  warnings: string[];
}

export interface EstadoSituacionResponse {
  empresa_nombre: string | null;
  data_2022: BalanceData;
  data_2023: BalanceData;
  data_2024: BalanceData;
  global_warnings: string[];
}

export class EstadoSituacionService {
  static async getEstadoSituacion(ruc: string): Promise<EstadoSituacionResponse> {
    const global_warnings: string[] = [];
    
    try {
      const { data: reportes, error } = await supabase
        .from('reporte_tributario')
        .select(`
          anio_reporte,
          razon_social,
          renta_cuentas_por_cobrar_comerciales_terceros,
          renta_total_activos_netos,
          renta_total_cuentas_por_pagar,
          renta_total_patrimonio,
          renta_capital_social,
          renta_ingresos_netos,
          renta_resultado_bruto,
          renta_resultado_antes_participaciones
        `)
        .eq('ruc', ruc)
        .in('anio_reporte', [2022, 2023, 2024])
        .order('anio_reporte', { ascending: true });

      if (error) {
        console.error('Error buscando en reporte_tributario:', error);
        throw error;
      }

      if (!reportes || reportes.length === 0) {
        return this.getEmptyResponse();
      }

      const reportesPorAnio = new Map<number, any>();
      reportes.forEach(reporte => {
        reportesPorAnio.set(reporte.anio_reporte, reporte);
      });

      const empresa_nombre = reportes[0]?.razon_social || null;

      const convertirReporte = (reporte: any, anio: number): BalanceData => {
        if (!reporte) {
          return this.getEmptyBalanceData();
        }

        const warnings: string[] = [];

        const total_pasivos = reporte.renta_total_cuentas_por_pagar || 0;
        const total_patrimonio = reporte.renta_total_patrimonio || 0;
        const total_pasivo_y_patrimonio = total_pasivos + total_patrimonio;

        const total_activos = reporte.renta_total_activos_netos || 0;
        if (total_activos > 0 && total_pasivo_y_patrimonio > 0) {
          const diferencia = Math.abs(total_activos - total_pasivo_y_patrimonio);
          const porcentaje_diferencia = (diferencia / total_activos) * 100;
          
          if (porcentaje_diferencia > 0.1) {
            warnings.push(
              `Año ${anio}: Activos (${this.formatCurrency(total_activos)}) ≠ Pasivo+Patrimonio (${this.formatCurrency(total_pasivo_y_patrimonio)}). Diferencia: ${this.formatCurrency(diferencia)}`
            );
          }
        }

        const solvencia = total_pasivos > 0 ? total_patrimonio / total_pasivos : null;
        const gestion = total_activos > 0 && reporte.renta_ingresos_netos 
          ? reporte.renta_ingresos_netos / total_activos 
          : null;

        return {
          cuentas_por_cobrar_del_giro: reporte.renta_cuentas_por_cobrar_comerciales_terceros,
          total_activos: reporte.renta_total_activos_netos,
          cuentas_por_pagar_del_giro: reporte.renta_total_cuentas_por_pagar,
          total_pasivos: reporte.renta_total_cuentas_por_pagar,
          capital_pagado: reporte.renta_capital_social,
          total_patrimonio: reporte.renta_total_patrimonio,
          total_pasivo_y_patrimonio,
          ingreso_ventas: reporte.renta_ingresos_netos,
          utilidad_bruta: reporte.renta_resultado_bruto,
          utilidad_antes_impuesto: reporte.renta_resultado_antes_participaciones,
          solvencia,
          gestion,
          warnings
        };
      };

      return {
        empresa_nombre,
        data_2022: convertirReporte(reportesPorAnio.get(2022), 2022),
        data_2023: convertirReporte(reportesPorAnio.get(2023), 2023),
        data_2024: convertirReporte(reportesPorAnio.get(2024), 2024),
        global_warnings
      };

    } catch (error) {
      console.error('Error en getEstadoSituacion:', error);
      throw error;
    }
  }

  private static getEmptyBalanceData(): BalanceData {
    return {
      cuentas_por_cobrar_del_giro: null,
      total_activos: null,
      cuentas_por_pagar_del_giro: null,
      total_pasivos: null,
      capital_pagado: null,
      total_patrimonio: null,
      total_pasivo_y_patrimonio: null,
      ingreso_ventas: null,
      utilidad_bruta: null,
      utilidad_antes_impuesto: null,
      solvencia: null,
      gestion: null,
      warnings: []
    };
  }

  private static getEmptyResponse(): EstadoSituacionResponse {
    return {
      empresa_nombre: null,
      data_2022: this.getEmptyBalanceData(),
      data_2023: this.getEmptyBalanceData(),
      data_2024: this.getEmptyBalanceData(),
      global_warnings: ['No se encontraron reportes tributarios previos. Puede ingresar valores manualmente.']
    };
  }

  private static formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}