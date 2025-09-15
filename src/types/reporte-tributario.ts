export interface ReporteTributario {
  id: number;
  ficha_ruc_id?: number;
  // Hacer todos los campos opcionales hasta que sepamos la estructura real
  anio_reporte?: number;
  ano_reporte?: number; // Por si usa 'ano' en lugar de 'anio'
  year?: number; // Por si usa 'year'
  ingresos_netos?: number;
  ingresos?: number;
  costo_ventas?: number;
  costos?: number;
  gastos_operativos?: number;
  gastos?: number;
  utilidad_bruta?: number;
  utilidad_operativa?: number;
  utilidad_neta?: number;
  utilidad?: number;
  activo_total?: number;
  activos?: number;
  pasivo_total?: number;
  pasivos?: number;
  patrimonio_total?: number;
  patrimonio?: number;
  ratio_endeudamiento?: number;
  ratio_liquidez?: number;
  created_at?: string;
  updated_at?: string;
  // Permitir cualquier otra propiedad que pueda existir
  [key: string]: any;
}

export interface ReporteTributarioInsert {
  ficha_ruc_id: number;
  [key: string]: any; // Permitir cualquier campo
}

export interface ReporteTributarioUpdate {
  [key: string]: any; // Permitir cualquier campo
}

// Tipo extendido que incluye datos de la ficha RUC
export interface ReporteTributarioWithFicha extends ReporteTributario {
  ficha_ruc?: {
    id: number;
    nombre_empresa: string;
    ruc: string;
  };
}