export type VentasProveedorStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface VentasMensualesProveedor {
  id: string;
  ruc: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  status: VentasProveedorStatus | null;
  validado_por: string | null;

  [key: string]: number | string | null; // Para permitir acceso dinámico a las columnas de mes_año
}

export type VentasMensualesProveedorInsert = Omit<VentasMensualesProveedor, 'id' | 'created_at' | 'updated_at'>;
export type VentasMensualesProveedorUpdate = Partial<VentasMensualesProveedorInsert>;