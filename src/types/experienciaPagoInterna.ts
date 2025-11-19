export interface ExperienciaPagoInterna {
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

export interface ExperienciaPagoInternaInsert {
  comportamiento_crediticio_id: string;
  deudor?: string | null;
  fecha_otorgamiento?: string | null;
  fecha_vencimiento?: string | null;
  moneda?: string | null;
  fecha_pago?: string | null;
  monto?: number | null;
}

export type ExperienciaPagoInternaUpdate = Partial<Omit<ExperienciaPagoInterna, 'id' | 'comportamiento_crediticio_id' | 'created_at' | 'updated_at'>>;