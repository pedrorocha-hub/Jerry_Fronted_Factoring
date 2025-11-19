export type RibEeffAuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface RibEeffAuditLog {
  id: string;
  rib_eeff_id: string;
  user_id: string | null;
  user_email: string | null;
  action: RibEeffAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface RibEeffAuditLogWithUserInfo extends RibEeffAuditLog {
  user_full_name?: string;
}
