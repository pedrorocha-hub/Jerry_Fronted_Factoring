import { supabase } from '@/integrations/supabase/client';

export type RibReporteTributarioStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface RibReporteTributarioData {
  id?: string;
  ruc: string;
  proveedor_ruc?: string;
  anio: number;
  tipo_entidad: 'deudor' | 'proveedor';
  
  // Campos del estado de situación
  cuentas_por_cobrar_giro?: number | null;
  total_activos?: number | null;
  cuentas_por_pagar_giro?: number | null;
  total_pasivos?: number | null;
  capital_pagado?: number | null;
  total_patrimonio?: number | null;
  total_pasivo_patrimonio?: number | null;
  
  // Estados de resultados
  ingreso_ventas?: number | null;
  utilidad_bruta?: number | null;
  utilidad_antes_impuesto?: number | null;
  
  // Índices financieros
  solvencia?: number | null;
  gestion?: number | null;
  
  // Metadatos
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: RibReporteTributarioStatus;
}

// Interface para compatibilidad con el componente existente
export interface RibReporteTributario {
  id?: string;
  ruc: string;
  proveedor_ruc?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: RibReporteTributarioStatus;
  
  // Campos del deudor por año
  cuentas_por_cobrar_giro_2022?: number | null;
  cuentas_por_cobrar_giro_2023?: number | null;
  cuentas_por_cobrar_giro_2024?: number | null;
  total_activos_2022?: number | null;
  total_activos_2023?: number | null;
  total_activos_2024?: number | null;
  cuentas_por_pagar_giro_2022?: number | null;
  cuentas_por_pagar_giro_2023?: number | null;
  cuentas_por_pagar_giro_2024?: number | null;
  total_pasivos_2022?: number | null;
  total_pasivos_2023?: number | null;
  total_pasivos_2024?: number | null;
  capital_pagado_2022?: number | null;
  capital_pagado_2023?: number | null;
  capital_pagado_2024?: number | null;
  total_patrimonio_2022?: number | null;
  total_patrimonio_2023?: number | null;
  total_patrimonio_2024?: number | null;
  total_pasivo_patrimonio_2022?: number | null;
  total_pasivo_patrimonio_2023?: number | null;
  total_pasivo_patrimonio_2024?: number | null;
  
  // Estados de resultados
  ingreso_ventas_2022?: number | null;
  ingreso_ventas_2023?: number | null;
  ingreso_ventas_2024?: number | null;
  utilidad_bruta_2022?: number | null;
  utilidad_bruta_2023?: number | null;
  utilidad_bruta_2024?: number | null;
  utilidad_antes_impuesto_2022?: number | null;
  utilidad_antes_impuesto_2023?: number | null;
  utilidad_antes_impuesto_2024?: number | null;
  
  // Índices financieros
  solvencia_2022?: number | null;
  solvencia_2023?: number | null;
  solvencia_2024?: number | null;
  gestion_2022?: number | null;
  gestion_2023?: number | null;
  gestion_2024?: number | null;
  
  // Campos del proveedor por año
  cuentas_por_cobrar_giro_2022_proveedor?: number | null;
  cuentas_por_cobrar_giro_2023_proveedor?: number | null;
  cuentas_por_cobrar_giro_2024_proveedor?: number | null;
  total_activos_2022_proveedor?: number | null;
  total_activos_2023_proveedor?: number | null;
  total_activos_2024_proveedor?: number | null;
  cuentas_por_pagar_giro_2022_proveedor?: number | null;
  cuentas_por_pagar_giro_2023_proveedor?: number | null;
  cuentas_por_pagar_giro_2024_proveedor?: number | null;
  total_pasivos_2022_proveedor?: number | null;
  total_pasivos_2023_proveedor?: number | null;
  total_pasivos_2024_proveedor?: number | null;
  capital_pagado_2022_proveedor?: number | null;
  capital_pagado_2023_proveedor?: number | null;
  capital_pagado_2024_proveedor?: number | null;
  total_patrimonio_2022_proveedor?: number | null;
  total_patrimonio_2023_proveedor?: number | null;
  total_patrimonio_2024_proveedor?: number | null;
  total_pasivo_patrimonio_2022_proveedor?: number | null;
  total_pasivo_patrimonio_2023_proveedor?: number | null;
  total_pasivo_patrimonio_2024_proveedor?: number | null;
  
