import { supabase } from '@/integrations/supabase/client';
import { RibEeffAuditLog, RibEeffAuditLogWithUserInfo } from '@/types/rib-eeff-audit-log';

export class RibEeffAuditLogService {
  /**
   * Obtener todos los logs de auditoría para un RIB EEFF específico por su ID
   */
  static async getLogsByRibEeffId(ribEeffId: string): Promise<RibEeffAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('rib_eeff_audit_log')
        .select('*')
        .eq('rib_eeff_id', ribEeffId)
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
            } as RibEeffAuditLogWithUserInfo;
          }
          return log as RibEeffAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching RIB EEFF audit logs:', error);
      throw error;
    }
  }

  /**
   * Obtener logs por RUC y solicitud (agrupa por ID único)
   */
  static async getLogsByRucAndSolicitud(
    ruc: string,
    solicitudId: string | null
  ): Promise<RibEeffAuditLogWithUserInfo[]> {
    try {
      let query = supabase
        .from('rib_eeff_audit_log')
        .select(`
          *,
          rib_eeff!inner(ruc, solicitud_id)
        `)
        .eq('rib_eeff.ruc', ruc);

      if (solicitudId) {
        query = query.eq('rib_eeff.solicitud_id', solicitudId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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
            } as RibEeffAuditLogWithUserInfo;
          }
          return log as RibEeffAuditLogWithUserInfo;
        })
      );

      return logsWithUserInfo;
    } catch (error) {
      console.error('Error fetching RIB EEFF audit logs by RUC:', error);
      throw error;
    }
  }

  /**
   * Obtener el último cambio de un RIB EEFF
   */
  static async getLastChange(ribEeffId: string): Promise<RibEeffAuditLogWithUserInfo | null> {
    try {
      const { data, error } = await supabase
        .from('rib_eeff_audit_log')
        .select('*')
        .eq('rib_eeff_id', ribEeffId)
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
        } as RibEeffAuditLogWithUserInfo;
      }

      return data as RibEeffAuditLogWithUserInfo;
    } catch (error) {
      console.error('Error fetching last RIB EEFF change:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de cambios
   */
  static async getChangeStats(ribEeffId: string): Promise<{
    totalChanges: number;
    lastModifiedBy: string | null;
    lastModifiedAt: string | null;
  }> {
    try {
      const logs = await this.getLogsByRibEeffId(ribEeffId);
      
      return {
        totalChanges: logs.length,
        lastModifiedBy: logs[0]?.user_full_name || logs[0]?.user_email || null,
        lastModifiedAt: logs[0]?.created_at || null,
      };
    } catch (error) {
      console.error('Error fetching RIB EEFF change stats:', error);
      return {
        totalChanges: 0,
        lastModifiedBy: null,
        lastModifiedAt: null,
      };
    }
  }
}
