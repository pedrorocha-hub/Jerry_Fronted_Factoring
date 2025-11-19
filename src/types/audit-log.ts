export type AuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface AuditLog {
  id: string;
  solicitud_id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface AuditLogWithUserInfo extends AuditLog {
  user_full_name?: string;
}