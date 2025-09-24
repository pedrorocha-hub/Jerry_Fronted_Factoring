export interface Rib {
  id: string;
  ruc: string;
  status: 'draft' | 'in_review' | 'completed';
  created_at: string;
  updated_at: string;
  direccion?: string | null;
  visita?: string | null;
  contacto?: string | null;
  comentarios?: string | null;
  fianza?: string | null;
  lp?: string | null;
  producto?: string | null;
  proveedor?: string | null;
  lp_vigente_gve?: string | null;
  riesgo_aprobado?: string | null;
  propuesta_comercial?: string | null;
  exposicion_total?: string | null;
  fecha_ficha?: string | null;
  orden_servicio?: string | null;
  factura?: string | null;
  tipo_cambio?: number | null;
  moneda_operacion?: string | null;
  resumen_solicitud?: string | null;
  deudor?: string | null;
  garantias?: string | null;
  condiciones_desembolso?: string | null;
}

export type RibInsert = Omit<Rib, 'id' | 'created_at' | 'updated_at'>;
export type RibUpdate = Partial<RibInsert>;