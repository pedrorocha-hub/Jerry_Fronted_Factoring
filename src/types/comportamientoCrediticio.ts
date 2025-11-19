export type CrediticioStatus = 'Borrador' | 'En revisión' | 'Aprobado' | 'Rechazado';

export interface ComportamientoCrediticio {
  id: string;
  ruc: string;
  nombre_empresa: string | null;
  user_id: string | null;
  status: CrediticioStatus | null;
  created_at: string;
  updated_at: string;
  proveedor: string | null;
  solicitud_id: string | null;
  
  equifax_score: string | null;
  sentinel_score: string | null;
  equifax_calificacion: string | null;
  sentinel_calificacion: string | null;
  equifax_deuda_directa: number | null;
  sentinel_deuda_directa: number | null;
  equifax_deuda_indirecta: number | null;
  sentinel_deuda_indirecta: number | null;
  equifax_impagos: number | null;
  sentinel_impagos: number | null;
  equifax_deuda_sunat: number | null;
  sentinel_deuda_sunat: number | null;
  equifax_protestos: number | null;
  sentinel_protestos: number | null;
  validado_por: string | null;
  apefac_descripcion: string | null;
  comentarios: string | null;

  deudor: string | null;
  deudor_equifax_score: string | null;
  deudor_sentinel_score: string | null;
  deudor_equifax_calificacion: string | null;
  deudor_sentinel_calificacion: string | null;
  deudor_equifax_deuda_directa: number | null;
  deudor_sentinel_deuda_directa: number | null;
  deudor_equifax_deuda_indirecta: number | null;
  deudor_sentinel_deuda_indirecta: number | null;
  deudor_equifax_impagos: number | null;
  deudor_sentinel_impagos: number | null;
  deudor_equifax_deuda_sunat: number | null;
  deudor_sentinel_deuda_sunat: number | null;
  deudor_equifax_protestos: number | null;
  deudor_sentinel_protestos: number | null;
  deudor_apefac_descripcion: string | null;
  deudor_comentarios: string | null;
}

export interface ComportamientoCrediticioInsert {
  ruc: string;
  nombre_empresa?: string | null;
  user_id: string | null;
  status?: CrediticioStatus;
  proveedor?: string | null;
  solicitud_id?: string | null;

  equifax_score?: string | null;
  sentinel_score?: string | null;
  equifax_calificacion?: string | null;
  sentinel_calificacion?: string | null;
  equifax_deuda_directa?: number | null;
  sentinel_deuda_directa?: number | null;
  equifax_deuda_indirecta?: number | null;
  sentinel_deuda_indirecta?: number | null;
  equifax_impagos?: number | null;
  sentinel_impagos?: number | null;
  equifax_deuda_sunat?: number | null;
  sentinel_deuda_sunat?: number | null;
  equifax_protestos?: number | null;
  sentinel_protestos?: number | null;
  validado_por?: string | null;
  apefac_descripcion?: string | null;
  comentarios?: string | null;

  deudor?: string | null;
  deudor_equifax_score?: string | null;
  deudor_sentinel_score?: string | null;
  deudor_equifax_calificacion?: string | null;
  deudor_sentinel_calificacion?: string | null;
  deudor_equifax_deuda_directa?: number | null;
  deudor_sentinel_deuda_directa?: number | null;
  deudor_equifax_deuda_indirecta?: number | null;
  deudor_sentinel_deuda_indirecta?: number | null;
  deudor_equifax_impagos?: number | null;
  deudor_sentinel_impagos?: number | null;
  deudor_equifax_deuda_sunat?: number | null;
  deudor_sentinel_deuda_sunat?: number | null;
  deudor_equifax_protestos?: number | null;
  deudor_sentinel_protestos?: number | null;
  deudor_apefac_descripcion?: string | null;
  deudor_comentarios?: string | null;
}

export interface ComportamientoCrediticioUpdate {
  status?: CrediticioStatus;
  nombre_empresa?: string | null;
  proveedor?: string | null;
  solicitud_id?: string | null;

  equifax_score?: string | null;
  sentinel_score?: string | null;
  equifax_calificacion?: string | null;
  sentinel_calificacion?: string | null;
  equifax_deuda_directa?: number | null;
  sentinel_deuda_directa?: number | null;
  equifax_deuda_indirecta?: number | null;
  sentinel_deuda_indirecta?: number | null;
  equifax_impagos?: number | null;
  sentinel_impagos?: number | null;
  equifax_deuda_sunat?: number | null;
  sentinel_deuda_sunat?: number | null;
  equifax_protestos?: number | null;
  sentinel_protestos?: number | null;
  validado_por?: string | null;
  apefac_descripcion?: string | null;
  comentarios?: string | null;

  deudor?: string | null;
  deudor_equifax_score?: string | null;
  deudor_sentinel_score?: string | null;
  deudor_equifax_calificacion?: string | null;
  deudor_sentinel_calificacion?: string | null;
  deudor_equifax_deuda_directa?: number | null;
  deudor_sentinel_deuda_directa?: number | null;
  deudor_equifax_deuda_indirecta?: number | null;
  deudor_sentinel_deuda_indirecta?: number | null;
  deudor_equifax_impagos?: number | null;
  deudor_sentinel_impagos?: number | null;
  deudor_equifax_deuda_sunat?: number | null;
  deudor_sentinel_deuda_sunat?: number | null;
  deudor_equifax_protestos?: number | null;
  deudor_sentinel_protestos?: number | null;
  deudor_apefac_descripcion?: string | null;
  deudor_comentarios?: string | null;
}