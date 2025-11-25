export type SolicitudStatus = 'Borrador' | 'En Revisión' | 'Completado';
export type TipoProducto = 'FACTORING' | 'CONFIRMING' | 'LINEA' | null;
export type TipoOperacion = 'PUNTUAL' | 'LINEA' | null;

export interface SolicitudOperacion {
  id: string;
  ruc: string;
  status: SolicitudStatus;
  created_at: string;
  updated_at: string;
  
  // Datos de contacto y visita
  direccion?: string | null;
  visita?: string | null;
  contacto?: string | null;
  visita_tipo?: 'Presencial' | 'Virtual' | 'No Realizada' | null;
  visita_fecha?: string | null;
  visita_contacto_nombre?: string | null;
  visita_contacto_cargo?: string | null;
  
  // Datos Operativos
  comentarios?: string | null;
  fianza?: string | null;
  lp?: string | null; // Línea Principal
  producto?: string | null;
  proveedor?: string | null;
  lp_vigente_gve?: string | null;
  riesgo_aprobado?: string | null; // Guardado como texto o numérico en DB, frontend lo maneja
  propuesta_comercial?: string | null;
  exposicion_total?: string | null;
  
  fecha_ficha?: string | null;
  orden_servicio?: string | null;
  factura?: string | null;
  tipo_cambio?: number | null;
  moneda_operacion?: string | null;
  resumen_solicitud?: string | null;
  
  deudor?: string | null;
  deudor_ruc?: string | null;
  garantias?: string | null;
  condiciones_desembolso?: string | null;
  
  user_id?: string | null;
  validado_por?: string | null;

  // Nuevos campos comerciales
  tipo_operacion?: TipoOperacion;
  tipo_producto?: TipoProducto;
  tasa_tea?: number | null;
  plazo_dias?: number | null;
  porcentaje_anticipo?: number | null;
  comision_estructuracion?: number | null;
  tipo_garantia?: string | null;
  tasa_minima?: number | null;
  monto_original?: number | null;
  
  // Nuevos campos RIB agregados
  antiguedad_vinculo?: string | null;
  valor_neto?: number | null;
  vigencia_aprobacion?: string | null;
  volumen_estimado?: number | null;
  experiencia_lcp?: string | null;
  condicion_pago_dias?: number | null;
  check_pagos_observados?: boolean | null;
  detalle_pagos_observados?: string | null;
  observacion_pagos?: string | null;
}

export interface SolicitudOperacionRiesgo {
  id: string;
  solicitud_id: string;
  lp?: string | null;
  producto?: string | null;
  deudor?: string | null;
  lp_vigente_gve?: string | null;
  riesgo_aprobado?: number | null;
  propuesta_comercial?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SolicitudOperacionWithRiesgos extends SolicitudOperacion {
  riesgos?: SolicitudOperacionRiesgo[];
}