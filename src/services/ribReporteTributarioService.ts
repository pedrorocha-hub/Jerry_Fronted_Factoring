import { supabase } from '@/integrations/supabase/client';

// Summary for the list view
export interface RibReporteTributarioSummary {
  id: string;
  deudor_ruc: string;
  deudor_nombre: string;
  proveedor_ruc: string | null;
  proveedor_nombre: string | null;
  updated_at: string;
  status: string;
  creator_name: string | null;
  solicitud_id: string | null;
  anio: number;
}

// "Wide" format used by the form state
export interface RibReporteTributario {
  id?: string;
  ruc: string;
  [key: string]: any; // Allows for year-suffixed fields
}

// Document structure passed between form and service
export interface RibReporteTributarioDocument {
  deudor: Partial<RibReporteTributario>;
  proveedor?: Partial<RibReporteTributario> | null;
  solicitud_id: string | null;
  status: string;
  user_id: string | null;
  created_at?: string;
  updated_at?: string;
  nombre_empresa?: string | null;
}

// "Tall" format for a single database row
interface RibReporteTributarioDataRow {
  id?: string; // Will be cast to UUID by Supabase
  ruc: string;
  anio: number;
  tipo_entidad: 'deudor' | 'proveedor';
  nombre_empresa?: string | null;
  user_id?: string | null; // Will be cast to UUID by Supabase
  solicitud_id?: string | null; // Will be cast to UUID by Supabase
  status?: string;
  [key: string]: any;
}

export class RibReporteTributarioService {
  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');
    if (error) {
      console.error('Error fetching RIB reporte tributario summaries:', error);
      throw new Error(`Error al obtener los reportes: ${error.message}`);
    }
    return data || [];
  }

  static async getById(id: string): Promise<RibReporteTributarioDocument | null> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('id', id);

    if (error) {
      console.error('Error fetching RIB reporte tributario by ID:', error);
      throw new Error(`Error al obtener el reporte: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const deudorRuc = data.find(r => r.tipo_entidad === 'deudor')?.ruc;
    const proveedorRuc = data.find(r => r.tipo_entidad === 'proveedor')?.ruc;
    
    const deudorData: Partial<RibReporteTributario> = { 
      id: id, 
      ruc: deudorRuc 
    };
    
    const proveedorData: Partial<RibReporteTributario> = { 
      id: id, 
      ruc: proveedorRuc,
      proveedor_ruc: proveedorRuc // Importante: guardar también en proveedor_ruc
    };
    
    let hasProveedor = false;

    const fields = [
      'cuentas_por_cobrar_giro', 'total_activos', 'cuentas_por_pagar_giro',
      'total_pasivos', 'capital_pagado', 'total_patrimonio', 'total_pasivo_patrimonio',
      'ingreso_ventas', 'utilidad_bruta', 'utilidad_antes_impuesto',
      'solvencia', 'gestion'
    ];

    for (const row of data) {
      const isProveedor = row.tipo_entidad === 'proveedor';
      const target = isProveedor ? proveedorData : deudorData;
      if (isProveedor) hasProveedor = true;
      
      for (const field of fields) {
        if (row[field] !== null && row[field] !== undefined) {
          const key = `${field}_${row.anio}${isProveedor ? '_proveedor' : ''}`;
          target[key as keyof RibReporteTributario] = row[field];
        }
      }
    }

    return {
      deudor: deudorData,
      proveedor: hasProveedor ? proveedorData : null,
      solicitud_id: data[0].solicitud_id,
      status: data[0].status || 'Borrador',
      user_id: data[0].user_id,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
      nombre_empresa: data[0].nombre_empresa,
    };
  }

  static async save(document: RibReporteTributarioDocument): Promise<RibReporteTributarioDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    const reportId = document.deudor.id || crypto.randomUUID();

    const transform = (wideData: Partial<RibReporteTributario>, tipo: 'deudor' | 'proveedor'): RibReporteTributarioDataRow[] => {
      // Para proveedor, el RUC está en proveedor_ruc, para deudor está en ruc
      const rucValue = tipo === 'proveedor' ? wideData.proveedor_ruc : wideData.ruc;
      
      if (!wideData || !rucValue) return [];

      const years = [2022, 2023, 2024];
      const fields = [
        'cuentas_por_cobrar_giro', 'total_activos', 'cuentas_por_pagar_giro',
        'total_pasivos', 'capital_pagado', 'total_patrimonio', 'total_pasivo_patrimonio',
        'ingreso_ventas', 'utilidad_bruta', 'utilidad_antes_impuesto',
        'solvencia', 'gestion'
      ];

      const tallRecords: RibReporteTributarioDataRow[] = [];

      for (const year of years) {
        const record: RibReporteTributarioDataRow = {
          id: reportId,
          ruc: rucValue,
          anio: year,
          tipo_entidad: tipo,
          user_id: user?.id || null,
          status: document.status,
          solicitud_id: document.solicitud_id || null,
          nombre_empresa: document.nombre_empresa || null,
        };

        let hasDataForYear = false;
        for (const field of fields) {
          const wideFieldKey = `${field}_${year}${tipo === 'proveedor' ? '_proveedor' : ''}`;
          const value = wideData[wideFieldKey as keyof RibReporteTributario];
          if (value !== null && value !== undefined && value !== '') {
            record[field] = value;
            hasDataForYear = true;
          }
        }

        if (hasDataForYear) {
          tallRecords.push(record);
        }
      }
      return tallRecords;
    };

    const deudorRecords = transform(document.deudor, 'deudor');
    const proveedorRecords = document.proveedor ? transform(document.proveedor, 'proveedor') : [];
    const allRecords = [...deudorRecords, ...proveedorRecords];

    if (allRecords.length === 0) {
      console.warn("No data to save.");
      return document;
    }

    // Primero, intentar eliminar registros existentes para este ID
    const { error: deleteError } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Error deleting old RIB records:', deleteError);
      // Continue anyway, might be a new record
    }

    // Insertar los nuevos registros
    const { error: insertError } = await supabase
      .from('rib_reporte_tributario')
      .insert(allRecords);

    if (insertError) {
      console.error('Error inserting RIB records:', insertError);
      throw new Error(`Error al guardar el reporte: ${insertError.message}`);
    }

    const savedDocument = await this.getById(reportId);
    if (!savedDocument) {
      throw new Error("Failed to retrieve document after saving.");
    }
    return savedDocument;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rib_reporte_tributario')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting RIB reporte tributario:', error);
      throw new Error(`Error al eliminar el reporte: ${error.message}`);
    }
  }
}