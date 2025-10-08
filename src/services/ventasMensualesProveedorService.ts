import { supabase } from '@/integrations/supabase/client';
import { VentasMensualesProveedor, VentasMensualesProveedorInsert, VentasProveedorStatus } from '@/types/ventasMensualesProveedor';

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

  static async getByRuc(ruc: string): Promise<VentasMensualesProveedor[]> {
    const { data, error } = await supabase
      .from('ventas_mensuales_proveedor')
      .select('*')
      .eq('ruc', ruc);

    if (error) {
      console.error('Error fetching ventas mensuales by RUC:', error);
      throw error;
    }
    return data || [];
  }

  static async upsert(salesData: VentasMensualesProveedorInsert): Promise<VentasMensualesProveedor> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const dataToUpsert = {
      ...salesData,
      user_id: user?.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ventas_mensuales_proveedor')
      .upsert(dataToUpsert, { onConflict: 'ruc, anio' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting ventas mensuales:', error);
      throw error;
    }
    return data;
  }
}