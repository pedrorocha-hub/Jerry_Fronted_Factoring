import { supabase } from '@/integrations/supabase/client';
import { FacturaNegociar, FacturaNegociarInsert, FacturaNegociarUpdate, FacturaNegociarWithFicha } from '@/types/factura-negociar';

export class FacturaNegociarService {
  // Obtener todas las facturas a negociar
  static async getAll(): Promise<FacturaNegociarWithFicha[]> {
    const { data, error } = await supabase
      .from('factura_negociar')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching facturas a negociar:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener factura por ID
  static async getById(id: number): Promise<FacturaNegociarWithFicha | null> {
    const { data, error } = await supabase
      .from('factura_negociar')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching factura by ID:', error);
      throw error;
    }

    return data;
  }

  // Obtener facturas por RUC
  static async getByRuc(ruc: string): Promise<FacturaNegociar[]> {
    const { data, error } = await supabase
      .from('factura_negociar')
      .select('*')
      .eq('ruc', ruc)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching facturas by RUC:', error);
      throw error;
    }

    return data || [];
  }

  // Crear nueva factura
  static async create(facturaData: FacturaNegociarInsert): Promise<FacturaNegociar> {
    const { data, error } = await supabase
      .from('factura_negociar')
      .insert(facturaData)
      .select()
      .single();

    if (error) {
      console.error('Error creating factura:', error);
      throw error;
    }

    return data;
  }

  // Actualizar factura existente
  static async update(id: number, facturaData: FacturaNegociarUpdate): Promise<FacturaNegociar> {
    const updateData = {
      ...facturaData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('factura_negociar')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating factura:', error);
      throw error;
    }

    return data;
  }

  // Eliminar factura
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('factura_negociar')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting factura:', error);
      throw error;
    }
  }

  // Buscar facturas por texto
  static async search(searchTerm: string): Promise<FacturaNegociarWithFicha[]> {
    const { data, error } = await supabase
      .from('factura_negociar')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .or(`numero_factura.ilike.%${searchTerm}%,estado_negociacion.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching facturas:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener estadísticas
  static async getStats() {
    const { count: totalCount } = await supabase
      .from('factura_negociar')
      .select('*', { count: 'exact', head: true });

    const { count: thisMonthCount } = await supabase
      .from('factura_negociar')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    // Contar por estado
    const { data: estadoStats } = await supabase
      .from('factura_negociar')
      .select('estado_negociacion')
      .not('estado_negociacion', 'is', null);

    const estadoCount: { [key: string]: number } = {};
    estadoStats?.forEach(item => {
      if (item.estado_negociacion) {
        estadoCount[item.estado_negociacion] = (estadoCount[item.estado_negociacion] || 0) + 1;
      }
    });

    // Calcular montos totales
    const { data: montoStats } = await supabase
      .from('factura_negociar')
      .select('monto_total, monto_negociado, estado_negociacion');

    let montoTotalPendiente = 0;
    let montoTotalNegociado = 0;
    let montoTotalVencido = 0;

    montoStats?.forEach(item => {
      const monto = item.monto_total || 0;
      switch (item.estado_negociacion) {
        case 'Pendiente':
          montoTotalPendiente += monto;
          break;
        case 'Negociada':
          montoTotalNegociado += (item.monto_negociado || monto);
          break;
        case 'Vencida':
          montoTotalVencido += monto;
          break;
      }
    });

    // Contar facturas próximas a vencer (próximos 30 días)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { count: proximasVencerCount } = await supabase
      .from('factura_negociar')
      .select('*', { count: 'exact', head: true })
      .eq('estado_negociacion', 'Pendiente')
      .lte('fecha_vencimiento', thirtyDaysFromNow.toISOString().split('T')[0]);

    return {
      total: totalCount || 0,
      thisMonth: thisMonthCount || 0,
      pendientes: estadoCount['Pendiente'] || 0,
      negociadas: estadoCount['Negociada'] || 0,
      vencidas: estadoCount['Vencida'] || 0,
      proximasVencer: proximasVencerCount || 0,
      montoTotalPendiente,
      montoTotalNegociado,
      montoTotalVencido,
      estadoDistribution: estadoCount
    };
  }

  // Crear múltiples facturas para una ficha RUC
  static async createMultiple(ruc: string, facturas: Omit<FacturaNegociarInsert, 'ruc'>[]): Promise<FacturaNegociar[]> {
    const facturasWithRuc = facturas.map(factura => ({
      ...factura,
      ruc: ruc
    }));

    const { data, error } = await supabase
      .from('factura_negociar')
      .insert(facturasWithRuc)
      .select();

    if (error) {
      console.error('Error creating multiple facturas:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener facturas próximas a vencer
  static async getFacturasProximasAVencer(dias: number = 30): Promise<FacturaNegociarWithFicha[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const { data, error } = await supabase
      .from('factura_negociar')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .eq('estado_negociacion', 'Pendiente')
      .lte('fecha_vencimiento', fechaLimite.toISOString().split('T')[0])
      .order('fecha_vencimiento', { ascending: true });

    if (error) {
      console.error('Error fetching facturas próximas a vencer:', error);
      throw error;
    }

    return data || [];
  }

  // Marcar factura como negociada
  static async marcarComoNegociada(id: number, montoNegociado: number, fechaNegociacion?: string): Promise<FacturaNegociar> {
    const updateData: FacturaNegociarUpdate = {
      estado_negociacion: 'Negociada',
      monto_negociado: montoNegociado,
      fecha_negociacion: fechaNegociacion || new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };

    return await this.update(id, updateData);
  }

  // Marcar facturas vencidas automáticamente
  static async marcarFacturasVencidas(): Promise<number> {
    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('factura_negociar')
      .update({ 
        estado_negociacion: 'Vencida',
        updated_at: new Date().toISOString()
      })
      .eq('estado_negociacion', 'Pendiente')
      .lt('fecha_vencimiento', hoy)
      .select();

    if (error) {
      console.error('Error marking facturas as vencidas:', error);
      throw error;
    }

    return data?.length || 0;
  }
}