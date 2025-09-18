export interface Accionista {
  id: string;
  ruc: string;
  dni: string;
  nombre: string;
  porcentaje?: number;
  vinculo?: string;
  calificacion?: string;
  comentario?: string;
  created_at: string;
  updated_at: string;
}

export interface AccionistaInsert {
  ruc: string;
  dni: string;
  nombre: string;
  porcentaje?: number;
  vinculo?: string;
  calificacion?: string;
  comentario?: string;
}

export interface AccionistaUpdate {
  dni?: string;
  nombre?: string;
  porcentaje?: number;
  vinculo?: string;
  calificacion?: string;
  comentario?: string;
}