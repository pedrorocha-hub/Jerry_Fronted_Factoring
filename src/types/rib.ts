export interface Rib {
  id: string;
  ruc: string;
  status: 'draft' | 'in_review' | 'completed';
  created_at: string;
  updated_at: string;
  direccion?: string | null;
  visita?: string | null;
  contacto?: string | null;
  comentarios?: string | null;
  fianza?: string | null;
}

export type RibInsert = Omit<Rib, 'id' | 'created_at' | 'updated_at'>;
export type RibUpdate = Partial<RibInsert>;