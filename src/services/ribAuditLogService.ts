import { supabase } from '@/integrations/supabase/client';
import { RibAuditLog, RibAuditLogWithUserInfo } from '@/types/rib-audit-log';

export class RibAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un RIB específico
   */
  static async getLogsByRibId(ribId: string): Promise<RibAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('rib_audit_log')
        .select('*')
        .eq('rib_id', ribId)
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
            } as RibAuditLogWithUserInfo;
          }
          return log as RibAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching RIB audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un RIB
   */
  static async getLastChange(ribId: string): Promise<RibAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('rib_audit_log')
        .select('*')
        .eq('rib_id', ribId)
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
        } as RibAuditLogWithUserInfo;
      }

      return data as RibAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last RIB change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(ribId: string): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsByRibId(ribId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching RIB change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}