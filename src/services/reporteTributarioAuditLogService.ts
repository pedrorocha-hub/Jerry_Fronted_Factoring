import { supabase } from '@/integrations/supabase/client';
import { ReporteTributarioAuditLog, ReporteTributarioAuditLogWithUserInfo } from '@/types/reporte-tributario-audit-log';

export class ReporteTributarioAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un Reporte Tributario específico por su ID
   */
  static async getLogsByReporteId(reporteId: number): Promise<ReporteTributarioAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario_audit_log')
        .select('*')
        .eq('reporte_tributario_id', reporteId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con información del usuario
      const logsWithUserInfo = await Promise.all(
        (data || []).map(async (log) => {
          if (log.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', log.user_id)
              .single();

            return {
              ...log,
              user_full_name: userData?.full_name || null,
            } as ReporteTributarioAuditLogWithUserInfo;
          }
          return log as ReporteTributarioAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Reporte Tributario audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener logs por RUC
   */
  static async getLogsByRuc(ruc: string): Promise<ReporteTributarioAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario_audit_log')
        .select(`
          *,
          reporte_tributario!inner(ruc)
        `)
        .eq('reporte_tributario.ruc', ruc)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer con información del usuario
      const logsWithUserInfo = await Promise.all(
        (data || []).map(async (log) => {
          if (log.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', log.user_id)
              .single();

            return {
              ...log,
              user_full_name: userData?.full_name || null,
            } as ReporteTributarioAuditLogWithUserInfo;
          }
          return log as ReporteTributarioAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Reporte Tributario audit logs by RUC:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un Reporte Tributario
   */
  static async getLastChange(reporteId: number): Promise<ReporteTributarioAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario_audit_log')
        .select('*')
        .eq('reporte_tributario_id', reporteId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data && data.user_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user_id)
          .single();

        return {
          ...data,
          user_full_name: userData?.full_name || null,
        } as ReporteTributarioAuditLogWithUserInfo;
      }

      return data as ReporteTributarioAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last Reporte Tributario change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(reporteId: number): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsByReporteId(reporteId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching Reporte Tributario change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}

