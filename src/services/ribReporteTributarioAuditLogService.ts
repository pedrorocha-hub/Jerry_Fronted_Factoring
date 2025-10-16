import { supabase } from '@/integrations/supabase/client';

export interface RibReporteTributarioAuditLog {
  id: string;
  rib_reporte_tributario_id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export class RibReporteTributarioAuditLogService {
  static async getByReporteId(reporteId: string): Promise<RibReporteTributarioAuditLog[]> {
    const { data, error } = await supabase
      .from('rib_reporte_tributario_audit_log')
      .select('*')
      .eq('rib_reporte_tributario_id', reporteId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }

    return data || [];
  }
}