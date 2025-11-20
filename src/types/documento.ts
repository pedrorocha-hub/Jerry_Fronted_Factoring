export type DocumentoTipo = 
  | 'ficha_ruc' 
  | 'representante_legal' 
  | 'cuenta_bancaria' 
  | 'eeff'
  | 'factura_negociar' 
  | 'reporte_tributario' 
  | 'sentinel'
  | 'sustentos'      // Nuevo
  | 'vigencia_poder' // Nuevo
  | 'evidencia_visita'; // Nuevo

export type DocumentoEstado = 'pending' | 'processing' | 'completed' | 'error';

export interface Documento {
  id: string;
  tipo: DocumentoTipo;
  storage_path: string;
  estado: DocumentoEstado;
  nombre_archivo: string | null;
  tamaño_archivo: number | null;
  created_by: any;
  created_at: string;
  updated_at: string;
  error_msg: string | null;
  solicitud_id?: string | null; // Opcional para vincular directamente
}

export type DocumentoInsert = Omit<Documento, 'id' | 'created_at' | 'updated_at' | 'error_msg'>;

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}