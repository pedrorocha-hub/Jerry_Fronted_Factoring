export type RibStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface Rib {
  id: string;
  ruc: string;
  nombre_empresa: string | null;
  direccion: string | null;
  como_llego_lcp: string | null;
  telefono: string | null;
  grupo_economico: string | null;
  visita: string | null;
  status: RibStatus | null;
  descripcion_empresa: string | null;
  inicio_actividades: string | null;
  relacion_comercial_deudor: string | null;
  validado_por: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  solicitud_id: string | null;
}

export interface RibWithDetails extends Rib {
  profiles?: { full_name: string | null } | null;
}

export type RibInsert = Omit<Rib, 'id' | 'created_at' | 'updated_at'>;
export type RibUpdate = Partial<RibInsert>;