export type AccionistaAuditAction = 'created' | 'updated' | 'deleted';

export interface AccionistaAuditLog {
  id: string;
  accionista_id: string;
  user_id: string | null;
  user_email: string | null;
  action: AccionistaAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface AccionistaAuditLogWithUserInfo extends AccionistaAuditLog {
  user_full_name?: string;
  ruc?: string;
}
