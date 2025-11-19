export type FichaRucAuditAction = 'created' | 'updated' | 'deleted';

export interface FichaRucAuditLog {
  id: string;
  ficha_ruc_id: number;
  user_id: string | null;
  user_email: string | null;
  action: FichaRucAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface FichaRucAuditLogWithUserInfo extends FichaRucAuditLog {
  user_full_name?: string;
}
