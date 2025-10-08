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

  static async upsert(payload: Partial<VentasMensualesProveedorInsert>): Promise<VentasMensualesProveedor> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const dataToUpsert = {
      ...payload,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('ventas_mensuales_proveedor')
      .upsert(dataToUpsert, { onConflict: 'ruc, anio' })
      .select()
      .single();
    
    if (error) {
      console.error('Error en upsert de ventas mensuales:', error);
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

    const recordsToUpsert = Object.entries(salesData).map(([yearStr, monthData]) => {
      const year = parseInt(yearStr, 10);
      return {
        ruc,
        anio: year,
        ...monthData,
        status,
        validado_por,
        user_id: user.id,
      };
    });

    if (recordsToUpsert.length > 0) {
      const { error } = await supabase
        .from('ventas_mensuales_proveedor')
        .upsert(recordsToUpsert, { onConflict: 'ruc, anio' });

      if (error) {
        console.error('Error en upsert masivo de ventas mensuales:', error);
        throw error;
      }
    }
  }

  static async updateStatusForRuc(ruc: string, updateData: { status?: VentasProveedorStatus | null, validado_por?: string | null }): Promise<VentasMensualesProveedor[]> {
    const { data, error } = await supabase
      .from('ventas_mensuales_proveedor')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('ruc', ruc)
      .select();

    if (error) {
      console.error('Error updating status for RUC:', error);
      throw error;
    }
    return data;
  }
}