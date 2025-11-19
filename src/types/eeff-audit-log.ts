export type EeffAuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface EeffAuditLog {
  id: string;
  eeff_id: string;
  user_id: string | null;
  user_email: string | null;
  action: EeffAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface EeffAuditLogWithUserInfo extends EeffAuditLog {
  user_full_name?: string;
}

