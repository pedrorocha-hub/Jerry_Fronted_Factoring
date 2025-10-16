import { supabase } from '@/integrations/supabase/client';
import { VentasMensualesSummary, VentasMensualesData } from '@/types/ventasMensuales';

export class VentasMensualesService {
  static async getAllSummaries(): Promise<VentasMensualesSummary[]> {
    const { data, error } = await supabase
      .rpc('get_ventas_mensuales_summaries');

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<VentasMensualesData | null> {
    const { data, error } = await supabase
      .from('ventas_mensuales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(data: Partial<VentasMensualesData>): Promise<VentasMensualesData> {
    const { data: result, error } = await supabase
      .from('ventas_mensuales')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async update(id: string, data: Partial<VentasMensualesData>): Promise<VentasMensualesData> {
    const { data: result, error } = await supabase
      .from('ventas_mensuales')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  static async deleteById(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventas_mensuales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}