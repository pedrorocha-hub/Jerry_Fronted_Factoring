export type GerenciaAuditAction = 'created' | 'updated' | 'deleted';

export interface GerenciaAuditLog {
  id: string;
  gerente_id: string;
  user_id: string | null;
  user_email: string | null;
  action: GerenciaAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface GerenciaAuditLogWithUserInfo extends GerenciaAuditLog {
  user_full_name?: string;
  ruc?: string;
}
