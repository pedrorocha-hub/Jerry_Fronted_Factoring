export interface Accionista {
  id: string;
  ruc: string;
  dni: string;
  nombre: string;
  porcentaje: number | null;
  vinculo: string | null;
  calificacion: string | null;
  comentario: string | null;
  created_at: string;
  updated_at: string;
}

export type AccionistaInsert = Omit<Accionista, 'id' | 'created_at' | 'updated_at'>;
export type AccionistaUpdate = Partial<AccionistaInsert>;