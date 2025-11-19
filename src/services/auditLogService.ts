import { supabase } from '@/integrations/supabase/client';
import { AuditLog, AuditLogWithUserInfo } from '@/types/audit-log';

export class AuditLogService {
  /**
   * Obtener todos los logs de auditoría para una solicitud específica
   */
  static async getLogsBySolicitudId(solicitudId: string): Promise<AuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_unified_audit_log_for_solicitud', { p_solicitud_id: solicitudId });

      if (error) throw error;

      // La función RPC ya debería devolver user_full_name, pero mantenemos el fallback por si acaso
      const logsWithUserInfo = await Promise.all(
        (data || []).map(async (log) => {
          if (log.user_id && !log.user_full_name) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', log.user_id)
              .single();

            return {
              ...log,
              user_full_name: userData?.full_name || null,
            } as AuditLogWithUserInfo;
          }
          return log as AuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de una solicitud
   */
  static async getLastChange(solicitudId: string): Promise<AuditLogWithUserInfo | null> {
    try {
      const logs = await this.getLogsBySolicitudId(solicitudId);
      return logs.length > 0 ? logs[0] : null;
    } catch (error) {
      console.error('Error fetching last change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(solicitudId: string): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsBySolicitudId(solicitudId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}