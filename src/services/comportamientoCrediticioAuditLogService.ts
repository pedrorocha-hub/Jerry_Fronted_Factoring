import { supabase } from '@/integrations/supabase/client';
import { ComportamientoCrediticioAuditLog, ComportamientoCrediticioAuditLogWithUserInfo } from '@/types/comportamiento-crediticio-audit-log';

export class ComportamientoCrediticioAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un reporte específico
   */
  static async getLogsByReportId(reportId: string): Promise<ComportamientoCrediticioAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('comportamiento_crediticio_audit_log')
        .select('*')
        .eq('comportamiento_crediticio_id', reportId)
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
            } as ComportamientoCrediticioAuditLogWithUserInfo;
          }
          return log as ComportamientoCrediticioAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Comportamiento Crediticio audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un reporte
   */
  static async getLastChange(reportId: string): Promise<ComportamientoCrediticioAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('comportamiento_crediticio_audit_log')
        .select('*')
        .eq('comportamiento_crediticio_id', reportId)
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
        } as ComportamientoCrediticioAuditLogWithUserInfo;
      }

      return data as ComportamientoCrediticioAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last Comportamiento Crediticio change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(reportId: string): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsByReportId(reportId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching Comportamiento Crediticio change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}