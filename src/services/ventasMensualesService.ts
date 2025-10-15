import { supabase } from '@/integrations/supabase/client';
import { VentasMensuales, VentasMensualesSummary } from '@/types/ventasMensuales';
import { SalesData } from '@/types/salesData';

export class VentasMensualesService {
  static async getAllSummaries(): Promise<VentasMensualesSummary[]> {
    const { data, error } = await supabase.rpc('get_ventas_mensuales_summaries');
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<VentasMensuales | null> {
    const { data, error } = await supabase
      .from('ventas_mensuales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getByProveedorRuc(ruc: string): Promise<VentasMensuales | null> {
    const { data, error } = await supabase
      .from('ventas_mensuales')
      .select('*')
      .eq('proveedor_ruc', ruc)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async saveReport(report: Partial<VentasMensuales>): Promise<VentasMensuales> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (report.id && report.id !== '') {
      // Update
      const { id, created_at, user_id, ...updateData } = report;
      const { data, error } = await supabase
        .from('ventas_mensuales')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Create
      const { id, ...insertData } = report;
      const { data, error } = await supabase
        .from('ventas_mensuales')
        .insert({ ...insertData, user_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  static async deleteById(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventas_mensuales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}