export interface ReporteTributario {
  id: number;
  anio_reporte: number;
  razon_social?: string | null;
  ruc: string;
  fecha_emision?: string | null;
  ruc_fecha_informacion?: string | null;
  ruc_nombre_comercial?: string | null;
  ruc_fecha_inscripcion?: string | null;
  ruc_fecha_inicio_actividades?: string | null;
  ruc_estado_contribuyente?: string | null;
  ruc_condicion_contribuyente?: string | null;
  ruc_domicilio_fiscal?: string | null;
  ruc_actividad_comercio_exterior?: string | null;
  ruc_actividad_economica?: string | null;
  facturacion_sistema_emision_comprobante?: string | null;
  facturacion_sistema_contabilidad?: string | null;
  facturacion_comprobantes_autorizados?: string | null;
  facturacion_sistema_emision_electronica?: string | null;
  facturacion_afiliado_ple_desde?: string | null;
  renta_fecha_informacion?: string | null;
  renta_ingresos_netos?: number | null;
  renta_otros_ingresos?: number | null;
  renta_total_activos_netos?: number | null;
  renta_total_cuentas_por_pagar?: number | null;
  renta_total_patrimonio?: number | null;
  renta_capital_social?: number | null;
  renta_resultado_bruto?: number | null;
  renta_resultado_antes_participaciones?: number | null;
  renta_importe_pagado?: number | null;
  itan_presento_declaracion?: boolean | null;
  itan_base_imponible?: number | null;
  itan_itan_a_pagar?: number | null;
  itan_cuotas_cantidad?: number | null;
  itan_cuotas_monto?: number | null;
  ingresos_enero?: number | null;
  ingresos_febrero?: number | null;
  ingresos_marzo?: number | null;
  ingresos_abril?: number | null;
  ingresos_mayo?: number | null;
  ingresos_junio?: number | null;
  ingresos_julio?: number | null;
  ingresos_agosto?: number | null;
  ingresos_setiembre?: number | null;
  ingresos_octubre?: number | null;
  ingresos_noviembre?: number | null;
  ingresos_diciembre?: number | null;
  ventas_enero?: number | null;
  ventas_febrero?: number | null;
  ventas_marzo?: number | null;
  ventas_abril?: number | null;
  ventas_mayo?: number | null;
  ventas_junio?: number | null;
  ventas_julio?: number | null;
  ventas_agosto?: number | null;
  ventas_setiembre?: number | null;
  ventas_octubre?: number | null;
  ventas_noviembre?: number | null;
  ventas_diciembre?: number | null;
  ventas_total_ingresos?: number | null;
  ventas_total_essalud?: number | null;
  created_at: string;
  updated_at: string;
}

export type ReporteTributarioInsert = Omit<ReporteTributario, 'id' | 'created_at' | 'updated_at'>;
export type ReporteTributarioUpdate = Partial<ReporteTributarioInsert>;

// Tipo extendido que incluye datos de la ficha RUC
export interface ReporteTributarioWithFicha extends ReporteTributario {
  ficha_ruc?: {
    id: number;
    nombre_empresa: string;
    ruc: string;
  };
}