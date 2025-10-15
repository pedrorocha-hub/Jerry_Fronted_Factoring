import { supabase } from '@/integrations/supabase/client';
import { RibReporteTributario, RibReporteTributarioData, RibReporteTributarioSummary, RibReporteTributarioStatus } from '@/types/rib-reporte-tributario';

export class RibReporteTributarioService {
  private static normalizedToLegacy(normalizedData: RibReporteTributarioData[]): RibReporteTributario {
    if (normalizedData.length === 0) {
      throw new Error('No data provided to normalize');
    }

    const firstRecord = normalizedData[0];
    const result: any = {
      id: firstRecord.id,
      ruc: firstRecord.ruc,
      user_id: firstRecord.user_id,
      created_at: firstRecord.created_at,
      updated_at: firstRecord.updated_at,
      status: firstRecord.status,
      solicitud_id: firstRecord.solicitud_id,
      _rowIds: {}
    };

    const proveedorRecord = normalizedData.find(r => r.tipo_entidad === 'proveedor');
    if (proveedorRecord) {
      result.proveedor_ruc = proveedorRecord.proveedor_ruc;
    }

    normalizedData.forEach(record => {
      const suffix = record.tipo_entidad === 'proveedor' ? '_proveedor' : '';
      const year = record.anio;
      const key = `${record.tipo_entidad}_${year}`;
      if (record.id) {
        result._rowIds[key] = record.id;
      }
      
      Object.keys(record).forEach(field => {
        if (!['id', 'ruc', 'proveedor_ruc', 'anio', 'tipo_entidad', 'user_id', 'created_at', 'updated_at', 'status', 'solicitud_id'].includes(field)) {
          result[`${field}_${year}${suffix}`] = record[field as keyof RibReporteTributarioData];
        }
      });
    });

    return result as RibReporteTributario;
  }

  private static legacyToNormalized(legacyData: Partial<RibReporteTributario>): RibReporteTributarioData[] {
    const result: RibReporteTributarioData[] = [];
    const years = [2022, 2023, 2024];
    const fields = [
      'cuentas_por_cobrar_giro', 'total_activos', 'cuentas_por_pagar_giro', 'total_pasivos',
      'capital_pagado', 'total_patrimonio', 'total_pasivo_patrimonio', 'ingreso_ventas',
      'utilidad_bruta', 'utilidad_antes_impuesto', 'solvencia', 'gestion'
    ];
    const rowIds = (legacyData as any)._rowIds || {};

    ['deudor', 'proveedor'].forEach(entityType => {
      if (entityType === 'proveedor' && !legacyData.proveedor_ruc) return;

      years.forEach(year => {
        const suffix = entityType === 'proveedor' ? '_proveedor' : '';
        const key = `${entityType}_${year}`;
        const id = rowIds[key];
        
        const record: Partial<RibReporteTributarioData> = {
          ruc: legacyData.ruc!,
          proveedor_ruc: legacyData.proveedor_ruc,
          anio: year,
          tipo_entidad: entityType as 'deudor' | 'proveedor',
          user_id: legacyData.user_id,
          status: legacyData.status,
          solicitud_id: legacyData.solicitud_id,
        };

        if (id) {
          record.id = id;
        }

        let hasData = false;
        fields.forEach(field => {
          const fieldName = `${field}_${year}${suffix}`;
          const value = (legacyData as any)[fieldName];
          if (value !== null && value !== undefined && value !== '') {
            (record as any)[field] = value;
            hasData = true;
          }
        });

        if (hasData) {
          result.push(record as RibReporteTributarioData);
        }
      });
    });

    return result;
  }

  static async getAllWithRelations(): Promise<any[]> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select(`
        *,
        ficha_ruc!inner(nombre_empresa),
        profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching relations for RIB reports:", error);
      throw error;
    }
    return data || [];
  }

  static async getReportsByRuc(ruc: string): Promise<RibReporteTributario[]> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('ruc', ruc);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const groupedBySolicitud = data.reduce((acc, record) => {
      const key = record.solicitud_id || `unlinked-${record.created_at?.substring(0, 19)}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    }, {} as Record<string, RibReporteTributarioData[]>);

    return Object.values(groupedBySolicitud).map(group => this.normalizedToLegacy(group));
  }

  static async upsert(reportData: Partial<RibReporteTributario>): Promise<RibReporteTributario> {
    const { data: { user } } = await supabase.auth.getUser();
    const normalizedRecords = this.legacyToNormalized({
      ...reportData,
      user_id: user?.id,
    });

    if (normalizedRecords.length === 0) {
      throw new Error('No hay datos válidos para guardar');
    }

    const recordsToUpsert = normalizedRecords.map(record => {
      const { id, ...rest } = record;
      const baseRecord: any = {
        ...rest,
        updated_at: new Date().toISOString(),
      };
      if (id) {
        baseRecord.id = id;
      } else {
        baseRecord.created_at = new Date().toISOString();
      }
      return baseRecord;
    });

    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .upsert(recordsToUpsert, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Error upserting RIB data:', error);
      throw new Error(`Error guardando datos: ${error.message}`);
    }

    return this.normalizedToLegacy(data);
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');
    if (error) throw error;
    return data || [];
  }

  static async delete(ruc: string, solicitud_id: string | null): Promise<void> {
    let query = supabase.from('rib_reporte_tributario').delete().eq('ruc', ruc);
    if (solicitud_id) {
      query = query.eq('solicitud_id', solicitud_id);
    } else {
      query = query.is('solicitud_id', null);
    }
    const { error } = await query;
    if (error) throw new Error(`Error eliminando datos: ${error.message}`);
  }
}