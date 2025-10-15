export type VentasStatus = 'Borrador' | 'Completado' | 'En revisión';

export interface VentasMensuales {
  id: string;
  proveedor_ruc: string;
  deudor_ruc?: string | null;
  status: VentasStatus;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  validado_por?: string | null;
  solicitud_id?: string | null;
  [key: string]: any; // Para los meses
}

export interface VentasMensualesSummary {
  id: string;
  ruc: string;
  nombre_empresa: string;
  last_updated_at: string;
  status: VentasStatus;
  creator_name: string;
}