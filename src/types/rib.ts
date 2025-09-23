import { FichaRuc } from './ficha-ruc';

export interface Rib {
  id: string;
  ruc: string;
  status: 'draft' | 'completed' | 'in_review';
  created_at: string;
  updated_at: string;
  ficha_ruc?: FichaRuc;
}

export interface RibInsert {
  ruc: string;
  status?: 'draft' | 'completed' | 'in_review';
}

export interface RibUpdate {
  status?: 'draft' | 'completed' | 'in_review';
}