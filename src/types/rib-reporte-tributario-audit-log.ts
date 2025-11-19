export type RibReporteTributarioAuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface RibReporteTributarioAuditLog {
  id: string;
  rib_reporte_tributario_id: string;
  user_id: string | null;
  user_email: string | null;
  action: RibReporteTributarioAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface RibReporteTributarioAuditLogWithUserInfo extends RibReporteTributarioAuditLog {
  user_full_name?: string;
}
