import { TipoProducto } from "@/types/solicitud-operacion";

export type DocumentTypeKey = 
  | 'FICHA_RUC' 
  | 'SENTINEL' 
  | 'REPORTE_TRIBUTARIO' 
  | 'FACTURA' 
  | 'EEFF' 
  | 'VIGENCIA_PODER';

export const DOCUMENT_LABELS: Record<DocumentTypeKey, string> = {
  FICHA_RUC: 'Ficha RUC',
  SENTINEL: 'Reporte Sentinel',
  REPORTE_TRIBUTARIO: 'Reporte Tributario',
  FACTURA: 'Factura Negociable',
  EEFF: 'Estados Financieros (EEFF)',
  VIGENCIA_PODER: 'Vigencia de Poder'
};

export const PRODUCT_REQUIREMENTS: Record<TipoProducto, { required: DocumentTypeKey[], optional: DocumentTypeKey[] }> = {
  FACTORING: {
    required: ['FICHA_RUC', 'SENTINEL', 'FACTURA', 'REPORTE_TRIBUTARIO'],
    optional: ['EEFF', 'VIGENCIA_PODER']
  },
  CONFIRMING: {
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF', 'REPORTE_TRIBUTARIO'],
    optional: ['VIGENCIA_PODER']
  },
  LINEA: {
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF', 'REPORTE_TRIBUTARIO', 'VIGENCIA_PODER'],
    optional: []
  }
};