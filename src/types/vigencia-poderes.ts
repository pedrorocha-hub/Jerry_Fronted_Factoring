export interface VigenciaPoderes {
  id: number;
  representante_legal_id: number;
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
  tipo_poder?: 'General' | 'Especial' | 'Administrativo' | 'Judicial' | 'Otros';
  alcance_poderes?: string;
  estado: 'Vigente' | 'Vencido' | 'Revocado';
  created_at: string;
  updated_at: string;
}

export interface VigenciaPoderesInsert {
  representante_legal_id: number;
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
  tipo_poder?: 'General' | 'Especial' | 'Administrativo' | 'Judicial' | 'Otros';
  alcance_poderes?: string;
  estado?: 'Vigente' | 'Vencido' | 'Revocado';
}

export interface VigenciaPoderesUpdate {
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
  tipo_poder?: 'General' | 'Especial' | 'Administrativo' | 'Judicial' | 'Otros';
  alcance_poderes?: string;
  estado?: 'Vigente' | 'Vencido' | 'Revocado';
  updated_at?: string;
}

// Tipo extendido que incluye datos del representante legal
export interface VigenciaPoderesWithRepresentante extends VigenciaPoderes {
  representante_legal?: {
    id: number;
    nombre_completo: string;
    numero_documento_identidad: string;
    cargo?: string;
    ficha_ruc?: {
      id: number;
      nombre_empresa: string;
      ruc: string;
    };
  };
}