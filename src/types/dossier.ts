import { RibEeff } from './rib-eeff';

export interface DossierRib {
  [key: string]: any;
  ribEeff?: RibEeff[];
}

export interface DossierSummary {
  ruc: string;
  nombreEmpresa: string;
  status: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadorNombre: string;
  ranking?: number | null;
  sector?: string | null;
  solicitudId?: string;
}