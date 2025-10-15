import { supabase } from '@/integrations/supabase/client';
import { RibReporteTributario, RibReporteTributarioData, RibReporteTributarioSummary, RibReporteTributarioStatus } from '@/types/rib-reporte-tributario';

export class RibReporteTributarioService {
  private static normalizedToLegacy(normalizedData: RibReporteTributarioData[]): RibReporteTributario {
    if (normalizedData.length === 0) throw new Error('No data provided');
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
    const proveedorRecord = normalizedData.find(r => r.tipo_entidad === 'proveedor');
    if (proveedorRecord) result.proveedor_ruc = proveedorRecord.proveedor_ruc;
    normalizedData.forEach(record => {
      const suffix = record.tipo_entidad === 'proveedor' ? '_proveedor' : '';
      const year = record.anio;
      const fields = ['cuentas_por_cobrar_giro', 'total_activos', 'cuentas_por_pagar_giro', 'total_pasivos', 'capital_pagado', 'total_patrimonio', 'total_pasivo_patrimonio', 'ingreso_ventas', 'utilidad_bruta', 'utilidad_antes_impuesto', 'solvencia', 'gestion'];
      fields.forEach(field => {
        if (record[field as keyof typeof record] !== null && record[field as keyof typeof record] !== undefined) {
          (result as any)[`${field}_${year}${suffix}`] = record[field as keyof typeof record];
        }
      });
    });
    return result;
  }

  private static legacyToNormalized(legacyData: Partial<RibReporteTributario>): RibReporteTributarioData[] {
    const result: RibReporteTributarioData[] = [];
    const years = [2022, 2023, 2024];
    const fields = ['cuentas_por_cobrar_giro', 'total_activos', 'cuentas_por_pagar_giro', 'total_pasivos', 'capital_pagado', 'total_patrimonio', 'total_pasivo_patrimonio', 'ingreso_ventas', 'utilidad_bruta', 'utilidad_antes_impuesto', 'solvencia', 'gestion'];
    ['deudor', 'proveedor'].forEach(entityType => {
      if (entityType === 'proveedor' && !legacyData.proveedor_ruc) return;
      years.forEach(year => {
        const record: RibReporteTributarioData = {
          id: legacyData.id,
          ruc: entityType === 'deudor' ? legacyData.ruc! : legacyData.proveedor_ruc!,
          proveedor_ruc: entityType === 'deudor' ? legacyData.proveedor_ruc : undefined,
          anio: year,
          tipo_entidad: entityType as 'deudor' | 'proveedor',
          user_id: legacyData.user_id,
          status: legacyData.status,
          solicitud_id: legacyData.solicitud_id,
        };
        let hasData = false;
        fields.forEach(field => {
          const fieldName = `${field}_${year}${entityType === 'proveedor' ? '_proveedor' : ''}`;
          const value = (legacyData as any)[fieldName];
          if (value !== null && value !== undefined) {
            (record as any)[field] = value;
            hasData = true;
          }
        });
        if (hasData) result.push(record);
      });
    });
    return result;
  }

  static async getById(id: string): Promise<RibReporteTributario | null> {
    const { data, error } = await supabase.from('rib_reporte_tributario').select('*').eq('id', id);
    if (error) throw new Error(`Error en base de datos: ${error.message}`);
    if (!data || data.length === 0) return null;
    return this.normalizedToLegacy(data);
  }

  static async save(reportData: RibReporteTributario): Promise<RibReporteTributario> {
    const { data: { user } } = await supabase.auth.getUser();
    const normalizedRecords = this.legacyToNormalized({ ...reportData, user_id: user?.id });
    if (normalizedRecords.length === 0) throw new Error('No hay datos válidos para guardar');
    
    if (reportData.id) { // Update
      const { error: deleteError } = await supabase.from('rib_reporte_tributario').delete().eq('id', reportData.id);
      if (deleteError) throw new Error(`Error eliminando datos existentes: ${deleteError.message}`);
    }
    
    const recordsToInsert = normalizedRecords.map(record => ({
      ...record,
      id: reportData.id || undefined, // Use existing ID for all rows on update
      created_at: reportData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('rib_reporte_tributario').insert(recordsToInsert).select();
    if (error) throw new Error(`Error guardando datos: ${error.message}`);
    return this.normalizedToLegacy(data);
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');
    if (error) throw new Error(`Error obteniendo resúmenes: ${error.message}`);
    return data || [];
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('rib_reporte_tributario').delete().eq('id', id);
    if (error) throw new Error(`Error eliminando datos: ${error.message}`);
  }
}