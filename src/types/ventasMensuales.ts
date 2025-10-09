export type VentasStatus = 'Borrador' | 'En revisión' | 'Completado';

export interface VentasMensuales {
  id: string;
  proveedor_ruc: string;
  deudor_ruc: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  status: VentasStatus | null;
  validado_por: string | null;

  // Campos de ventas del proveedor
  [key: `enero_${number}_proveedor`]: number | null;
  [key: `febrero_${number}_proveedor`]: number | null;
  [key: `marzo_${number}_proveedor`]: number | null;
  [key: `abril_${number}_proveedor`]: number | null;
  [key: `mayo_${number}_proveedor`]: number | null;
  [key: `junio_${number}_proveedor`]: number | null;
  [key: `julio_${number}_proveedor`]: number | null;
  [key: `agosto_${number}_proveedor`]: number | null;
  [key: `setiembre_${number}_proveedor`]: number | null;
  [key: `octubre_${number}_proveedor`]: number | null;
  [key: `noviembre_${number}_proveedor`]: number | null;
  [key: `diciembre_${number}_proveedor`]: number | null;

  // Campos de ventas del deudor
  [key: `enero_${number}_deudor`]: number | null;
  [key: `febrero_${number}_deudor`]: number | null;
  [key: `marzo_${number}_deudor`]: number | null;
  [key: `abril_${number}_deudor`]: number | null;
  [key: `mayo_${number}_deudor`]: number | null;
  [key: `junio_${number}_deudor`]: number | null;
  [key: `julio_${number}_deudor`]: number | null;
  [key: `agosto_${number}_deudor`]: number | null;
  [key: `setiembre_${number}_deudor`]: number | null;
  [key: `octubre_${number}_deudor`]: number | null;
  [key: `noviembre_${number}_deudor`]: number | null;
  [key: `diciembre_${number}_deudor`]: number | null;
}

export type VentasMensualesInsert = Omit<VentasMensuales, 'id' | 'created_at' | 'updated_at'>;
export type VentasMensualesUpdate = Partial<VentasMensualesInsert>;