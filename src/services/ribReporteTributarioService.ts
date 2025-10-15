import { supabase } from '@/integrations/supabase/client';
import { RibReporteTributario, RibReporteTributarioData, RibReporteTributarioSummary, RibReporteTributarioStatus } from '@/types/rib-reporte-tributario';

export class RibReporteTributarioService {
  // Función para convertir datos normalizados a formato legacy
  private static normalizedToLegacy(normalizedData: RibReporteTributarioData[]): RibReporteTributario {
    console.log('Convirtiendo datos normalizados a legacy:', normalizedData);
    
    if (normalizedData.length === 0) {
      throw new Error('No data provided');
    }

    const firstRecord = normalizedData[0];
    const result: RibReporteTributario = {
      id: firstRecord.id,
      ruc: firstRecord.ruc,
      user_id: firstRecord.user_id,
      created_at: firstRecord.created_at,
      updated_at: firstRecord.updated_at,
      status: firstRecord.status,
      solicitud_id: firstRecord.solicitud_id,
    };

    // Buscar si hay datos de proveedor
    const proveedorRecord = normalizedData.find(r => r.tipo_entidad === 'proveedor');
    if (proveedorRecord) {
      result.proveedor_ruc = proveedorRecord.proveedor_ruc;
    }

    // Convertir datos normalizados a formato legacy
    normalizedData.forEach(record => {
      const suffix = record.tipo_entidad === 'proveedor' ? '_proveedor' : '';
      const year = record.anio;
      
      // Estado de situación
      if (record.cuentas_por_cobrar_giro !== null && record.cuentas_por_cobrar_giro !== undefined) {
        (result as any)[`cuentas_por_cobrar_giro_${year}${suffix}`] = record.cuentas_por_cobrar_giro;
      }
      if (record.total_activos !== null && record.total_activos !== undefined) {
        (result as any)[`total_activos_${year}${suffix}`] = record.total_activos;
      }
      if (record.cuentas_por_pagar_giro !== null && record.cuentas_por_pagar_giro !== undefined) {
        (result as any)[`cuentas_por_pagar_giro_${year}${suffix}`] = record.cuentas_por_pagar_giro;
      }
      if (record.total_pasivos !== null && record.total_pasivos !== undefined) {
        (result as any)[`total_pasivos_${year}${suffix}`] = record.total_pasivos;
      }
      if (record.capital_pagado !== null && record.capital_pagado !== undefined) {
        (result as any)[`capital_pagado_${year}${suffix}`] = record.capital_pagado;
      }
      if (record.total_patrimonio !== null && record.total_patrimonio !== undefined) {
        (result as any)[`total_patrimonio_${year}${suffix}`] = record.total_patrimonio;
      }
      if (record.total_pasivo_patrimonio !== null && record.total_pasivo_patrimonio !== undefined) {
        (result as any)[`total_pasivo_patrimonio_${year}${suffix}`] = record.total_pasivo_patrimonio;
      }
      
      // Estados de resultados
      if (record.ingreso_ventas !== null && record.ingreso_ventas !== undefined) {
        (result as any)[`ingreso_ventas_${year}${suffix}`] = record.ingreso_ventas;
      }
      if (record.utilidad_bruta !== null && record.utilidad_bruta !== undefined) {
        (result as any)[`utilidad_bruta_${year}${suffix}`] = record.utilidad_bruta;
      }
      if (record.utilidad_antes_impuesto !== null && record.utilidad_antes_impuesto !== undefined) {
        (result as any)[`utilidad_antes_impuesto_${year}${suffix}`] = record.utilidad_antes_impuesto;
      }
      
      // Índices financieros
      if (record.solvencia !== null && record.solvencia !== undefined) {
        (result as any)[`solvencia_${year}${suffix}`] = record.solvencia;
      }
      if (record.gestion !== null && record.gestion !== undefined) {
        (result as any)[`gestion_${year}${suffix}`] = record.gestion;
      }
    });

    console.log('Resultado de conversión legacy:', result);
    return result;
  }

