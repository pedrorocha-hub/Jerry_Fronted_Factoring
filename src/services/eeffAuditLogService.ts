import { supabase } from '@/integrations/supabase/client';
import { EeffAuditLog, EeffAuditLogWithUserInfo } from '@/types/eeff-audit-log';

export class EeffAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un EEFF específico por su ID
   */
  static async getLogsByEeffId(eeffId: string): Promise<EeffAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('eeff_audit_log')
        .select('*')
        .eq('eeff_id', eeffId)
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
            } as EeffAuditLogWithUserInfo;
          }
          return log as EeffAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching EEFF audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener logs por RUC
   */
  static async getLogsByRuc(ruc: string): Promise<EeffAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('eeff_audit_log')
        .select(`
          *,
          eeff!inner(ruc)
        `)
        .eq('eeff.ruc', ruc)
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
            } as EeffAuditLogWithUserInfo;
          }
          return log as EeffAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching EEFF audit logs by RUC:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un EEFF
   */
  static async getLastChange(eeffId: string): Promise<EeffAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('eeff_audit_log')
        .select('*')
        .eq('eeff_id', eeffId)
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
        } as EeffAuditLogWithUserInfo;
      }

      return data as EeffAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last EEFF change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(eeffId: string): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsByEeffId(eeffId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching EEFF change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}

