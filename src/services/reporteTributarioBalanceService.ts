import { supabase } from '@/integrations/supabase/client';

export interface ReporteTributarioBalance {
  year: number;
  cuentas_por_cobrar_comerciales_terceros: number | null;
  total_activos_netos: number | null;
  total_cuentas_por_pagar: number | null;
  total_patrimonio: number | null;
  capital_social: number | null;
  // Campos calculados
  total_pasivos: number | null;
  total_pasivo_patrimonio: number | null;
}

export interface ReporteTributarioBalanceData {
  ruc: string;
  empresa_nombre?: string;
  balance_2022: ReporteTributarioBalance;
  balance_2023: ReporteTributarioBalance;
  balance_2024: ReporteTributarioBalance;
  warnings: string[];
}

export class ReporteTributarioBalanceService {
  static async getBalanceData(ruc: string): Promise<ReporteTributarioBalanceData> {
    const years = [2022, 2023, 2024];
    const result: ReporteTributarioBalanceData = {
      ruc,
      balance_2022: this.createEmptyBalance(2022),
      balance_2023: this.createEmptyBalance(2023),
      balance_2024: this.createEmptyBalance(2024),
      warnings: []
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
        console.error(`Error obteniendo datos para ${year}:`, error);
        result.warnings.push(`Error obteniendo datos para ${year}: ${error.message}`);
        continue;
      }

      if (!data) {
        // No existe registro para este año
        continue;
      }

      // Establecer nombre de empresa si no lo tenemos
      if (!result.empresa_nombre && data.razon_social) {
        result.empresa_nombre = data.razon_social;
      }

      // Procesar datos del año
      const balance = this.processBalanceData(year, data);
      
      if (year === 2022) result.balance_2022 = balance;
      else if (year === 2023) result.balance_2023 = balance;
      else if (year === 2024) result.balance_2024 = balance;
    }

    return result;
  }

  private static createEmptyBalance(year: number): ReporteTributarioBalance {
    return {
      year,
      cuentas_por_cobrar_comerciales_terceros: null,
      total_activos_netos: null,
      total_cuentas_por_pagar: null,
      total_patrimonio: null,
      capital_social: null,
      total_pasivos: null,
      total_pasivo_patrimonio: null
    };
  }

  private static processBalanceData(year: number, data: any): ReporteTributarioBalance {
    const balance: ReporteTributarioBalance = {
      year,
      cuentas_por_cobrar_comerciales_terceros: data.renta_cuentas_por_cobrar_comerciales_terceros,
      total_activos_netos: data.renta_total_activos_netos,
      total_cuentas_por_pagar: data.renta_total_cuentas_por_pagar,
      total_patrimonio: data.renta_total_patrimonio,
      capital_social: data.renta_capital_social,
      total_pasivos: null,
      total_pasivo_patrimonio: null
    };

    // Calcular total_pasivos = total_activos - total_patrimonio
    if (balance.total_activos_netos !== null && balance.total_patrimonio !== null) {
      balance.total_pasivos = balance.total_activos_netos - balance.total_patrimonio;
    }

    // Calcular total_pasivo_patrimonio = total_pasivos + total_patrimonio
    if (balance.total_pasivos !== null && balance.total_patrimonio !== null) {
      balance.total_pasivo_patrimonio = balance.total_pasivos + balance.total_patrimonio;
    }

    return balance;
  }
}