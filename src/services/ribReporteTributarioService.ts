import { supabase } from '@/integrations/supabase/client';

export type Status = 'Borrador' | 'En revisión' | 'Completado';

export interface RibReporteTributario {
  id: string;
  ruc: string;
  proveedor_ruc?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  status: Status;
  
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
  nombre_empresa?: string;
  updated_at: string;
  status: Status;
  creator_name?: string;
}

export interface AutoFillWarning {
  year: number;
  message: string;
}

export interface AutoFillResult {
  data: Partial<RibReporteTributario>;
  warnings: AutoFillWarning[];
}

export class RibReporteTributarioService {
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

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase
      .rpc('get_rib_reporte_tributario_summaries');

    if (error) throw error;
    return data || [];
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .upsert(reportData, { onConflict: 'ruc' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Nueva función para auto-completar desde reporte tributario
  static async autoFillFromReporteTributario(ruc: string): Promise<AutoFillResult> {
    try {
      // Buscar todos los reportes tributarios para este RUC
      const { data: reportes, error } = await supabase
        .from('reporte_tributario')
        .select('*')
        .eq('ruc', ruc)
        .in('anio_reporte', [2022, 2023, 2024]);

      if (error) throw error;

      const warnings: AutoFillWarning[] = [];
      const result: Partial<RibReporteTributario> = { ruc };

      // Función auxiliar para limpiar valores numéricos
      const cleanNumericValue = (value: any): number | null => {
        if (value === null || value === undefined) return null;
        
        // Convertir a string y limpiar separadores de miles
        const cleanValue = String(value).replace(/[.,]/g, '');
        const numValue = parseFloat(cleanValue);
        
        return isNaN(numValue) ? null : numValue;
      };

      // Procesar cada año
      for (const year of [2022, 2023, 2024]) {
        const reporte = reportes?.find(r => r.anio_reporte === year);
        
        if (!reporte) {
          // Si no hay reporte para este año, todos los campos quedan null
          continue;
        }

        // Extraer y limpiar los valores
        const totalActivos = cleanNumericValue(reporte.renta_total_activos_netos);
        const totalCuentasPorPagar = cleanNumericValue(reporte.renta_total_cuentas_por_pagar);
        const totalPatrimonio = cleanNumericValue(reporte.renta_total_patrimonio);
        const capitalSocial = cleanNumericValue(reporte.renta_capital_social);
        const cuentasPorCobrar = cleanNumericValue(reporte.renta_cuentas_por_cobrar_comerciales_terceros);
        
        // Para total_pasivos, intentar usar renta_total_pasivo si existe, sino usar total_cuentas_por_pagar
        let totalPasivos = cleanNumericValue(reporte.renta_total_pasivo);
        if (totalPasivos === null) {
          totalPasivos = totalCuentasPorPagar;
        }

        // Calcular total_pasivo_y_patrimonio
        let totalPasivoPatrimonio: number | null = null;
        if (totalPasivos !== null && totalPatrimonio !== null) {
          totalPasivoPatrimonio = totalPasivos + totalPatrimonio;
          
          // Validar que cuadre con total_activos
          if (totalActivos !== null) {
            const diferencia = Math.abs(totalPasivoPatrimonio - totalActivos);
            if (diferencia > 1) {
              warnings.push({
                year,
                message: `El total de pasivos y patrimonio (${totalPasivoPatrimonio.toLocaleString()}) no cuadra con total de activos (${totalActivos.toLocaleString()}). Diferencia: ${diferencia.toLocaleString()}`
              });
            }
          }
        }

        // Asignar valores al resultado
        result[`cuentas_por_cobrar_giro_${year}` as keyof RibReporteTributario] = cuentasPorCobrar;
        result[`total_activos_${year}` as keyof RibReporteTributario] = totalActivos;
        result[`cuentas_por_pagar_giro_${year}` as keyof RibReporteTributario] = totalCuentasPorPagar;
        result[`total_pasivos_${year}` as keyof RibReporteTributario] = totalPasivos;
        result[`capital_pagado_${year}` as keyof RibReporteTributario] = capitalSocial;
        result[`total_patrimonio_${year}` as keyof RibReporteTributario] = totalPatrimonio;
        result[`total_pasivo_patrimonio_${year}` as keyof RibReporteTributario] = totalPasivoPatrimonio;

        // También completar estados de resultados si están disponibles
        const ingresoVentas = cleanNumericValue(reporte.renta_ingresos_netos);
        const resultadoBruto = cleanNumericValue(reporte.renta_resultado_bruto);
        const resultadoAntesParticipaciones = cleanNumericValue(reporte.renta_resultado_antes_participaciones);

        if (ingresoVentas !== null) {
          result[`ingreso_ventas_${year}` as keyof RibReporteTributario] = ingresoVentas;
        }
        if (resultadoBruto !== null) {
          result[`utilidad_bruta_${year}` as keyof RibReporteTributario] = resultadoBruto;
        }
        if (resultadoAntesParticipaciones !== null) {
          result[`utilidad_antes_impuesto_${year}` as keyof RibReporteTributario] = resultadoAntesParticipaciones;
        }

        // Calcular índices financieros básicos si es posible
        if (totalActivos !== null && totalPasivos !== null && totalActivos !== 0) {
          const solvencia = totalActivos / totalPasivos;
          result[`solvencia_${year}` as keyof RibReporteTributario] = Math.round(solvencia * 100) / 100;
        }

        if (totalActivos !== null && ingresoVentas !== null && totalActivos !== 0) {
          const gestion = ingresoVentas / totalActivos;
          result[`gestion_${year}` as keyof RibReporteTributario] = Math.round(gestion * 100) / 100;
        }
      }

      return { data: result, warnings };
    } catch (error) {
      console.error('Error en autoFillFromReporteTributario:', error);
      throw error;
    }
  }
}