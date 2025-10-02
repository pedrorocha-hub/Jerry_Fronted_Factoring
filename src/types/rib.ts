export interface Rib {
  id: string;
  ruc: string;
  direccion?: string | null;
  como_llego_lcp?: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

export type RibInsert = Omit<Rib, 'id' | 'created_at' | 'updated_at' | 'profiles'>;
export type RibUpdate = Partial<Omit<Rib, 'id' | 'created_at' | 'updated_at' | 'profiles'>>;