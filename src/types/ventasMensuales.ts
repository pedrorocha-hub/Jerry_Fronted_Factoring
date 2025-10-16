export interface VentasMensualesData {
  id: string;
  proveedor_ruc: string;
  deudor_ruc?: string;
  anio: number;
  tipo_entidad: 'proveedor' | 'deudor';
  enero?: number;
  febrero?: number;
  marzo?: number;
  abril?: number;
  mayo?: number;
  junio?: number;
  julio?: number;
  agosto?: number;
  setiembre?: number;
  octubre?: number;
  noviembre?: number;
  diciembre?: number;
  status?: string;
  validado_por?: string;
  user_id?: string;
  solicitud_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VentasMensualesSummary {
  id: string;
  ruc: string;
  nombre_empresa: string;
  last_updated_at: string;
  status: string;
  creator_name: string;
  solicitud_id: string;
}