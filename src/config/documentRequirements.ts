import { TipoProducto } from '@/types/solicitud-operacion';

export type DocumentTypeKey = 
  | 'FICHA_RUC'
  | 'SENTINEL'
  | 'REPORTE_TRIBUTARIO'
  | 'FACTURA'
  | 'EEFF'
  | 'VIGENCIA_PODER'
  | 'SUSTENTOS'      // Nuevo: Guías, O/C, Conformidad
  | 'FOTOS_VISITA';  // Nuevo: Evidencia de visita

export const DOCUMENT_LABELS: Record<DocumentTypeKey, string> = {
  FICHA_RUC: 'Ficha RUC',
  SENTINEL: 'Reporte de Deudas (Sentinel/Equifax)',
  REPORTE_TRIBUTARIO: 'Reporte Tributario (Declaraciones)',
  FACTURA: 'Factura(s) a Negociar',
  EEFF: 'Estados Financieros (EEFF)',
  VIGENCIA_PODER: 'Vigencia de Poder',
  SUSTENTOS: 'Sustentos (Guías, O/C, Conformidad)',
  FOTOS_VISITA: 'Fotos / Evidencia de Visita'
};

interface Requirements {
  required: DocumentTypeKey[];
  optional: DocumentTypeKey[];
}

export const PRODUCT_REQUIREMENTS: Record<TipoProducto, Requirements> = {
  'Factoring': {
    required: ['FICHA_RUC', 'SENTINEL', 'FACTURA'],
    optional: ['REPORTE_TRIBUTARIO', 'EEFF', 'VIGENCIA_PODER', 'SUSTENTOS', 'FOTOS_VISITA']
  },
  'Confirming': {
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF'],
    optional: ['REPORTE_TRIBUTARIO', 'VIGENCIA_PODER', 'SUSTENTOS', 'FOTOS_VISITA']
  },
  'Capital de Trabajo': {
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF', 'REPORTE_TRIBUTARIO'],
    optional: ['VIGENCIA_PODER', 'FOTOS_VISITA', 'SUSTENTOS']
  },
  'Leaseback': {
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF'],
    optional: ['REPORTE_TRIBUTARIO', 'VIGENCIA_PODER', 'FOTOS_VISITA']
  },
  'Línea de Crédito': {
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF', 'REPORTE_TRIBUTARIO'],
    optional: ['VIGENCIA_PODER', 'FOTOS_VISITA']
  }
};