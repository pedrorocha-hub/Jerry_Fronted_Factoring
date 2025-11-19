import { supabase } from '@/integrations/supabase/client';
import { SentinelAuditLog, SentinelAuditLogWithUserInfo } from '@/types/sentinel-audit-log';

export class SentinelAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un Sentinel específico por su ID
   */
  static async getLogsBySentinelId(sentinelId: string): Promise<SentinelAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('sentinel_audit_log')
        .select('*')
        .eq('sentinel_id', sentinelId)
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
            } as SentinelAuditLogWithUserInfo;
          }
          return log as SentinelAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Sentinel audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener logs por RUC
   */
  static async getLogsByRuc(ruc: string): Promise<SentinelAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('sentinel_audit_log')
        .select(`
          *,
          sentinel!inner(ruc)
        `)
        .eq('sentinel.ruc', ruc)
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
            } as SentinelAuditLogWithUserInfo;
          }
          return log as SentinelAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching Sentinel audit logs by RUC:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un Sentinel
   */
  static async getLastChange(sentinelId: string): Promise<SentinelAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('sentinel_audit_log')
        .select('*')
        .eq('sentinel_id', sentinelId)
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
        } as SentinelAuditLogWithUserInfo;
      }

      return data as SentinelAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last Sentinel change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(sentinelId: string): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsBySentinelId(sentinelId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching Sentinel change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}

