import { supabase } from '@/integrations/supabase/client';
import { CuentaBancaria, CuentaBancariaInsert, CuentaBancariaUpdate } from '@/types/cuenta-bancaria';

export type CuentaBancariaWithFicha = CuentaBancaria;

export class CuentaBancariaService {
  // Obtener todas las cuentas bancarias
  static async getAll(): Promise<CuentaBancariaWithFicha[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          ruc,
          nombre_empresa
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Obtener una cuenta por su ID
  static async getById(id: string): Promise<CuentaBancariaWithFicha | null> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          ruc,
          nombre_empresa
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener todas las cuentas asociadas a un RUC
  static async getByRuc(ruc: string): Promise<CuentaBancariaWithFicha[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          ruc,
          nombre_empresa
        )
      `)
      .eq('ruc', ruc)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Obtener todas las cuentas asociadas a un documento
  static async getByDocumentoId(documentoId: string): Promise<CuentaBancariaWithFicha[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          ruc,
          nombre_empresa
        )
      `)
      .eq('documento_id', documentoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Crear una nueva cuenta bancaria
  static async create(cuentaData: CuentaBancariaInsert): Promise<CuentaBancaria> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .insert(cuentaData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar una cuenta bancaria existente
  static async update(id: string, cuentaData: Partial<CuentaBancariaUpdate>): Promise<CuentaBancaria> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .update({ ...cuentaData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error en Supabase al actualizar cuenta bancaria:', error);
      throw error;
    }
    return data;
  }

  // Eliminar una cuenta bancaria
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cuentas_bancarias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Obtener estadísticas simplificadas
  static async getStats() {
    const { count: totalCount } = await supabase
      .from('cuentas_bancarias')
      .select('*', { count: 'exact', head: true });

    const { count: thisMonthCount } = await supabase
      .from('cuentas_bancarias')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const { data: monedaStats } = await supabase
      .from('cuentas_bancarias')
      .select('moneda_cuenta');

    const monedaDistribution: { [key: string]: number } = {};
    monedaStats?.forEach(item => {
      if (item.moneda_cuenta) {
        monedaDistribution[item.moneda_cuenta] = (monedaDistribution[item.moneda_cuenta] || 0) + 1;
      }
    });

    return {
      total: totalCount || 0,
      thisMonth: thisMonthCount || 0,
      monedaDistribution,
      activeCounts: 0,
      inactiveCounts: 0
    };
  }
}