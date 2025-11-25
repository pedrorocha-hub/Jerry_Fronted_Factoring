import { TipoProducto } from "@/types/solicitud-operacion";

export type DocumentTypeKey = 
  | 'FICHA_RUC' 
  | 'SENTINEL' 
  | 'REPORTE_TRIBUTARIO' 
  | 'FACTURA' 
  | 'SUSTENTOS' 
  | 'EEFF' 
  | 'VIGENCIA_PODER' 
  | 'EVIDENCIA_VISITA'
  | 'DNI_REPRESENTANTE' // Nuevo
  | 'COPIA_LITERAL';    // Nuevo

export const DOCUMENT_LABELS: Record<DocumentTypeKey, string> = {
  FICHA_RUC: 'Ficha RUC',
  SENTINEL: 'Reporte Sentinel',
  REPORTE_TRIBUTARIO: 'Reporte Tributario SUNAT',
  FACTURA: 'Factura a Negociar',
  SUSTENTOS: 'Sustentos (Guías/OC/Conformidad)',
  EEFF: 'Estados Financieros (DJ Anual)',
  VIGENCIA_PODER: 'Vigencia de Poder',
  EVIDENCIA_VISITA: 'Fotos/Evidencia Visita',
  DNI_REPRESENTANTE: 'DNI Representante Legal',
  COPIA_LITERAL: 'Copia Literal'
};

export const PRODUCT_REQUIREMENTS: Record<TipoProducto, { required: DocumentTypeKey[], optional: DocumentTypeKey[] }> = {
  FACTORING: {
    // FACTORING: La Factura y los Sustentos son el núcleo de la operación.
    required: [
      'REPORTE_TRIBUTARIO', 
      'FACTURA', 
      'SUSTENTOS', 
      'VIGENCIA_PODER',
      'DNI_REPRESENTANTE'
    ],
    optional: [
      'EEFF', // Opcional en Factoring puntual a veces, pero recomendable
      'FICHA_RUC', 
      'SENTINEL',
      'EVIDENCIA_VISITA',
      'COPIA_LITERAL'
    ]
  },
  CONFIRMING: {
    // CONFIRMING: Se basa más en la línea del pagador y análisis financiero del proveedor
    required: [
      'REPORTE_TRIBUTARIO', 
      'EEFF', 
      'VIGENCIA_PODER',
      'DNI_REPRESENTANTE'
    ],
    // La factura puede no existir aún en el momento del análisis de línea
    optional: [
      'FACTURA', 
      'SUSTENTOS', 
      'FICHA_RUC', 
      'SENTINEL',
      'EVIDENCIA_VISITA',
      'COPIA_LITERAL'
    ]
  },
  LINEA: {
    // LINEA (Capital de Trabajo / General)
    required: [
      'REPORTE_TRIBUTARIO', 
      'EEFF', 
      'VIGENCIA_PODER',
      'DNI_REPRESENTANTE',
      'COPIA_LITERAL'
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