export type ComportamientoCrediticioAuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface ComportamientoCrediticioAuditLog {
  id: string;
  comportamiento_crediticio_id: string;
  user_id: string | null;
  user_email: string | null;
  action: ComportamientoCrediticioAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface ComportamientoCrediticioAuditLogWithUserInfo extends ComportamientoCrediticioAuditLog {
  user_full_name?: string;
}