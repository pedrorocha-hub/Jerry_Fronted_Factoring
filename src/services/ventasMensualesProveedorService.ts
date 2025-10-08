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

  static async saveSalesDataForRuc(
    ruc: string,
    salesData: SalesData,
    status: VentasProveedorStatus | null,
    validado_por: string | null
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // PRIMERO: Eliminar TODOS los registros existentes para este RUC
    const { error: deleteError } = await supabase
      .from('ventas_mensuales_proveedor')
      .delete()
      .eq('ruc', ruc);

    if (deleteError) {
      console.error('Error eliminando registros existentes:', deleteError);
      throw deleteError;
    }

    // SEGUNDO: Crear UN SOLO registro consolidado con TODOS los años
    if (Object.keys(salesData).length > 0) {
      // Consolidar todos los años en un solo objeto
      const consolidatedRecord: any = {
        ruc,
        anio: new Date().getFullYear(), // Año actual como referencia
        status,
        validado_por,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Agregar todos los meses de todos los años con prefijos
      Object.entries(salesData).forEach(([yearStr, monthData]) => {
        const year = yearStr;
        Object.entries(monthData).forEach(([month, value]) => {
          // Crear campos como: 2023_enero, 2023_febrero, 2024_enero, etc.
          const fieldName = `${year}_${month}`;
          consolidatedRecord[fieldName] = value;
        });
      });

      console.log('Guardando registro consolidado:', consolidatedRecord);

      const { error: insertError } = await supabase
        .from('ventas_mensuales_proveedor')
        .insert([consolidatedRecord]);

      if (insertError) {
        console.error('Error insertando registro consolidado:', insertError);
        throw insertError;
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