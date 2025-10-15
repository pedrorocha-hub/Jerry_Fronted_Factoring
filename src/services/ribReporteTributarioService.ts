import { supabase } from '@/integrations/supabase/client';

export interface RibReporteTributarioSummary {
  id: string;
  ruc: string;
  nombre_empresa: string | null;
  updated_at: string;
  status: string;
  creator_name: string | null;
  solicitud_id: string | null;
  anio: number;
}

export interface RibReporteTributario {
  id?: string;
  ruc: string;
  proveedor_ruc?: string | null;
  anio: number;
  tipo_entidad: 'proveedor' | 'deudor';
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
  user_id?: string | null;
  status?: string;
  solicitud_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RibReporteTributarioDocument {
  deudor: RibReporteTributario;
  proveedor?: RibReporteTributario | null;
  solicitud_id: string | null;
  status: string;
  user_id: string | null;
}

export class RibReporteTributarioService {
  // Función para limpiar campos con sufijos de año
  private static cleanFieldsWithYearSuffix(data: any): any {
    const cleaned: any = {};
    const validFields = [
      'id', 'ruc', 'proveedor_ruc', 'anio', 'tipo_entidad',
      'cuentas_por_cobrar_giro', 'total_activos', 'cuentas_por_pagar_giro',
      'total_pasivos', 'capital_pagado', 'total_patrimonio', 'total_pasivo_patrimonio',
      'ingreso_ventas', 'utilidad_bruta', 'utilidad_antes_impuesto',
      'solvencia', 'gestion', 'user_id', 'status', 'solicitud_id',
      'created_at', 'updated_at'
    ];

    for (const key in data) {
      // Solo incluir campos válidos (sin sufijos de año)
      if (validFields.includes(key)) {
        cleaned[key] = data[key];
      }
    }

    return cleaned;
  }

  static async getAllSummaries(): Promise<RibReporteTributarioSummary[]> {
    const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');
    
    if (error) {
      console.error('Error fetching RIB reporte tributario summaries:', error);
      throw new Error(`Error al obtener los reportes: ${error.message}`);
    }
    
    return data || [];
  }

  static async getById(id: string): Promise<RibReporteTributarioDocument> {
    // Obtener todos los registros relacionados (deudor y proveedor)
    const { data, error } = await supabase
      .from('rib_reporte_tributario')
      .select('*')
      .eq('id', id);
    
    if (error) {
      console.error('Error fetching RIB reporte tributario by ID:', error);
      throw new Error(`Error al obtener el reporte: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('Reporte no encontrado');
    }

    // Separar deudor y proveedor
    const deudorRecord = data.find(r => r.tipo_entidad === 'deudor');
    const proveedorRecord = data.find(r => r.tipo_entidad === 'proveedor');

    if (!deudorRecord) {
      throw new Error('No se encontró el registro del deudor');
    }

    return {
      deudor: deudorRecord,
      proveedor: proveedorRecord || null,
      solicitud_id: deudorRecord.solicitud_id,
      status: deudorRecord.status || 'Borrador',
      user_id: deudorRecord.user_id
    };
  }

  static async save(document: RibReporteTributarioDocument): Promise<RibReporteTributarioDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Limpiar campos del deudor
    const cleanedDeudor = this.cleanFieldsWithYearSuffix(document.deudor);
    
    // Preparar el registro del deudor
    const deudorData = {
      ...cleanedDeudor,
      user_id: user?.id,
      status: document.status || 'Borrador',
      solicitud_id: document.solicitud_id,
      tipo_entidad: 'deudor' as const
    };

    // Si existe ID, actualizar; si no, crear
    if (document.deudor.id) {
      const { data: updatedDeudor, error: deudorError } = await supabase
        .from('rib_reporte_tributario')
        .update(deudorData)
        .eq('id', document.deudor.id)
        .select()
        .single();

      if (deudorError) {
        console.error('Error updating deudor:', deudorError);
        throw new Error(`Error al actualizar el deudor: ${deudorError.message}`);
      }

      // Actualizar o crear proveedor si existe
      if (document.proveedor) {
        const cleanedProveedor = this.cleanFieldsWithYearSuffix(document.proveedor);
        
        const proveedorData = {
          ...cleanedProveedor,
          user_id: user?.id,
          status: document.status || 'Borrador',
          solicitud_id: document.solicitud_id,
          tipo_entidad: 'proveedor' as const
        };

        if (document.proveedor.id) {
          await supabase
            .from('rib_reporte_tributario')
            .update(proveedorData)
            .eq('id', document.proveedor.id);
        } else {
          await supabase
            .from('rib_reporte_tributario')
            .insert(proveedorData);
        }
      }

      return await this.getById(document.deudor.id);
    } else {
      // Crear nuevo registro de deudor
      const { data: newDeudor, error: deudorError } = await supabase
        .from('rib_reporte_tributario')
        .insert(deudorData)
        .select()
        .single();

      if (deudorError) {
        console.error('Error creating deudor:', deudorError);
        throw new Error(`Error al crear el deudor: ${deudorError.message}`);
      }

      // Crear proveedor si existe
      if (document.proveedor) {
        const cleanedProveedor = this.cleanFieldsWithYearSuffix(document.proveedor);
        
        const proveedorData = {
          ...cleanedProveedor,
          user_id: user?.id,
          status: document.status || 'Borrador',
          solicitud_id: document.solicitud_id,
          tipo_entidad: 'proveedor' as const
        };

        await supabase
          .from('rib_reporte_tributario')
          .insert(proveedorData);
      }

      return await this.getById(newDeudor.id);
    }
  }

  static async delete(id: string): Promise<void> {
    // Eliminar todos los registros relacionados (deudor y proveedor)
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