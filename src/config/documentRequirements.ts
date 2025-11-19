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
  REPORTE_TRIBUTARIO: 'Reporte Tributario (SUNAT)',
  FACTURA: 'Factura a Negociar',
  EEFF: 'Estados Financieros (EEFF)',
  VIGENCIA_PODER: 'Vigencia de Poder / DNI'
};

export const PRODUCT_REQUIREMENTS: Record<TipoProducto, { required: DocumentTypeKey[], optional: DocumentTypeKey[] }> = {
  FACTORING: {
    // Factoring exige la FACTURA
    required: ['FICHA_RUC', 'SENTINEL', 'FACTURA', 'REPORTE_TRIBUTARIO'],
    optional: ['EEFF', 'VIGENCIA_PODER']
  },
  CONFIRMING: {
    // Confirming exige los EEFF
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF', 'REPORTE_TRIBUTARIO'],
    optional: ['FACTURA', 'VIGENCIA_PODER']
  },
  LINEA: {
    required: ['FICHA_RUC', 'SENTINEL', 'EEFF', 'REPORTE_TRIBUTARIO', 'VIGENCIA_PODER'],
    optional: ['FACTURA']
  }
};