export type ReporteTributarioAuditAction = 'created' | 'updated' | 'deleted';

export interface ReporteTributarioAuditLog {
  id: string;
  reporte_tributario_id: number; // number en TypeScript maneja tanto INTEGER como BIGINT
  user_id: string | null;
  user_email: string | null;
  action: ReporteTributarioAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface ReporteTributarioAuditLogWithUserInfo extends ReporteTributarioAuditLog {
  user_full_name?: string;
}

