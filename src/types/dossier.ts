import { RibEeff } from './rib-eeff';
import { ComentarioEjecutivo } from '@/services/comentariosEjecutivoService';

export interface DossierRib {
  [key: string]: any;
  ribEeff?: RibEeff[];
  comentariosEjecutivo?: ComentarioEjecutivo | null;
}

export interface DossierSummary {
  id: string; // id from dossiers_guardados table
  solicitud_id: string;
  ruc: string;
  nombreEmpresa: string;
  status: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadorNombre: string;
  ranking?: number | null;
  sector?: string | null;
}