  // Estados de resultados proveedor
  ingreso_ventas_2022_proveedor?: number | null;
  ingreso_ventas_2023_proveedor?: number | null;
  ingreso_ventas_2024_proveedor?: number | null;
  utilidad_bruta_2022_proveedor?: number | null;
  utilidad_bruta_2023_proveedor?: number | null;
  utilidad_bruta_2024_proveedor?: number | null;
  utilidad_antes_impuesto_2022_proveedor?: number | null;
  utilidad_antes_impuesto_2023_proveedor?: number | null;
  utilidad_antes_impuesto_2024_proveedor?: number | null;
  
  // Índices financieros proveedor
  solvencia_2022_proveedor?: number | null;
  solvencia_2023_proveedor?: number | null;
  solvencia_2024_proveedor?: number | null;
  gestion_2022_proveedor?: number | null;
  gestion_2023_proveedor?: number | null;
  gestion_2024_proveedor?: number | null;
}

export interface RibReporteTributarioSummary {
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: RibReporteTributarioStatus;
  creator_name: string;
}

export class RibReporteTributarioService {
  // Función para convertir datos normalizados a formato legacy
  private static normalizedToLegacy(normalizedData: RibReporteTributarioData[]): RibReporteTributario {
    if (normalizedData.length === 0) {
      throw new Error('No data provided');
    }

    const firstRecord = normalizedData[0];
    const result: RibReporteTributario = {
      id: firstRecord.id,
      ruc: firstRecord.ruc,
      proveedor_ruc: firstRecord.proveedor_ruc,
      user_id: firstRecord.user_id,
      created_at: firstRecord.created_at,
      updated_at: firstRecord.updated_at,
      status: firstRecord.status,
    };

    // Convertir datos normalizados a formato legacy
    normalizedData.forEach(record => {
      const suffix = record.tipo_entidad === 'proveedor' ? '_proveedor' : '';
      const year = record.anio;
      
      // Estado de situación
      if (record.cuentas_por_cobrar_giro !== null) {
        result[`cuentas_por_cobrar_giro_${year}${suffix}` as keyof RibReporteTributario] = record.cuentas_por_cobrar_giro;
      }
      if (record.total_activos !== null) {
        result[`total_activos_${year}${suffix}` as keyof RibReporteTributario] = record.total_activos;
      }
      if (record.cuentas_por_pagar_giro !== null) {
        result[`cuentas_por_pagar_giro_${year}${suffix}` as keyof RibReporteTributario] = record.cuentas_por_pagar_giro;
      }
      if (record.total_pasivos !== null) {
        result[`total_pasivos_${year}${suffix}` as keyof RibReporteTributario] = record.total_pasivos;
      }
      if (record.capital_pagado !== null) {
        result[`capital_pagado_${year}${suffix}` as keyof RibReporteTributario] = record.capital_pagado;
      }
      if (record.total_patrimonio !== null) {
        result[`total_patrimonio_${year}${suffix}` as keyof RibReporteTributario] = record.total_patrimonio;
      }
      if (record.total_pasivo_patrimonio !== null) {
        result[`total_pasivo_patrimonio_${year}${suffix}` as keyof RibReporteTributario] = record.total_pasivo_patrimonio;
      }
      
      // Estados de resultados
      if (record.ingreso_ventas !== null) {
        result[`ingreso_ventas_${year}${suffix}` as keyof RibReporteTributario] = record.ingreso_ventas;
      }
      if (record.utilidad_bruta !== null) {
        result[`utilidad_bruta_${year}${suffix}` as keyof RibReporteTributario] = record.utilidad_bruta;
      }
      if (record.utilidad_antes_impuesto !== null) {
        result[`utilidad_antes_impuesto_${year}${suffix}` as keyof RibReporteTributario] = record.utilidad_antes_impuesto;
      }
      
      // Índices financieros
      if (record.solvencia !== null) {
        result[`solvencia_${year}${suffix}` as keyof RibReporteTributario] = record.solvencia;
      }
      if (record.gestion !== null) {
        result[`gestion_${year}${suffix}` as keyof RibReporteTributario] = record.gestion;
      }
    });

    return result;
  }

