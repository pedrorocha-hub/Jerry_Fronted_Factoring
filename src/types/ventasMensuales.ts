export type VentasStatus = 'borrador' | 'en_revision' | 'completado';

// Función para convertir status del backend al frontend
export const getVentasStatusDisplay = (status: VentasStatus | null | undefined): string => {
  switch (status) {
    case 'borrador':
      return 'Borrador';
    case 'en_revision':
      return 'En revision';
    case 'completado':
      return 'Completado';
    default:
      return 'Borrador';
  }
};

export interface VentasMensuales {
  id: string;
  proveedor_ruc: string;
  deudor_ruc: string | null;
  anio: number;
  tipo_entidad: 'proveedor' | 'deudor';
  enero: number | null;
  febrero: number | null;
  marzo: number | null;
  abril: number | null;
  mayo: number | null;
  junio: number | null;
  julio: number | null;
  agosto: number | null;
  setiembre: number | null;
  octubre: number | null;
  noviembre: number | null;
  diciembre: number | null;
  status: VentasStatus;
  validado_por: string | null;
  user_id: string | null;
  solicitud_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VentasMensualesSummary {
  id: string;
  ruc: string;
  nombre_empresa: string | null;
  last_updated_at: string;
  status: VentasStatus;
  creator_name: string | null;
  solicitud_id: string | null;
}