export type SentinelAuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface SentinelAuditLog {
  id: string;
  sentinel_id: string;
  user_id: string | null;
  user_email: string | null;
  action: SentinelAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface SentinelAuditLogWithUserInfo extends SentinelAuditLog {
  user_full_name?: string;
}

