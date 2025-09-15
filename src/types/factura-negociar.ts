export interface FacturaNegociar {
  id: number;
  ficha_ruc_id: number;
  numero_factura: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  monto_total?: number;
  monto_igv?: number;
  monto_neto?: number;
  estado_negociacion: 'Pendiente' | 'Negociada' | 'Vencida';
  fecha_negociacion?: string;
  monto_negociado?: number;
  created_at: string;
  updated_at: string;
}

export interface FacturaNegociarInsert {
  ficha_ruc_id: number;
  numero_factura: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  monto_total?: number;
  monto_igv?: number;
  monto_neto?: number;
  estado_negociacion?: 'Pendiente' | 'Negociada' | 'Vencida';
  fecha_negociacion?: string;
  monto_negociado?: number;
}

export interface FacturaNegociarUpdate {
  numero_factura?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  monto_total?: number;
  monto_igv?: number;
  monto_neto?: number;
  estado_negociacion?: 'Pendiente' | 'Negociada' | 'Vencida';
  fecha_negociacion?: string;
  monto_negociado?: number;
  updated_at?: string;
}

// Tipo extendido que incluye datos de la ficha RUC
export interface FacturaNegociarWithFicha extends FacturaNegociar {
  ficha_ruc?: {
    id: number;
    nombre_empresa: string;
    ruc: string;
  };
}