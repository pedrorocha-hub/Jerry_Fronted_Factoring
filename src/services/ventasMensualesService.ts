import { supabase } from '@/integrations/supabase/client';
import { VentasMensuales, VentasMensualesSummary, VentasStatus } from '@/types/ventasMensuales';
import { SalesData } from '@/types/salesData';

export class VentasMensualesService {
  static async getAllSummaries(): Promise<VentasMensualesSummary[]> {
    const { data, error } = await supabase.rpc('get_ventas_mensuales_summaries');
    if (error) throw error;
    return data || [];
  }

  static async getByProveedorRuc(ruc: string): Promise<VentasMensuales | null> {
    const { data, error } = await supabase
      .from('ventas_mensuales')
      .select('*')
      .eq('proveedor_ruc', ruc)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async saveSalesData(
    proveedorRuc: string,
    proveedorSales: SalesData,
    deudorRuc: string | null,
    deudorSales: SalesData,
    metadata: { status: VentasStatus; validado_por?: string | null }
  ): Promise<VentasMensuales> {
    const { data: { user } } = await supabase.auth.getUser();

    const flatData: Partial<VentasMensuales> = {
      proveedor_ruc: proveedorRuc,
      deudor_ruc: deudorRuc || undefined,
      status: metadata.status,
      validado_por: metadata.validado_por,
      user_id: user?.id,
    };

    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    years.forEach(year => {
      months.forEach(month => {
        const provKey = `${month}_${year}_proveedor`;
        if (proveedorSales[year] && proveedorSales[year][month] !== null) {
          (flatData as any)[provKey] = proveedorSales[year][month];
        }
        if (deudorRuc) {
          const deudorKey = `${month}_${year}_deudor`;
          if (deudorSales[year] && deudorSales[year][month] !== null) {
            (flatData as any)[deudorKey] = deudorSales[year][month];
          }
        }
      });
    });

    const { data, error } = await supabase
      .from('ventas_mensuales')
      .upsert(flatData, { onConflict: 'proveedor_ruc' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteByProveedorRuc(ruc: string): Promise<void> {
    const { error } = await supabase
      .from('ventas_mensuales')
      .delete()
      .eq('proveedor_ruc', ruc);

    if (error) throw error;
  }
}