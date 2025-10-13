export interface DossierRib {
  [key: string]: any;
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
}