import { supabase } from '@/integrations/supabase/client';
import { RibReporteTributarioAuditLogWithUserInfo } from '@/types/rib-reporte-tributario-audit-log';

export class RibReporteTributarioAuditLogService {
  static async getLogsByReportId(reportId: string): Promise<RibReporteTributarioAuditLogWithUserInfo[]> {
    try {
      const { data, error } = await supabase
        .from('rib_reporte_tributario_audit_log')
        .select('*')
        .eq('rib_reporte_tributario_id', reportId)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
}