export interface RepresentanteLegal {
  id: number;
  ficha_ruc_id: number;
  nombre_completo: string;
  numero_documento_identidad: string;
  cargo?: string;
  vigencia_poderes?: string;
  estado_civil?: string;
  domicilio?: string;
  created_at: string;
  updated_at: string;
}

export interface RepresentanteLegalInsert {
  ficha_ruc_id: number;
  nombre_completo: string;
  numero_documento_identidad: string;
  cargo?: string;
  vigencia_poderes?: string;
  estado_civil?: string;
  domicilio?: string;
}

export interface RepresentanteLegalUpdate {
  nombre_completo?: string;
  numero_documento_identidad?: string;
  cargo?: string;
  vigencia_poderes?: string;
  estado_civil?: string;
  domicilio?: string;
  updated_at?: string;
}

// Tipo extendido que incluye datos de la ficha RUC
export interface RepresentanteLegalWithFicha extends RepresentanteLegal {
  ficha_ruc?: {
    id: number;
    nombre_empresa: string;
    ruc: string;
  };
}