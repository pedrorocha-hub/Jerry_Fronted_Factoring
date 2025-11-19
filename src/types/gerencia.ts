export interface Gerente {
  id: string;
  ruc: string;
  dni: string;
  nombre: string;
  cargo?: string;
  vinculo?: string;
  calificacion?: string;
  comentario?: string;
  created_at: string;
  updated_at: string;
}

export type GerenteInsert = Omit<Gerente, 'id' | 'created_at' | 'updated_at'>;
export type GerenteUpdate = Partial<GerenteInsert>;