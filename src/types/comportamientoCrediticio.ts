export type CrediticioStatus = 'Borrador' | 'En revisión' | 'Aprobado' | 'Rechazado';

export interface ComportamientoCrediticio {
  id: string;
  ruc: string;
  user_id: string | null;
  status: CrediticioStatus | null;
  created_at: string;
  updated_at: string;
  proveedor: string | null;
  // Futuros campos se agregarán aquí
}

export interface ComportamientoCrediticioInsert {
  ruc: string;
  user_id: string | null;
  status?: CrediticioStatus;
  proveedor?: string | null;
}

export interface ComportamientoCrediticioUpdate {
  status?: CrediticioStatus;
  proveedor?: string | null;
}