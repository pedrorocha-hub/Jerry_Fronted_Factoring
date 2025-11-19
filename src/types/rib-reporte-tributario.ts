export type RibReporteTributarioStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface RibReporteTributarioData {
  id?: string;
  ruc: string;
  proveedor_ruc?: string;
  anio: number;
  tipo_entidad: 'deudor' | 'proveedor';
  solicitud_id?: string | null;
  
  // Campos del estado de situación
  cuentas_por_cobrar_giro?: number | null;
  total_activos?: number | null;
  cuentas_por_pagar_giro?: number | null;
  total_pasivos?: number | null;
  capital_pagado?: number | null;
  total_patrimonio?: number | null;
  total_pasivo_patrimonio?: number | null;
  
  // Estados de resultados
  ingreso_ventas?: number | null;
  utilidad_bruta?: number | null;
  utilidad_antes_impuesto?: number | null;
  
  // Índices financieros
  solvencia?: number | null;
  gestion?: number | null;
  
  // Metadatos
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: RibReporteTributarioStatus;
}

// Interface para compatibilidad con el componente existente
export interface RibReporteTributario {
  id?: string;
  ruc: string;
  proveedor_ruc?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: RibReporteTributarioStatus;
  solicitud_id?: string | null;
  
  // Campos del deudor por año
  cuentas_por_cobrar_giro_2022?: number | null;
  cuentas_por_cobrar_giro_2023?: number | null;
  cuentas_por_cobrar_giro_2024?: number | null;
  total_activos_2022?: number | null;
  total_activos_2023?: number | null;
  total_activos_2024?: number | null;
  cuentas_por_pagar_giro_2022?: number | null;
  cuentas_por_pagar_giro_2023?: number | null;
  cuentas_por_pagar_giro_2024?: number | null;
  total_pasivos_2022?: number | null;
  total_pasivos_2023?: number | null;
  total_pasivos_2024?: number | null;
  capital_pagado_2022?: number | null;
  capital_pagado_2023?: number | null;
  capital_pagado_2024?: number | null;
  total_patrimonio_2022?: number | null;
  total_patrimonio_2023?: number | null;
  total_patrimonio_2024?: number | null;
  total_pasivo_patrimonio_2022?: number | null;
  total_pasivo_patrimonio_2023?: number | null;
  total_pasivo_patrimonio_2024?: number | null;
  
  // Estados de resultados
  ingreso_ventas_2022?: number | null;
  ingreso_ventas_2023?: number | null;
  ingreso_ventas_2024?: number | null;
  utilidad_bruta_2022?: number | null;
  utilidad_bruta_2023?: number | null;
  utilidad_bruta_2024?: number | null;
  utilidad_antes_impuesto_2022?: number | null;
  utilidad_antes_impuesto_2023?: number | null;
  utilidad_antes_impuesto_2024?: number | null;
  
  // Índices financieros
  solvencia_2022?: number | null;
  solvencia_2023?: number | null;
  solvencia_2024?: number | null;
  gestion_2022?: number | null;
  gestion_2023?: number | null;
  gestion_2024?: number | null;
  
  // Campos del proveedor por año
  cuentas_por_cobrar_giro_2022_proveedor?: number | null;
  cuentas_por_cobrar_giro_2023_proveedor?: number | null;
  cuentas_por_cobrar_giro_2024_proveedor?: number | null;
  total_activos_2022_proveedor?: number | null;
  total_activos_2023_proveedor?: number | null;
  total_activos_2024_proveedor?: number | null;
  cuentas_por_pagar_giro_2022_proveedor?: number | null;
  cuentas_por_pagar_giro_2023_proveedor?: number | null;
  cuentas_por_pagar_giro_2024_proveedor?: number | null;
  total_pasivos_2022_proveedor?: number | null;
  total_pasivos_2023_proveedor?: number | null;
  total_pasivos_2024_proveedor?: number | null;
  capital_pagado_2022_proveedor?: number | null;
  capital_pagado_2023_proveedor?: number | null;
  capital_pagado_2024_proveedor?: number | null;
  total_patrimonio_2022_proveedor?: number | null;
  total_patrimonio_2023_proveedor?: number | null;
  total_patrimonio_2024_proveedor?: number | null;
  total_pasivo_patrimonio_2022_proveedor?: number | null;
  total_pasivo_patrimonio_2023_proveedor?: number | null;
  total_pasivo_patrimonio_2024_proveedor?: number | null;
  
  // Estados de resultados proveedor
  ingreso_ventas_2022_proveedor?: number | null;
  ingreso_ventas_2023_proveedor?: number | null;
  ingreso_ventas_2024_proveedor?: number | null;
  utilidad_bruta_2022_proveedor?: number | null;
  utilidad_bruta_2023_proveedor?: number | null;
  utilidad_bruta_2024_proveedor?: number | null;
  utilidad_antes_impuesto_2022_proveedor?: number | null;
  utilidad_antes_impuesto_2023_proveedor?: number | null;
  utilidad_antes_impuesto_2024_proveedor?: number | null;
  
  // Índices financieros proveedor
  solvencia_2022_proveedor?: number | null;
  solvencia_2023_proveedor?: number | null;
  solvencia_2024_proveedor?: number | null;
  gestion_2022_proveedor?: number | null;
  gestion_2023_proveedor?: number | null;
  gestion_2024_proveedor?: number | null;
}

export interface RibReporteTributarioSummary {
  id: string;
  ruc: string;
  nombre_empresa: string;
  updated_at: string;
  status: RibReporteTributarioStatus;
  creator_name: string;
}