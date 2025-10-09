import { supabase } from '@/integrations/supabase/client';

export type RibReporteTributarioStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface RibReporteTributario {
  id?: string;
  ruc: string;
  proveedor_ruc?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: RibReporteTributarioStatus;

  // Datos por año y tipo de entidad (deudor/proveedor)
  // Estructura: { [año]: { deudor: datos, proveedor?: datos } }
  data?: {
    [year: number]: {
      deudor?: RibFinancialData;
      proveedor?: RibFinancialData;
    };
  };

  // Para compatibilidad con componentes existentes
  [key: string]: any;
}

export interface RibFinancialData {
  cuentas_por_cobrar_giro?: number | null;
  total_activos?: number | null;
  cuentas_por_pagar_giro?: number | null;
  total_pasivos?: number | null;
  capital_pagado?: number | null;
  total_patrimonio?: number | null;
  total_pasivo_patrimonio?: number | null;
  ingreso_ventas?: number | null;
  utilidad_bruta?: number | null;
  utilidad_antes_impuesto?: number | null;
  solvencia?: number | null;
  gestion?: number | null;
}

export interface RibReporteTributarioSummary {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: RibReporteTributarioStatus;
  creator_name: string;
}

export class RibReporteTributarioService {
  static async getByRuc(ruc: string): Promise<RibReporteTributario | null> {
    // Obtener todos los registros para este RUC
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('ruc', ruc)
      .order('anio', { ascending: true });

    if (error) {
      console.error('Error fetching RIB data:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Transformar datos normalizados a estructura compatible
    const result: RibReporteTributario = {
      ruc,
      proveedor_ruc: data.find(d => d.proveedor_ruc)?.proveedor_ruc,
      user_id: data[0].user_id,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
      status: data[0].status,
      data: {}
    };

    // Agrupar datos por año y tipo de entidad
    data.forEach(row => {
      if (!result.data![row.anio]) {
        result.data![row.anio] = {};
      }

      const financialData: RibFinancialData = {
        cuentas_por_cobrar_giro: row.cuentas_por_cobrar_giro,
        total_activos: row.total_activos,
        cuentas_por_pagar_giro: row.cuentas_por_pagar_giro,
        total_pasivos: row.total_pasivos,
        capital_pagado: row.capital_pagado,
        total_patrimonio: row.total_patrimonio,
        total_pasivo_patrimonio: row.total_pasivo_patrimonio,
        ingreso_ventas: row.ingreso_ventas,
        utilidad_bruta: row.utilidad_bruta,
        utilidad_antes_impuesto: row.utilidad_antes_impuesto,
        solvencia: row.solvencia,
        gestion: row.gestion,
      };

      result.data![row.anio][row.tipo_entidad as 'deudor' | 'proveedor'] = financialData;

      // Para compatibilidad con componentes existentes, crear campos planos
      Object.keys(financialData).forEach(field => {
        const suffix = row.tipo_entidad === 'proveedor' ? '_proveedor' : '';
        const fieldName = `${field}_${row.anio}${suffix}`;
        result[fieldName] = financialData[field as keyof RibFinancialData];
      });
    });

    return result;
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    console.log('Guardando datos RIB normalizada:', reportData);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Extraer datos por año y tipo de entidad
    const years = [2022, 2023, 2024];
    const fields = [
      'cuentas_por_cobrar_giro', 'total_activos', 'cuentas_por_pagar_giro', 
      'total_pasivos', 'capital_pagado', 'total_patrimonio', 'total_pasivo_patrimonio',
      'ingreso_ventas', 'utilidad_bruta', 'utilidad_antes_impuesto',
      'solvencia', 'gestion'
    ];

    const recordsToUpsert = [];

    // Procesar datos del deudor
    years.forEach(year => {
      const deudorData: any = {
        ruc: reportData.ruc,
        proveedor_ruc: reportData.proveedor_ruc || null,
        anio: year,
        tipo_entidad: 'deudor',
        user_id: user?.id,
        status: reportData.status || 'Borrador',
        updated_at: new Date().toISOString(),
      };

      // Solo incluir campos que tienen valores
      let hasData = false;
      fields.forEach(field => {
        const fieldName = `${field}_${year}`;
        if (reportData[fieldName] !== undefined && reportData[fieldName] !== null) {
          deudorData[field] = reportData[fieldName];
          hasData = true;
        }
      });

      if (hasData) {
        recordsToUpsert.push(deudorData);
      }
    });

    // Procesar datos del proveedor (si existen)
    if (reportData.proveedor_ruc) {
      years.forEach(year => {
        const proveedorData: any = {
          ruc: reportData.ruc,
          proveedor_ruc: reportData.proveedor_ruc,
          anio: year,
          tipo_entidad: 'proveedor',
          user_id: user?.id,
          status: reportData.status || 'Borrador',
          updated_at: new Date().toISOString(),
        };

        let hasData = false;
        fields.forEach(field => {
          const fieldName = `${field}_${year}_proveedor`;
          if (reportData[fieldName] !== undefined && reportData[fieldName] !== null) {
            proveedorData[field] = reportData[fieldName];
            hasData = true;
          }
        });

        if (hasData) {
          recordsToUpsert.push(proveedorData);
        }
      });
    }

    console.log('Registros a guardar:', recordsToUpsert);

    if (recordsToUpsert.length === 0) {
      throw new Error('No hay datos para guardar');
    }

    // Upsert todos los registros
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .upsert(recordsToUpsert, {
        onConflict: 'ruc,proveedor_ruc,anio,tipo_entidad',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error upserting RIB normalizada:', error);
      throw error;
    }

    console.log('Datos guardados exitosamente:', data);

    // Retornar los datos en el formato esperado
    return await this.getByRuc(reportData.ruc!) || reportData as RibReporteTributario;
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');

    if (error) {
      console.error('Error fetching RIB summaries:', error);
      throw error;
    }

    return data || [];
  }

  static async delete(ruc: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('ruc', ruc);

    if (error) {
      throw error;
    }
  }

  // Método auxiliar para obtener datos de un año específico
  static getYearData(report: RibReporteTributario, year: number, tipo: 'deudor' | 'proveedor'): RibFinancialData | null {
    return report.data?.[year]?.[tipo] || null;
  }

  // Método auxiliar para verificar si hay datos de proveedor
  static hasProveedorData(report: RibReporteTributario): boolean {
    if (!report.data) return false;
    
    return Object.values(report.data).some(yearData => 
      yearData.proveedor && Object.values(yearData.proveedor).some(value => value !== null && value !== undefined)
    );
  }
}