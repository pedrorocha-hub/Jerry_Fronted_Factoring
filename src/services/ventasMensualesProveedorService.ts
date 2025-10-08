import { supabase } from '@/integrations/supabase/client';
import { VentasMensualesProveedor, VentasMensualesProveedorInsert, VentasProveedorStatus } from '@/types/ventasMensualesProveedor';
import { SalesData } from '@/pages/VentasMensualesProveedor';

export interface VentasMensualesProveedorSummary {
  ruc: string;
  nombre_empresa: string;
  last_updated_at: string;
  status: VentasProveedorStatus | null;
  creator_name: string | null;
}

export class VentasMensualesProveedorService {
  static async getAllSummaries(): Promise<VentasMensualesProveedorSummary[]> {
    const { data, error } = await supabase.rpc('get_ventas_mensuales_summaries');

    if (error) {
      console.error('Error fetching ventas mensuales summaries:', error);
      throw error;
    }
    return data || [];
  }

  static async getByRuc(ruc: string): Promise<VentasMensualesProveedor | null> {
    const { data, error } = await supabase
      .from('ventas_mensuales_proveedor')
      .select('*')
      .eq('ruc', ruc)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching ventas mensuales by RUC:', error);
      throw error;
    }
    return data;
  }

  static async saveSalesDataForRuc(
    ruc: string,
    salesData: SalesData,
    status: VentasProveedorStatus | null,
    validado_por: string | null
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const flatData: { [key: string]: any } = {
      ruc,
      status,
      validado_por,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    for (const year in salesData) {
      for (const month in salesData[year]) {
        const key = `${month}_${year}`;
        flatData[key] = salesData[year][month];
      }
    }

    const { error } = await supabase
      .from('ventas_mensuales_proveedor')
      .upsert(flatData, { onConflict: 'ruc' });

    if (error) {
      console.error('Error en upsert de ventas mensuales:', error);
      throw error;
    }
  }

  static async deleteByRuc(ruc: string): Promise<void> {
    const { error } = await supabase
      .from('ventas_mensuales_proveedor')
      .delete()
      .eq('ruc', ruc);

    if (error) {
      console.error('Error deleting ventas mensuales by RUC:', error);
      throw error;
    }
  }
}