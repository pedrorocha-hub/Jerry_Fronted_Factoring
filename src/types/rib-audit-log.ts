export type RibAuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface RibAuditLog {
  id: string;
  rib_id: string;
  user_id: string | null;
  user_email: string | null;
  action: RibAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface RibAuditLogWithUserInfo extends RibAuditLog {
  user_full_name?: string;
}