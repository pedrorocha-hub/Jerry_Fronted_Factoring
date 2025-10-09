import { supabase } from '@/integrations/supabase/client';
import { VentasMensuales, VentasStatus } from '@/types/ventasMensuales';
import { SalesData } from '@/pages/VentasMensuales';

export interface VentasMensualesSummary {
  ruc: string;
  nombre_empresa: string;
  last_updated_at: string;
  status: VentasStatus | null;
  creator_name: string | null;
}

export class VentasMensualesService {
  static async getAllSummaries(): Promise<VentasMensualesSummary[]> {
    const { data, error } = await supabase.rpc('get_ventas_mensuales_summaries');

    if (error) {
      console.error('Error fetching ventas mensuales summaries:', error);
      throw error;
    }
    return data || [];
  }

  static async getByProveedorRuc(proveedorRuc: string): Promise<VentasMensuales | null> {
    const { data, error } = await supabase
      .from('ventas_mensuales')
      .select('*')
      .eq('proveedor_ruc', proveedorRuc)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching ventas mensuales by RUC:', error);
      throw error;
    }
    return data;
  }

  static async saveSalesData(
    proveedorRuc: string,
    proveedorSales: SalesData,
    deudorRuc: string | null,
    deudorSales: SalesData,
    options: {
      status: VentasStatus | null;
      validado_por: string | null;
    }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const flatData: { [key: string]: any } = {
      proveedor_ruc: proveedorRuc,
      deudor_ruc: deudorRuc,
      status: options.status,
      validado_por: options.validado_por,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    years.forEach(year => {
      months.forEach(month => {
        flatData[`${month}_${year}_proveedor`] = proveedorSales[year]?.[month] ?? null;
        flatData[`${month}_${year}_deudor`] = deudorSales[year]?.[month] ?? null;
      });
    });

    const { error } = await supabase
      .from('ventas_mensuales')
      .upsert(flatData, { onConflict: 'proveedor_ruc' });

    if (error) {
      console.error('Error en upsert de ventas mensuales:', error);
      throw error;
    }
  }

  static async deleteByProveedorRuc(proveedorRuc: string): Promise<void> {
    const { error } = await supabase
      .from('ventas_mensuales')
      .delete()
      .eq('proveedor_ruc', proveedorRuc);

    if (error) {
      console.error('Error deleting ventas mensuales by RUC:', error);
      throw error;
    }
  }
}