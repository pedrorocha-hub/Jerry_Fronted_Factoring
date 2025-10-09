import { supabase } from '@/integrations/supabase/client';

export interface VentasMensualesSummary {
  ruc: string;
  nombre_empresa: string;
  last_updated_at: string;
  status: string;
  creator_name: string;
}

export interface VentasMensualesData {
  id: string;
  proveedor_ruc: string;
  deudor_ruc?: string;
  status: string;
  validado_por?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  // Datos mensuales del proveedor
  enero_2023_proveedor?: number;
  febrero_2023_proveedor?: number;
  marzo_2023_proveedor?: number;
  abril_2023_proveedor?: number;
  mayo_2023_proveedor?: number;
  junio_2023_proveedor?: number;
  julio_2023_proveedor?: number;
  agosto_2023_proveedor?: number;
  setiembre_2023_proveedor?: number;
  octubre_2023_proveedor?: number;
  noviembre_2023_proveedor?: number;
  diciembre_2023_proveedor?: number;
  enero_2024_proveedor?: number;
  febrero_2024_proveedor?: number;
  marzo_2024_proveedor?: number;
  abril_2024_proveedor?: number;
  mayo_2024_proveedor?: number;
  junio_2024_proveedor?: number;
  julio_2024_proveedor?: number;
  agosto_2024_proveedor?: number;
  setiembre_2024_proveedor?: number;
  octubre_2024_proveedor?: number;
  noviembre_2024_proveedor?: number;
  diciembre_2024_proveedor?: number;
  enero_2025_proveedor?: number;
  febrero_2025_proveedor?: number;
  marzo_2025_proveedor?: number;
  abril_2025_proveedor?: number;
  mayo_2025_proveedor?: number;
  junio_2025_proveedor?: number;
  julio_2025_proveedor?: number;
  agosto_2025_proveedor?: number;
  setiembre_2025_proveedor?: number;
  octubre_2025_proveedor?: number;
  noviembre_2025_proveedor?: number;
  diciembre_2025_proveedor?: number;
  // Datos mensuales del deudor
  enero_2023_deudor?: number;
  febrero_2023_deudor?: number;
  marzo_2023_deudor?: number;
  abril_2023_deudor?: number;
  mayo_2023_deudor?: number;
  junio_2023_deudor?: number;
  julio_2023_deudor?: number;
  agosto_2023_deudor?: number;
  setiembre_2023_deudor?: number;
  octubre_2023_deudor?: number;
  noviembre_2023_deudor?: number;
  diciembre_2023_deudor?: number;
  enero_2024_deudor?: number;
  febrero_2024_deudor?: number;
  marzo_2024_deudor?: number;
  abril_2024_deudor?: number;
  mayo_2024_deudor?: number;
  junio_2024_deudor?: number;
  julio_2024_deudor?: number;
  agosto_2024_deudor?: number;
  setiembre_2024_deudor?: number;
  octubre_2024_deudor?: number;
  noviembre_2024_deudor?: number;
  diciembre_2024_deudor?: number;
  enero_2025_deudor?: number;
  febrero_2025_deudor?: number;
  marzo_2025_deudor?: number;
  abril_2025_deudor?: number;
  mayo_2025_deudor?: number;
  junio_2025_deudor?: number;
  julio_2025_deudor?: number;
  agosto_2025_deudor?: number;
  setiembre_2025_deudor?: number;
  octubre_2025_deudor?: number;
  noviembre_2025_deudor?: number;
  diciembre_2025_deudor?: number;
}

export class VentasMensualesService {
  static async getSummaries(): Promise<VentasMensualesSummary[]> {
    try {
      const { data, error } = await supabase.rpc('get_ventas_mensuales_summaries');
      
      if (error) {
        console.error('Error getting ventas mensuales summaries:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getSummaries:', error);
      throw error;
    }
  }

  static async getByProveedorRuc(ruc: string): Promise<VentasMensualesData | null> {
    try {
      console.log('🔍 VentasMensualesService.getByProveedorRuc - Buscando RUC:', ruc);
      
      // Primero intentar por proveedor_ruc
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('ventas_mensuales')
        .select('*')
        .eq('proveedor_ruc', ruc)
        .maybeSingle();

      console.log('👤 Resultado búsqueda por proveedor:', { proveedorData, proveedorError });

      if (proveedorData) {
        return proveedorData;
      }

      // Si no se encuentra por proveedor, intentar por deudor
      const { data: deudorData, error: deudorError } = await supabase
        .from('ventas_mensuales')
        .select('*')
        .eq('deudor_ruc', ruc)
        .maybeSingle();

      console.log('🏢 Resultado búsqueda por deudor:', { deudorData, deudorError });

      if (deudorData) {
        return deudorData;
      }

      console.log('❌ No se encontraron datos para RUC:', ruc);
      return null;

    } catch (error) {
      console.error('💥 Error in getByProveedorRuc:', error);
      throw error;
    }
  }

  static async create(data: Partial<VentasMensualesData>): Promise<VentasMensualesData> {
    try {
      const { data: result, error } = await supabase
        .from('ventas_mensuales')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating ventas mensuales:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<VentasMensualesData>): Promise<VentasMensualesData> {
    try {
      const { data: result, error } = await supabase
        .from('ventas_mensuales')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ventas mensuales:', error);
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }
}