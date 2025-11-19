export interface OperacionRiesgo {
  id: string;
  ruc: string;
  producto?: string;
  proveedor?: string;
  lp_vigente_gve?: string;
  riesgo_aprobado?: string;
  propuesta_comercial?: string;
  exposicion_total?: string;
  direccion?: string;
  visita?: string;
  telefono_contacto?: string;
  created_at: string;
  updated_at: string;
}

export type OperacionRiesgoInsert = Omit<OperacionRiesgo, 'id' | 'created_at' | 'updated_at'>;
export type OperacionRiesgoUpdate = Partial<OperacionRiesgoInsert>;