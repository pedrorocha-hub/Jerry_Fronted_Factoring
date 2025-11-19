export type VentasMensualesAuditAction = 'created' | 'updated' | 'status_changed' | 'deleted';

export interface VentasMensualesAuditLog {
  id: string;
  ventas_mensuales_id: string;
  user_id: string | null;
  user_email: string | null;
  action: VentasMensualesAuditAction;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface VentasMensualesAuditLogWithUserInfo extends VentasMensualesAuditLog {
  user_full_name?: string;
}