  // Función para convertir formato legacy a datos normalizados
  private static legacyToNormalized(legacyData: Partial<RibReporteTributario>): RibReporteTributarioData[] {
    console.log('Convirtiendo datos legacy a normalizados:', legacyData);
    
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
        solicitud_id: legacyData.solicitud_id,
      };

      let hasData = false;
      fields.forEach(field => {
        const fieldName = `${field}_${year}`;
        const value = (legacyData as any)[fieldName];
        if (value !== null && value !== undefined) {
          (deudorRecord as any)[field] = value;
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
          solicitud_id: legacyData.solicitud_id,
        };

        let hasData = false;
        fields.forEach(field => {
          const fieldName = `${field}_${year}_proveedor`;
          const value = (legacyData as any)[fieldName];
          if (value !== null && value !== undefined) {
            (proveedorRecord as any)[field] = value;
            hasData = true;
          }
        });

        if (hasData) {
          result.push(proveedorRecord);
        }
      });
    }

    console.log('Resultado de conversión normalizada:', result);
    return result;
  }

  static async getByRuc(ruc: string): Promise<RibReporteTributario | null> {
    try {
      console.log('Buscando datos RIB para RUC:', ruc);
      
      const { data, error } = await supabase
        .from('rib_reporte_tributario')
        .select('*')
        .eq('ruc', ruc)
        .order('anio', { ascending: true });

      if (error) {
        console.error('Error en query RIB:', error);
        throw new Error(`Error en base de datos: ${error.message}`);
      }

      console.log('Datos RIB encontrados:', data);

      if (!data || data.length === 0) {
        console.log('No se encontraron datos RIB para el RUC:', ruc);
        return null;
      }

      const result = this.normalizedToLegacy(data);
      console.log('Datos RIB convertidos:', result);
      return result;
    } catch (error) {
      console.error('Error completo en getByRuc:', error);
      throw error;
    }
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    try {
      console.log('Guardando datos RIB:', reportData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Convertir a formato normalizado
      const normalizedRecords = this.legacyToNormalized({
        ...reportData,
        user_id: user?.id,
      });

      console.log('Datos normalizados para guardar:', normalizedRecords);

      if (normalizedRecords.length === 0) {
        throw new Error('No hay datos válidos para guardar');
      }

      // Eliminar registros existentes para este RUC
      const { error: deleteError } = await supabase
        .from('rib_reporte_tributario')
        .delete()
        .eq('ruc', reportData.ruc!);

      if (deleteError) {
        console.error('Error eliminando registros existentes:', deleteError);
        throw new Error(`Error eliminando datos existentes: ${deleteError.message}`);
      }

      // Insertar nuevos registros
      const { data, error } = await supabase
        .from('rib_reporte_tributario')
        .insert(normalizedRecords.map(record => ({
          ...record,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })))
        .select();

      if (error) {
        console.error('Error insertando datos RIB:', error);
        throw new Error(`Error guardando datos: ${error.message}`);
      }

      console.log('Datos guardados exitosamente:', data);
      const result = this.normalizedToLegacy(data);
      console.log('Datos convertidos de vuelta:', result);
      return result;
    } catch (error) {
      console.error('Error completo en upsert:', error);
      throw error;
    }
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    try {
      console.log('Obteniendo summaries RIB...');
      
      const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');

      if (error) {
        console.error('Error en RPC summaries:', error);
        throw new Error(`Error obteniendo resúmenes: ${error.message}`);
      }

      console.log('Summaries obtenidos:', data);
      return data || [];
    } catch (error) {
      console.error('Error completo en getAllSummaries:', error);
      throw error;
    }
  }

  static async delete(ruc: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rib_reporte_tributario')
        .delete()
        .eq('ruc', ruc);

      if (error) {
        throw new Error(`Error eliminando datos: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
}