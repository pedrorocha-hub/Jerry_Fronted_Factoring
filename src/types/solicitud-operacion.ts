export type SolicitudStatus = 'Borrador' | 'En Revisión' | 'Completado';
export type TipoProducto = 'FACTORING' | 'CONFIRMING' | 'LINEA';
export type TipoOperacion = 'PUNTUAL' | 'LINEA';

export interface SolicitudOperacion {
  id: string;
  ruc: string;
  status: SolicitudStatus;
  created_at: string;
  updated_at: string;
  
  // Campos generales
  direccion: string | null;
  visita: string | null; 
  contacto: string | null;
  
  // Estructura de Visita
  visita_tipo?: 'Presencial' | 'Virtual' | 'No Realizada' | null;
  visita_fecha?: string | null;
  visita_contacto_nombre?: string;
  visita_contacto_cargo?: string;
  visita_fotos?: string[] | null; // Nuevo: Array de rutas de fotos

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
  validado_por: string | null;
  deudor_ruc: string | null;
  
  // Lógica de negocio
  tipo_producto: TipoProducto | null;
  tipo_operacion: TipoOperacion | null;

  // Condiciones Comerciales
  porcentaje_anticipo: number | null;
  comision_estructuracion: number | null;
  plazo_dias: number | null;
  tasa_minima: number | null;
  monto_original: number | null;
  tasa_tea: number | null;
  tipo_garantia: string | null;

  // Nuevos Campos RIB
  valor_neto: number | null;
  vigencia_aprobacion: string | null;
  
  // Relación Comercial
  antiguedad_vinculo: string | null;
  volumen_estimado: number | null;
  condicion_pago_dias: number | null; // Nuevo

  // Experiencia
  experiencia_lcp: 'Nueva' | 'Recurrente' | 'Con Mora' | null;
  check_pagos_observados: boolean | null;
  detalle_pagos_observados: string | null; // Nuevo (alias para observacion_pagos en el frontend si se prefiere)
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