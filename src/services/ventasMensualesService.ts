import { supabase } from '@/integrations/supabase/client';
import { VentasMensuales, VentasMensualesSummary } from '@/types/ventasMensuales';

export class VentasMensualesService {
  static async getAllSummaries(): Promise<VentasMensualesSummary[]> {
    const { data, error } = await supabase.rpc('get_ventas_mensuales_summaries');
    if (error) throw error;
    return data || [];
  }

  static async getByProveedorRuc(proveedorRuc: string): Promise<VentasMensuales[]> {
    const { data, error } = await supabase
      .from('ventas_mensuales')
      .select('*')
      .eq('proveedor_ruc', proveedorRuc)
      .order('anio', { ascending: false })
      .order('tipo_entidad', { ascending: true });
    
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

  static async saveReport(
    proveedorRuc: string,
    deudorRuc: string | null,
    anio: number,
    tipoEntidad: 'proveedor' | 'deudor',
    salesData: Record<string, number | null>,
    metadata: {
      status?: string;
      validado_por?: string | null;
      solicitud_id?: string | null;
    }
  ): Promise<VentasMensuales> {
    const reportData = {
      proveedor_ruc: proveedorRuc,
      deudor_ruc: deudorRuc,
      anio,
      tipo_entidad: tipoEntidad,
      enero: salesData.enero ?? null,
      febrero: salesData.febrero ?? null,
      marzo: salesData.marzo ?? null,
      abril: salesData.abril ?? null,
      mayo: salesData.mayo ?? null,
      junio: salesData.junio ?? null,
      julio: salesData.julio ?? null,
      agosto: salesData.agosto ?? null,
      setiembre: salesData.setiembre ?? null,
      octubre: salesData.octubre ?? null,
      noviembre: salesData.noviembre ?? null,
      diciembre: salesData.diciembre ?? null,
      status: metadata.status || 'Borrador',
      validado_por: metadata.validado_por || null,
      solicitud_id: metadata.solicitud_id || null,
    };

    const { data, error } = await supabase
      .from('ventas_mensuales')
      .upsert(reportData, {
        onConflict: 'proveedor_ruc,deudor_ruc,anio,tipo_entidad',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventas_mensuales')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async getByRucAndYear(
    proveedorRuc: string,
    deudorRuc: string | null,
    anio: number
  ): Promise<{ proveedor: VentasMensuales | null; deudor: VentasMensuales | null }> {
    const { data, error } = await supabase
      .from('ventas_mensuales')
      .select('*')
      .eq('proveedor_ruc', proveedorRuc)
      .eq('anio', anio);

    if (error) throw error;

    const proveedor = data?.find(r => r.tipo_entidad === 'proveedor') || null;
    const deudor = deudorRuc 
      ? data?.find(r => r.tipo_entidad === 'deudor' && r.deudor_ruc === deudorRuc) || null
      : null;

    return { proveedor, deudor };
  }
}