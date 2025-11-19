import { supabase } from '@/integrations/supabase/client';
import { RibReporteTributarioAuditLog, RibReporteTributarioAuditLogWithUserInfo } from '@/types/rib-reporte-tributario-audit-log';

export class RibReporteTributarioAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un RIB Reporte Tributario específico
   */
  static async getLogsByReporteId(reporteId: string): Promise<RibReporteTributarioAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('rib_reporte_tributario_audit_log')
        .select('*')
        .eq('rib_reporte_tributario_id', reporteId)
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
            } as RibReporteTributarioAuditLogWithUserInfo;
          }
          return log as RibReporteTributarioAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching RIB Reporte Tributario audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un RIB Reporte Tributario
   */
  static async getLastChange(reporteId: string): Promise<RibReporteTributarioAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('rib_reporte_tributario_audit_log')
        .select('*')
        .eq('rib_reporte_tributario_id', reporteId)
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
        } as RibReporteTributarioAuditLogWithUserInfo;
      }

      return data as RibReporteTributarioAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last RIB Reporte Tributario change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(reporteId: string): Promise<{
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
      console.error('Error fetching RIB Reporte Tributario change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}
