export interface Documento {
  id: string;
  tipo: DocumentoTipo;
  storage_path: string;
  estado: DocumentoEstado;
  nombre_archivo?: string;
  tamaño_archivo?: number;
  created_at: string;
  updated_at: string;
  error_msg?: string;
}

export type DocumentoTipo = 
  | 'ficha_ruc'
  | 'representante_legal'
  | 'cuenta_bancaria'
  | 'vigencia_poderes'
  | 'factura_negociar'
  | 'reporte_tributario'
  | 'sentinel';

export type DocumentoEstado = 'pending' | 'processing' | 'completed' | 'error';

export interface DocumentoInsert {
  tipo: DocumentoTipo;
  storage_path: string;
  estado?: DocumentoEstado;
  nombre_archivo?: string;
  tamaño_archivo?: number;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}