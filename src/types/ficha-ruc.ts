import { Accionista } from './accionista';

export interface FichaRuc {
  id: number;
  nombre_empresa: string;
  ruc: string;
  actividad_empresa?: string;
  fecha_inicio_actividades?: string;
  estado_contribuyente?: string;
  domicilio_fiscal?: string;
  nombre_representante_legal?: string;
  created_at: string;
  updated_at: string;
  accionistas?: Accionista[];
}

export interface FichaRucInsert {
  nombre_empresa: string;
  ruc: string;
  actividad_empresa?: string;
  fecha_inicio_actividades?: string;
  estado_contribuyente?: string;
  domicilio_fiscal?: string;
  nombre_representante_legal?: string;
}

export interface FichaRucUpdate {
  nombre_empresa?: string;
  ruc?: string;
  actividad_empresa?: string;
  fecha_inicio_actividades?: string;
  estado_contribuyente?: string;
  domicilio_fiscal?: string;
  nombre_representante_legal?: string;
  updated_at?: string;
}