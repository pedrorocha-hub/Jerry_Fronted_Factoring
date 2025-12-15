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
   * Obtiene datos de balance desde rib_reporte_tributario (NO desde reporte_tributario)
   * Si no existe en rib_reporte_tributario, retorna estructura vacía
   */
  static async getBalanceData(ruc: string): Promise<ReporteTributarioBalanceData> {
    console.log('🔍 Buscando balance para RUC:', ruc, 'en rib_reporte_tributario');
    
    const warnings: string[] = [];
    
    // Buscar en rib_reporte_tributario (NO en reporte_tributario)
    const { data: ribData, error: ribError } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('ruc', ruc)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ribError) {
      console.error('❌ Error buscando en rib_reporte_tributario:', ribError);
      warnings.push('Error al buscar datos previos en RIB');
    }

    // Si no hay datos en rib_reporte_tributario, retornar estructura vacía
    if (!ribData) {
      console.log('ℹ️ No se encontraron datos previos en rib_reporte_tributario para RUC:', ruc);
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
        warnings: ['No se encontraron datos previos. Puede ingresar valores manualmente.']
      };
    }

    console.log('✅ Datos encontrados en rib_reporte_tributario:', ribData);

    // Construir respuesta desde rib_reporte_tributario
    return {
      empresa_nombre: ribData.nombre_empresa || null,
      balance_2022: {
        cuentas_por_cobrar_comerciales_terceros: ribData.cuentas_por_cobrar_giro_2022 || null,
        total_activos_netos: ribData.total_activos_2022 || null,
        total_cuentas_por_pagar: ribData.cuentas_por_pagar_giro_2022 || null,
        total_pasivos: ribData.total_pasivos_2022 || null,
        capital_social: ribData.capital_pagado_2022 || null,
        total_patrimonio: ribData.total_patrimonio_2022 || null,
        total_pasivo_patrimonio: ribData.total_pasivo_patrimonio_2022 || null,
      },
      balance_2023: {
        cuentas_por_cobrar_comerciales_terceros: ribData.cuentas_por_cobrar_giro_2023 || null,
        total_activos_netos: ribData.total_activos_2023 || null,
        total_cuentas_por_pagar: ribData.cuentas_por_pagar_giro_2023 || null,
        total_pasivos: ribData.total_pasivos_2023 || null,
        capital_social: ribData.capital_pagado_2023 || null,
        total_patrimonio: ribData.total_patrimonio_2023 || null,
        total_pasivo_patrimonio: ribData.total_pasivo_patrimonio_2023 || null,
      },
      balance_2024: {
        cuentas_por_cobrar_comerciales_terceros: ribData.cuentas_por_cobrar_giro_2024 || null,
        total_activos_netos: ribData.total_activos_2024 || null,
        total_cuentas_por_pagar: ribData.cuentas_por_pagar_giro_2024 || null,
        total_pasivos: ribData.total_pasivos_2024 || null,
        capital_social: ribData.capital_pagado_2024 || null,
        total_patrimonio: ribData.total_patrimonio_2024 || null,
        total_pasivo_patrimonio: ribData.total_pasivo_patrimonio_2024 || null,
      },
      warnings
    };
  }
}