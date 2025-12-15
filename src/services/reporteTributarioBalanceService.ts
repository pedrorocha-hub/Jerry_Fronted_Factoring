import { supabase } from '@/integrations/supabase/client';

export interface ReporteTributarioBalanceData {
  empresa_nombre: string | null;
  balance_2022: {
    cuentas_por_cobrar_comerciales_terceros: number | null;
    total_activos_netos: number | null;
    total_cuentas_por_pagar: number | null;
    total_pasivos: number | null;
    capital_social: number | null;
    total_patrimonio: number | null;
    total_pasivo_patrimonio: number | null;
  };
  balance_2023: {
    cuentas_por_cobrar_comerciales_terceros: number | null;
    total_activos_netos: number | null;
    total_cuentas_por_pagar: number | null;
    total_pasivos: number | null;
    capital_social: number | null;
    total_patrimonio: number | null;
    total_pasivo_patrimonio: number | null;
  };
  balance_2024: {
    cuentas_por_cobrar_comerciales_terceros: number | null;
    total_activos_netos: number | null;
    total_cuentas_por_pagar: number | null;
    total_pasivos: number | null;
    capital_social: number | null;
    total_patrimonio: number | null;
    total_pasivo_patrimonio: number | null;
  };
  warnings: string[];
}

export class ReporteTributarioBalanceService {
  /**
   * Obtiene datos de balance desde reporte_tributario
   */
  static async getBalanceData(ruc: string): Promise<ReporteTributarioBalanceData> {
    const warnings: string[] = [];
    
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
          renta_capital_social
        `)
        .eq('ruc', ruc)
        .in('anio_reporte', [2022, 2023, 2024])
        .order('anio_reporte', { ascending: true });

      if (error) {
        console.error('Error buscando en reporte_tributario:', error);
        warnings.push('Error al buscar datos previos');
      }

      if (!reportes || reportes.length === 0) {
        return {
          empresa_nombre: null,
          balance_2022: {
            cuentas_por_cobrar_comerciales_terceros: null,
            total_activos_netos: null,
            total_cuentas_por_pagar: null,
            total_pasivos: null,
            capital_social: null,
            total_patrimonio: null,
            total_pasivo_patrimonio: null,
          },
          balance_2023: {
            cuentas_por_cobrar_comerciales_terceros: null,
            total_activos_netos: null,
            total_cuentas_por_pagar: null,
            total_pasivos: null,
            capital_social: null,
            total_patrimonio: null,
            total_pasivo_patrimonio: null,
          },
          balance_2024: {
            cuentas_por_cobrar_comerciales_terceros: null,
            total_activos_netos: null,
            total_cuentas_por_pagar: null,
            total_pasivos: null,
            capital_social: null,
            total_patrimonio: null,
            total_pasivo_patrimonio: null,
          },
          warnings: ['No se encontraron reportes tributarios previos. Puede ingresar valores manualmente.']
        };
      }

      const reportesPorAnio = new Map<number, any>();
      reportes.forEach(reporte => {
        reportesPorAnio.set(reporte.anio_reporte, reporte);
      });

      const empresa_nombre = reportes[0]?.razon_social || null;

      const convertirReporte = (reporte: any) => {
        if (!reporte) {
          return {
            cuentas_por_cobrar_comerciales_terceros: null,
            total_activos_netos: null,
            total_cuentas_por_pagar: null,
            total_pasivos: null,
            capital_social: null,
            total_patrimonio: null,
            total_pasivo_patrimonio: null,
          };
        }

        const total_pasivos = reporte.renta_total_cuentas_por_pagar || 0;
        const total_patrimonio = reporte.renta_total_patrimonio || 0;
        const total_pasivo_patrimonio = total_pasivos + total_patrimonio;

        const total_activos = reporte.renta_total_activos_netos || 0;
        if (total_activos > 0 && total_pasivo_patrimonio > 0) {
          const diferencia = Math.abs(total_activos - total_pasivo_patrimonio);
          if (diferencia > 1) {
            warnings.push(
              `Año ${reporte.anio_reporte}: Activos (${total_activos.toLocaleString()}) ≠ Pasivo+Patrimonio (${total_pasivo_patrimonio.toLocaleString()})`
            );
          }
        }

        return {
          cuentas_por_cobrar_comerciales_terceros: reporte.renta_cuentas_por_cobrar_comerciales_terceros,
          total_activos_netos: reporte.renta_total_activos_netos,
          total_cuentas_por_pagar: reporte.renta_total_cuentas_por_pagar,
          total_pasivos: reporte.renta_total_cuentas_por_pagar,
          capital_social: reporte.renta_capital_social,
          total_patrimonio: reporte.renta_total_patrimonio,
          total_pasivo_patrimonio,
        };
      };

      return {
        empresa_nombre,
        balance_2022: convertirReporte(reportesPorAnio.get(2022)),
        balance_2023: convertirReporte(reportesPorAnio.get(2023)),
        balance_2024: convertirReporte(reportesPorAnio.get(2024)),
        warnings
      };

    } catch (error) {
      console.error('Error en getBalanceData:', error);
      return {
        empresa_nombre: null,
        balance_2022: {
          cuentas_por_cobrar_comerciales_terceros: null,
          total_activos_netos: null,
          total_cuentas_por_pagar: null,
          total_pasivos: null,
          capital_social: null,
          total_patrimonio: null,
          total_pasivo_patrimonio: null,
        },
        balance_2023: {
          cuentas_por_cobrar_comerciales_terceros: null,
          total_activos_netos: null,
          total_cuentas_por_pagar: null,
          total_pasivos: null,
          capital_social: null,
          total_patrimonio: null,
          total_pasivo_patrimonio: null,
        },
        balance_2024: {
          cuentas_por_cobrar_comerciales_terceros: null,
          total_activos_netos: null,
          total_cuentas_por_pagar: null,
          total_pasivos: null,
          capital_social: null,
          total_patrimonio: null,
          total_pasivo_patrimonio: null,
        },
        warnings: ['Error al cargar datos. Puede ingresar valores manualmente.']
      };
    }
  }
}