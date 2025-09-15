import { supabase } from '@/integrations/supabase/client';
import { CuentaBancaria, CuentaBancariaInsert, CuentaBancariaUpdate, CuentaBancariaWithFicha } from '@/types/cuenta-bancaria';

export class CuentaBancariaService {
  // Obtener todas las cuentas bancarias
  static async getAll(): Promise<CuentaBancariaWithFicha[]> {
    try {
      console.log('CuentaBancariaService: Fetching all cuentas bancarias...');
      
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

      if (error) {
        console.error('Error fetching cuentas bancarias:', error);
        throw new Error(`Error en consulta de cuentas bancarias: ${error.message}`);
      }

      console.log('CuentaBancariaService: Data loaded:', data);
      return data || [];

    } catch (error) {
      console.error('Error in CuentaBancariaService.getAll:', error);
      throw error;
    }
  }

  // Obtener cuenta bancaria por ID
  static async getById(id: number): Promise<CuentaBancariaWithFicha | null> {
    try {
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
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching cuenta bancaria by ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in CuentaBancariaService.getById:', error);
      throw error;
    }
  }

  // Obtener cuentas bancarias por Ficha RUC ID
  static async getByFichaRucId(fichaRucId: number): Promise<CuentaBancaria[]> {
    try {
      const { data, error } = await supabase
        .from('cuentas_bancarias')
        .select('*')
        .eq('ficha_ruc_id', fichaRucId)
        .order('nombre_banco', { ascending: true })
        .order('moneda_cuenta', { ascending: true });

      if (error) {
        console.error('Error fetching cuentas by ficha RUC ID:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in CuentaBancariaService.getByFichaRucId:', error);
      throw error;
    }
  }

  // Crear nueva cuenta bancaria
  static async create(cuentaData: CuentaBancariaInsert): Promise<CuentaBancaria> {
    try {
      const { data, error } = await supabase
        .from('cuentas_bancarias')
        .insert(cuentaData)
        .select()
        .single();

      if (error) {
        console.error('Error creating cuenta bancaria:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in CuentaBancariaService.create:', error);
      throw error;
    }
  }

  // Actualizar cuenta bancaria existente
  static async update(id: number, cuentaData: CuentaBancariaUpdate): Promise<CuentaBancaria> {
    try {
      const updateData = {
        ...cuentaData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('cuentas_bancarias')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating cuenta bancaria:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in CuentaBancariaService.update:', error);
      throw error;
    }
  }

  // Eliminar cuenta bancaria
  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('cuentas_bancarias')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting cuenta bancaria:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in CuentaBancariaService.delete:', error);
      throw error;
    }
  }

  // Buscar cuentas bancarias por texto
  static async search(searchTerm: string): Promise<CuentaBancariaWithFicha[]> {
    try {
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
        .or(`nombre_banco.ilike.%${searchTerm}%,numero_cuenta.ilike.%${searchTerm}%,titular_cuenta.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching cuentas bancarias:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in CuentaBancariaService.search:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  static async getStats() {
    try {
      const { count: totalCount } = await supabase
        .from('cuentas_bancarias')
        .select('*', { count: 'exact', head: true });

      const { count: activasCount } = await supabase
        .from('cuentas_bancarias')
        .select('*', { count: 'exact', head: true })
        .eq('estado_cuenta', 'activa');

      const { count: thisMonthCount } = await supabase
        .from('cuentas_bancarias')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      // Contar por moneda
      const { data: monedaStats } = await supabase
        .from('cuentas_bancarias')
        .select('moneda_cuenta')
        .not('moneda_cuenta', 'is', null);

      const monedaCount: { [key: string]: number } = {};
      monedaStats?.forEach(item => {
        if (item.moneda_cuenta) {
          monedaCount[item.moneda_cuenta] = (monedaCount[item.moneda_cuenta] || 0) + 1;
        }
      });

      // Contar por estado
      const { data: estadoStats } = await supabase
        .from('cuentas_bancarias')
        .select('estado_cuenta');

      const estadoCount: { [key: string]: number } = {};
      estadoStats?.forEach(item => {
        if (item.estado_cuenta) {
          estadoCount[item.estado_cuenta] = (estadoCount[item.estado_cuenta] || 0) + 1;
        }
      });

      return {
        total: totalCount || 0,
        thisMonth: thisMonthCount || 0,
        activeCounts: activasCount || 0,
        inactiveCounts: (totalCount || 0) - (activasCount || 0),
        mostCommonEstado: Object.entries(estadoCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '',
        estadoDistribution: estadoCount,
        monedaDistribution: monedaCount
      };
    } catch (error) {
      console.error('Error in CuentaBancariaService.getStats:', error);
      return {
        total: 0,
        thisMonth: 0,
        activeCounts: 0,
        inactiveCounts: 0,
        mostCommonEstado: '',
        estadoDistribution: {},
        monedaDistribution: {}
      };
    }
  }

  // Crear múltiples cuentas para una ficha RUC
  static async createMultiple(fichaRucId: number, cuentas: Omit<CuentaBancariaInsert, 'ficha_ruc_id'>[]): Promise<CuentaBancaria[]> {
    try {
      const cuentasWithFichaId = cuentas.map(cuenta => ({
        ...cuenta,
        ficha_ruc_id: fichaRucId
      }));

      const { data, error } = await supabase
        .from('cuentas_bancarias')
        .insert(cuentasWithFichaId)
        .select();

      if (error) {
        console.error('Error creating multiple cuentas bancarias:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in CuentaBancariaService.createMultiple:', error);
      throw error;
    }
  }

  // Crear datos de prueba que reflejen la estructura real (múltiples cuentas por banco)
  static async createTestData(): Promise<void> {
    try {
      console.log('CuentaBancariaService: Creating test data...');
      
      // Verificar si existe al menos una ficha RUC
      const { data: fichasRuc, error: fichasError } = await supabase
        .from('ficha_ruc')
        .select('id, ruc, nombre_empresa')
        .limit(1);
        
      if (fichasError) {
        throw new Error(`Error fetching ficha RUC: ${fichasError.message}`);
      }
      
      let fichaRucId: number;
      
      if (fichasRuc && fichasRuc.length > 0) {
        fichaRucId = fichasRuc[0].id;
      } else {
        // Crear una ficha RUC de prueba
        const { data: nuevaFicha, error: createFichaError } = await supabase
          .from('ficha_ruc')
          .insert({
            nombre_empresa: 'EMPRESA DE PRUEBA S.A.C.',
            ruc: '20123456789',
            actividad_empresa: 'Actividad de prueba',
            estado_contribuyente: 'Activo'
          })
          .select()
          .single();
          
        if (createFichaError || !nuevaFicha) {
          throw new Error(`Error creating test ficha RUC: ${createFichaError?.message || 'Unknown error'}`);
        }
        
        fichaRucId = nuevaFicha.id;
      }
      
      // Crear cuentas de prueba que reflejen la estructura real
      // Un banco puede tener múltiples cuentas (diferentes monedas, tipos)
      const testCuentas: CuentaBancariaInsert[] = [
        // BCP - Cuenta Corriente en Soles
        {
          ficha_ruc_id: fichaRucId,
          nombre_banco: 'BCP - Banco de Crédito del Perú',
          numero_cuenta: '191-123456789-0-12',
          tipo_cuenta: 'Corriente',
          codigo_cci: '00219112345678901234',
          moneda_cuenta: 'PEN',
          titular_cuenta: fichasRuc?.[0]?.nombre_empresa || 'EMPRESA DE PRUEBA S.A.C.',
          estado_cuenta: 'activa'
        },
        // BCP - Cuenta de Ahorros en USD
        {
          ficha_ruc_id: fichaRucId,
          nombre_banco: 'BCP - Banco de Crédito del Perú',
          numero_cuenta: '191-987654321-1-05',
          tipo_cuenta: 'Ahorros',
          codigo_cci: '00219198765432109876',
          moneda_cuenta: 'USD',
          titular_cuenta: fichasRuc?.[0]?.nombre_empresa || 'EMPRESA DE PRUEBA S.A.C.',
          estado_cuenta: 'activa'
        },
        // Interbank - Cuenta Corriente en Soles
        {
          ficha_ruc_id: fichaRucId,
          nombre_banco: 'Interbank',
          numero_cuenta: '898-300123456789',
          tipo_cuenta: 'Corriente',
          codigo_cci: '00389830012345678901',
          moneda_cuenta: 'PEN',
          titular_cuenta: fichasRuc?.[0]?.nombre_empresa || 'EMPRESA DE PRUEBA S.A.C.',
          estado_cuenta: 'activa'
        },
        // Interbank - Cuenta de Ahorros en USD
        {
          ficha_ruc_id: fichaRucId,
          nombre_banco: 'Interbank',
          numero_cuenta: '898-300987654321',
          tipo_cuenta: 'Ahorros',
          codigo_cci: '00389830098765432109',
          moneda_cuenta: 'USD',
          titular_cuenta: fichasRuc?.[0]?.nombre_empresa || 'EMPRESA DE PRUEBA S.A.C.',
          estado_cuenta: 'activa'
        },
        // BBVA - Solo cuenta en Soles
        {
          ficha_ruc_id: fichaRucId,
          nombre_banco: 'BBVA',
          numero_cuenta: '0011-0123-0123456789',
          tipo_cuenta: 'Corriente',
          codigo_cci: '00110012301234567890',
          moneda_cuenta: 'PEN',
          titular_cuenta: fichasRuc?.[0]?.nombre_empresa || 'EMPRESA DE PRUEBA S.A.C.',
          estado_cuenta: 'activa'
        }
      ];

      for (const cuentaData of testCuentas) {
        await this.create(cuentaData);
      }

      console.log(`CuentaBancariaService: Created ${testCuentas.length} test cuentas bancarias`);
    } catch (error) {
      console.error('Error in CuentaBancariaService.createTestData:', error);
      throw error;
    }
  }
}