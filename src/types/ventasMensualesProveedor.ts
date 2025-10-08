export interface VentasMensualesProveedor {
  id: string;
  ruc: string;
  anio: number;
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
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export type VentasMensualesProveedorInsert = Omit<VentasMensualesProveedor, 'id' | 'created_at' | 'updated_at'>;
export type VentasMensualesProveedorUpdate = Partial<VentasMensualesProveedorInsert>;