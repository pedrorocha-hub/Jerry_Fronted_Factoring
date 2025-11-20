import { TipoProducto } from "@/types/solicitud-operacion";

export type DocumentTypeKey = 
  | 'FICHA_RUC' 
  | 'SENTINEL' 
  | 'REPORTE_TRIBUTARIO' 
  | 'FACTURA' 
  | 'SUSTENTOS' // Nuevo: Guías, OC, Conformidad
  | 'EEFF' 
  | 'VIGENCIA_PODER' // Nuevo: Vigencia de poder
  | 'EVIDENCIA_VISITA'; // Nuevo: Fotos de visita

export const DOCUMENT_LABELS: Record<DocumentTypeKey, string> = {
  FICHA_RUC: 'Ficha RUC (Opcional)',
  SENTINEL: 'Reporte Sentinel',
  REPORTE_TRIBUTARIO: 'Reporte Tributario SUNAT',
  FACTURA: 'Factura a Negociar',
  SUSTENTOS: 'Sustentos (Guías/OC)',
  EEFF: 'Estados Financieros',
  VIGENCIA_PODER: 'Vigencia de Poder / DNI',
  EVIDENCIA_VISITA: 'Fotos/Evidencia Visita'
};

export const PRODUCT_REQUIREMENTS: Record<TipoProducto, { required: DocumentTypeKey[], optional: DocumentTypeKey[] }> = {
  FACTORING: {
    // A. FACTORING: Factura y Reporte Tributario IMPRESCINDIBLES
    required: [
      'REPORTE_TRIBUTARIO', 
      'FACTURA', 
      'SUSTENTOS', 
      'VIGENCIA_PODER'
    ],
    // Ficha RUC y EEFF son Opcionales/Adicionales
    optional: [
      'EEFF', 
      'FICHA_RUC', 
      'SENTINEL',
      'EVIDENCIA_VISITA'
    ]
  },
  CONFIRMING: {
    // B. CONFIRMING: EEFF y Reporte Tributario IMPRESCINDIBLES
    required: [
      'REPORTE_TRIBUTARIO', 
      'EEFF', 
      'VIGENCIA_PODER'
    ],
    // Factura es Opcional (puede ser línea sin factura aún)
    optional: [
      'FACTURA', 
      'SUSTENTOS', 
      'FICHA_RUC', 
      'SENTINEL',
      'EVIDENCIA_VISITA'
    ]
  },
  LINEA: {
    // Criterio general para Línea
    required: [
      'REPORTE_TRIBUTARIO', 
      'EEFF', 
      'VIGENCIA_PODER'
    ],
    optional: [
      'FACTURA', 
      'SUSTENTOS', 
      'FICHA_RUC', 
      'SENTINEL',
      'EVIDENCIA_VISITA'
    ]
  }
};