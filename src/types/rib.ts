export interface Rib {
  id: string;
  ruc: string;
  direccion?: string | null;
  como_llego_lcp?: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export type RibInsert = Omit<Rib, 'id' | 'created_at' | 'updated_at'>;
export type RibUpdate = Partial<Omit<Rib, 'id' | 'created_at' | 'updated_at'>>;