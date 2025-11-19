export type RibEeffStatus = 'Borrador' | 'En revision' | 'Completado';
export type TipoEntidad = 'proveedor' | 'deudor';

export interface RibEeff {
  id: string;
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  
  tipo_entidad?: TipoEntidad | null;
  ruc: string;
  proveedor_ruc?: string | null; // Columna para vincular deudor con proveedor
  anio_reporte?: number | null;
  status?: RibEeffStatus | null;
  solicitud_id?: string | null;

  // Activos
  activo_caja_inversiones_disponible?: number | null;
  activo_cuentas_por_cobrar_del_giro?: number | null;
  activo_cuentas_por_cobrar_relacionadas_no_comerciales?: number | null;
  activo_cuentas_por_cobrar_personal_accionistas_directores?: number | null;
  activo_otras_cuentas_por_cobrar_diversas?: number | null;
  activo_existencias?: number | null;
  activo_gastos_pagados_por_anticipado?: number | null;
  activo_otros_activos_corrientes?: number | null;
  activo_total_activo_circulante?: number | null;
  activo_cuentas_por_cobrar_comerciales_lp?: number | null;
  activo_otras_cuentas_por_cobrar_diversas_lp?: number | null;
  activo_activo_fijo_neto?: number | null;
  activo_inversiones_en_valores?: number | null;
  activo_intangibles?: number | null;
  activo_activo_diferido_y_otros?: number | null;
  activo_total_activos_no_circulantes?: number | null;
  activo_total_activos?: number | null;

  // Pasivos
  pasivo_sobregiro_bancos_y_obligaciones_corto_plazo?: number | null;
  pasivo_parte_corriente_obligaciones_bancos_y_leasing?: number | null;
  pasivo_cuentas_por_pagar_del_giro?: number | null;
  pasivo_cuentas_por_pagar_relacionadas_no_comerciales?: number | null;
  pasivo_otras_cuentas_por_pagar_diversas?: number | null;
  pasivo_dividendos_por_pagar?: number | null;
  pasivo_total_pasivos_circulantes?: number | null;
  pasivo_parte_no_corriente_obligaciones_bancos_y_leasing?: number | null;
  pasivo_cuentas_por_pagar_comerciales_lp?: number | null;
  pasivo_otras_cuentas_por_pagar_diversas_lp?: number | null;
  pasivo_otros_pasivos?: number | null;
  pasivo_total_pasivos_no_circulantes?: number | null;
  pasivo_total_pasivos?: number | null;

  // Patrimonio
  patrimonio_neto_capital_pagado?: number | null;
  patrimonio_neto_capital_adicional?: number | null;
  patrimonio_neto_excedente_de_revaluacion?: number | null;
  patrimonio_neto_reserva_legal?: number | null;
  patrimonio_neto_utilidad_perdida_acumulada?: number | null;
  patrimonio_neto_utilidad_perdida_del_ejercicio?: number | null;
  patrimonio_neto_total_patrimonio?: number | null;
  patrimonio_neto_total_pasivos_y_patrimonio?: number | null;

  [key: string]: any;
}

export type CreateRibEeffDto = Omit<RibEeff, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRibEeffDto = Partial<CreateRibEeffDto>;