import { supabase } from '@/integrations/supabase/client';
import { RibEeffAuditLogWithUserInfo } from '@/types/rib-eeff-audit-log';

export const RibEeffAuditLogService = {
  async getLogsByReportId(reportId: string): Promise<RibEeffAuditLogWithUserInfo[]> {
    const { data, error } = await supabase
      .from('rib_eeff_audit_log')
      .select(`
        *,
        user:profiles(full_name)
      `)
      .eq('rib_eeff_id', reportId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RIB EEFF audit logs:', error);
      throw new Error(error.message);
    }

    return data.map((log: any) => ({
      ...log,
      user_full_name: log.user?.full_name || null,
    }));
  },
};