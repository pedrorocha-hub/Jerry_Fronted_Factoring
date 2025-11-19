export interface SolicitudOperacionExpInt {
  id: string;
  comportamiento_crediticio_id: string;
  deudor: string | null;
  fecha_otorgamiento: string | null;
  fecha_vencimiento: string | null;
  moneda: string | null;
  fecha_pago: string | null;
  monto: number | null;
  created_at: string;
  updated_at: string;
}

export type SolicitudOperacionExpIntInsert = Omit<SolicitudOperacionExpInt, 'id' | 'created_at' | 'updated_at'>;
export type SolicitudOperacionExpIntUpdate = Partial<Omit<SolicitudOperacionExpInt, 'id' | 'created_at' | 'updated_at' | 'comportamiento_crediticio_id'>>;