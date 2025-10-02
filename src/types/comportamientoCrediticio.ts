export type CrediticioStatus = 'Borrador' | 'En revisión' | 'Aprobado' | 'Rechazado';

export interface ComportamientoCrediticio {
  id: string;
  ruc: string;
  user_id: string | null;
  status: CrediticioStatus | null;
  created_at: string;
  updated_at: string;
  proveedor: string | null;
  
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
}

export interface ComportamientoCrediticioInsert {
  ruc: string;
  user_id: string | null;
  status?: CrediticioStatus;
  proveedor?: string | null;

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
}

export interface ComportamientoCrediticioUpdate {
  status?: CrediticioStatus;
  proveedor?: string | null;

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
}