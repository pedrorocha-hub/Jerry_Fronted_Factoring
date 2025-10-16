import { supabase } from '@/integrations/supabase/client';

export interface RibReporteTributarioAuditLog {
  id: string;
  rib_reporte_tributario_id: string;
  user_id: string | null;
  user_email: string | null;
  action: 'created' | 'updated' | 'status_changed' | 'deleted';
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export class RibReporteTributarioAuditService {
  /**
   * Obtiene todos los logs de auditoría para un reporte específico
   */
  static async getAuditLogs(reporteId: string): Promise<RibReporteTributarioAuditLog[]> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario_audit_log')
      .select('*')
      .eq('rib_reporte_tributario_id', reporteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Obtiene el conteo de cambios por tipo de acción
   */
  static async getAuditStats(reporteId: string): Promise<{
    total: number;
    created: number;
    updated: number;
    status_changed: number;
  }> {
    const logs = await this.getAuditLogs(reporteId);
    
    return {
      total: logs.length,
      created: logs.filter(log => log.action === 'created').length,
      updated: logs.filter(log => log.action === 'updated').length,
      status_changed: logs.filter(log => log.action === 'status_changed').length,
    };
  }

  /**
   * Formatea el nombre del campo para mostrar en la UI
   */
  static formatFieldName(fieldName: string): string {
    const fieldNames: Record<string, string> = {
      ruc: 'RUC',
      proveedor_ruc: 'RUC Proveedor',
      anio: 'Año',
      tipo_entidad: 'Tipo de Entidad',
      cuentas_por_cobrar_giro: 'Cuentas por Cobrar del Giro',
      total_activos: 'Total Activos',
      cuentas_por_pagar_giro: 'Cuentas por Pagar del Giro',
      total_pasivos: 'Total Pasivos',
      capital_pagado: 'Capital Pagado',
      total_patrimonio: 'Total Patrimonio',
      total_pasivo_patrimonio: 'Total Pasivo y Patrimonio',
      ingreso_ventas: 'Ingreso por Ventas',
      utilidad_bruta: 'Utilidad Bruta',
      utilidad_antes_impuesto: 'Utilidad Antes de Impuesto',
      solvencia: 'Solvencia',
      gestion: 'Gestión',
      status: 'Estado',
      solicitud_id: 'Solicitud de Operación',
    };

    return fieldNames[fieldName] || fieldName;
  }

  /**
   * Formatea el tipo de acción para mostrar en la UI
   */
  static formatAction(action: string): string {
    const actions: Record<string, string> = {
      created: 'Creado',
      updated: 'Actualizado',
      status_changed: 'Cambio de Estado',
      deleted: 'Eliminado',
    };

    return actions[action] || action;
  }

  /**
   * Obtiene el color del badge según el tipo de acción
   */
  static getActionColor(action: string): string {
    const colors: Record<string, string> = {
      created: 'bg-green-500/10 text-green-400 border-green-500/20',
      updated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      status_changed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      deleted: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return colors[action] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}