  // Función para convertir formato legacy a datos normalizados
  private static legacyToNormalized(legacyData: Partial<RibReporteTributario>): RibReporteTributarioData[] {
    const result: RibReporteTributarioData[] = [];
    const years = [2022, 2023, 2024];
    const fields = [
      'cuentas_por_cobrar_giro',
      'total_activos',
      'cuentas_por_pagar_giro', 
      'total_pasivos',
      'capital_pagado',
      'total_patrimonio',
      'total_pasivo_patrimonio',
      'ingreso_ventas',
      'utilidad_bruta',
      'utilidad_antes_impuesto',
      'solvencia',
      'gestion'
    ];

    // Procesar datos del deudor
    years.forEach(year => {
      const deudorRecord: RibReporteTributarioData = {
        ruc: legacyData.ruc!,
        proveedor_ruc: legacyData.proveedor_ruc,
        anio: year,
        tipo_entidad: 'deudor',
        user_id: legacyData.user_id,
        status: legacyData.status,
      };

      let hasData = false;
      fields.forEach(field => {
        const value = legacyData[`${field}_${year}` as keyof RibReporteTributario] as number | null;
        if (value !== null && value !== undefined) {
          deudorRecord[field as keyof RibReporteTributarioData] = value;
          hasData = true;
        }
      });

      if (hasData) {
        result.push(deudorRecord);
      }
    });

    // Procesar datos del proveedor si existen
    if (legacyData.proveedor_ruc) {
      years.forEach(year => {
        const proveedorRecord: RibReporteTributarioData = {
          ruc: legacyData.ruc!,
          proveedor_ruc: legacyData.proveedor_ruc,
          anio: year,
          tipo_entidad: 'proveedor',
          user_id: legacyData.user_id,
          status: legacyData.status,
        };

        let hasData = false;
        fields.forEach(field => {
          const value = legacyData[`${field}_${year}_proveedor` as keyof RibReporteTributario] as number | null;
          if (value !== null && value !== undefined) {
            proveedorRecord[field as keyof RibReporteTributarioData] = value;
            hasData = true;
          }
        });

        if (hasData) {
          result.push(proveedorRecord);
        }
      });
    }

    return result;
  }

  static async getByRuc(ruc: string): Promise<RibReporteTributario | null> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario_normalizada')
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

    return this.normalizedToLegacy(data);
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    console.log('Guardando datos RIB:', reportData);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // Convertir a formato normalizado
    const normalizedRecords = this.legacyToNormalized({
      ...reportData,
      user_id: user?.id,
    });

    console.log('Datos normalizados:', normalizedRecords);

    // Eliminar registros existentes para este RUC
    await supabase
      .from('rib_reporte_tributario_normalizada')
      .delete()
      .eq('ruc', reportData.ruc!);

    // Insertar nuevos registros
    const { data, error } = await supabase
      .from('rib_reporte_tributario_normalizada')
      .insert(normalizedRecords.map(record => ({
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })))
      .select();

    if (error) {
      console.error('Error upserting RIB reporte:', error);
      throw error;
    }

    console.log('Datos guardados exitosamente:', data);
    return this.normalizedToLegacy(data);
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries_normalizada');

    if (error) {
      console.error('Error fetching RIB summaries:', error);
      throw error;
    }

    return data || [];
  }

  static async delete(ruc: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario_normalizada')
      .delete()
      .eq('ruc', ruc);

    if (error) {
      throw error;
    }
  }
}