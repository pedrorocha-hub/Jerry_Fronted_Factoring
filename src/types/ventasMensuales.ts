export interface VentasMensualesSummary {
  id: string;
  ruc: string;
  nombre_empresa: string;
  last_updated_at: string;
  status: string | null;
  creator_name: string | null;
  solicitud_id?: string | null;
}