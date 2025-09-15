import { supabase } from '@/integrations/supabase/client';
import { CuentaBancaria, CuentaBancariaInsert, CuentaBancariaUpdate, CuentaBancariaWithFicha } from '@/types/cuenta-bancaria';

export class CuentaBancariaService {
  // Obtener todas las cuentas bancarias
  static async getAll(): Promise<CuentaBancariaWithFicha[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ficha_ruc_id (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Obtener cuenta por ID (corregido a string)
  static async getById(id: string): Promise<CuentaBancariaWithFicha | null> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`*, ficha_ruc:ficha_ruc_id (*)`)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener cuentas por ID de documento
  static async getByDocumentoId(documentoId: string): Promise<CuentaBancariaWithFicha[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`*, ficha_ruc:ficha_ruc_id (*)`)
      .eq('documento_id', documentoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Crear nueva cuenta
  static async create(cuentaData: CuentaBancariaInsert): Promise<CuentaBancaria> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .insert(cuentaData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Actualizar cuenta (corregido a string)
  static async update(id: string, cuentaData: Partial<CuentaBancariaUpdate>): Promise<CuentaBancaria> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .update({ ...cuentaData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar cuenta (corregido a string)
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cuentas_bancarias')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Marcar como principal
  static async setPrincipal(id: string): Promise<void> {
    const { data: cuenta, error: fetchError } = await supabase
      .from('cuentas_bancarias')
      .select('ficha_ruc_id')
      .eq('id', id)
      .single();

    if (fetchError || !cuenta) throw new Error('Cuenta no encontrada.');

    if (cuenta.ficha_ruc_id) {
      await supabase
        .from('cuentas_bancarias')
        .update({ es_principal: false })
        .eq('ficha_ruc_id', cuenta.ficha_ruc_id);
    }

    await supabase
      .from('cuentas_bancarias')
      .update({ es_principal: true })
      .eq('id', id);
  }

  // Asociar con Ficha RUC
  static async associateWithFichaRuc(cuentaId: string, fichaRucId: number): Promise<void> {
    const { error } = await supabase
      .from('cuentas_bancarias')
      .update({ ficha_ruc_id: fichaRucId })
      .eq('id', cuentaId);

    if (error) throw error;
  }

  // Obtener estadísticas
  static async getStats() {
    const { count: total } = await supabase.from('cuentas_bancarias').select('*', { count: 'exact', head: true });
    const { count: activeCounts } = await supabase.from('cuentas_bancarias').select('*', { count: 'exact', head: true }).eq('estado_cuenta', 'Activa');
    const { count: thisMonth } = await supabase.from('cuentas_bancarias').select('*', { count: 'exact', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());
    
    return {
      total: total || 0,
      activeCounts: activeCounts || 0,
      inactiveCounts: (total || 0) - (activeCounts || 0),
      thisMonth: thisMonth || 0,
    };
  }

  // Crear datos de prueba
  static async createTestData(): Promise<void> {
    const { data: fichas } = await supabase.from('ficha_ruc').select('id, nombre_empresa').limit(1);
    if (!fichas || fichas.length === 0) {
      console.error("No hay Fichas RUC para asociar. Crea una primero.");
      return;
    }
    const ficha = fichas[0];

    const testCuentas: Omit<CuentaBancaria, 'id' | 'created_at' | 'updated_at'>[] = [
      { documento_id: 'test-doc-id', ficha_ruc_id: ficha.id, nombre_banco: 'BCP', numero_cuenta: '191-12345678-0-11', tipo_cuenta: 'Corriente', codigo_cci: '00219100123456781150', moneda_cuenta: 'PEN', titular_cuenta: ficha.nombre_empresa, estado_cuenta: 'Activa', es_principal: true, notas: 'Cuenta principal en Soles.' },
      { documento_id: 'test-doc-id', ficha_ruc_id: ficha.id, nombre_banco: 'BCP', numero_cuenta: '191-12345679-1-12', tipo_cuenta: 'Ahorros', codigo_cci: '00219100123456791251', moneda_cuenta: 'USD', titular_cuenta: ficha.nombre_empresa, estado_cuenta: 'Activa', es_principal: false, notas: 'Cuenta de ahorros en Dólares.' },
      { documento_id: 'test-doc-id', ficha_ruc_id: ficha.id, nombre_banco: 'Interbank', numero_cuenta: '898-3001234567', tipo_cuenta: 'Corriente', codigo_cci: '00389800300123456741', moneda_cuenta: 'PEN', titular_cuenta: ficha.nombre_empresa, estado_cuenta: 'Activa', es_principal: false, notas: '' },
    ];

    const { error } = await supabase.from('cuentas_bancarias').insert(testCuentas);
    if (error) throw error;
  }
}