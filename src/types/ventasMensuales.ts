export type VentasStatus = 'Borrador' | 'Completado' | 'Pendiente';

export interface VentasMensuales {
  id: string;
  proveedor_ruc: string;
  deudor_ruc?: string;
  status: VentasStatus;
  created_at: string;
  updated_at: string;
  user_id?: string;
  validado_por?: string;
  [key: string]: any; // Para los meses
}

export interface VentasMensualesSummary {
  ruc: string;
  nombre_empresa: string;
  last_updated_at: string;
  status: VentasStatus;
  creator_name: string;
}