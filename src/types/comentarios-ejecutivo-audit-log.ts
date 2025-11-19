export interface ComentariosEjecutivoAuditLog {
  id: string;
  comentario_ejecutivo_id: string;
  user_id: string | null;
  user_email: string | null;
  action: 'created' | 'updated' | 'deleted';
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface ComentariosEjecutivoAuditLogWithUserInfo extends ComentariosEjecutivoAuditLog {
  user_full_name?: string;
}

export interface ComentariosEjecutivoAuditLogStats {
  totalChanges: number;
  lastModifiedBy: string | null;
  lastModifiedAt: string | null;
  changesByAction: {
    created: number;
    updated: number;
    deleted: number;
  };
}
