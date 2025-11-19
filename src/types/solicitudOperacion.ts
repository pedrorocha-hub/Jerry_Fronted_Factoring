export type SolicitudStatus = 'Borrador' | 'En Revisión' | 'Completado';

export interface SolicitudOperacion {
  id: string;
  ruc: string;
  status: SolicitudStatus;
  created_at: string;
  updated_at: string;
  direccion: string | null;
  visita: string | null;
  contacto: string | null;
  comentarios: string | null;
  fianza: string | null;
  lp: string | null;
  producto: string | null;
  proveedor: string | null;
  lp_vigente_gve: string | null;
  riesgo_aprobado: string | null;
  propuesta_comercial: string | null;
  exposicion_total: string | null;
  fecha_ficha: string | null;
  orden_servicio: string | null;
  factura: string | null;
  tipo_cambio: number | null;
  moneda_operacion: string | null;
  resumen_solicitud: string | null;
  deudor: string | null;
  garantias: string | null;
  condiciones_desembolso: string | null;
  user_id: string | null;
}

export interface SolicitudOperacionRiesgo {
  id: string;
  solicitud_id: string;
  lp: string | null;
  producto: string | null;
  deudor: string | null;
  lp_vigente_gve: string | null;
  riesgo_aprobado: number | null;
  propuesta_comercial: number | null;
  created_at: string;
  updated_at: string;
}

export interface SolicitudOperacionWithRiesgos extends SolicitudOperacion {
  riesgos?: SolicitudOperacionRiesgo[];
  empresa_nombre?: string;
}