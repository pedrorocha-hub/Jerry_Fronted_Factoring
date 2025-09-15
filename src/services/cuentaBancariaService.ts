import { supabase } from '@/integrations/supabase/client';
import { 
  CuentaBancaria, 
  CuentaBancariaInsert, 
  CuentaBancariaUpdate,
  TipoCuenta,
  Moneda,
  EstadoCuenta 
} from '@/types/cuentaBancaria';

export class CuentaBancariaService {
  
  // Obtener todas las cuentas de un documento con información de Ficha RUC
  static async getByDocumentoId(documentoId: string): Promise<CuentaBancaria[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ficha_ruc_id (
          id,
          ruc,
          razon_social,
          estado_contribuyente,
          condicion_domicilio,
          distrito,
          provincia,
          departamento_ubicacion,
          actividad_economica,
          ciiu
        )
      `)
      .eq('documento_id', documentoId)
      .order('es_principal', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error obteniendo cuentas bancarias: ${error.message}`);
    }

    return data || [];
  }

  // Crear nueva cuenta bancaria
  static async create(cuenta: CuentaBancariaInsert): Promise<CuentaBancaria> {
    // Si es principal, desmarcar otras cuentas principales del mismo documento
    if (cuenta.es_principal) {
      await this.unsetPrincipalForDocument(cuenta.documento_id);
    }

    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .insert([cuenta])
      .select(`
        *,
        ficha_ruc:ficha_ruc_id (
          id,
          ruc,
          razon_social,
          estado_contribuyente,
          condicion_domicilio,
          distrito,
          provincia,
          departamento_ubicacion,
          actividad_economica,
          ciiu
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Ya existe una cuenta con estos datos');
      }
      throw new Error(`Error creando cuenta bancaria: ${error.message}`);
    }

    return data;
  }

  // Actualizar cuenta bancaria
  static async update(id: string, updates: CuentaBancariaUpdate): Promise<CuentaBancaria> {
    // Si se está marcando como principal, desmarcar otras
    if (updates.es_principal) {
      const cuenta = await this.getById(id);
      if (cuenta) {
        await this.unsetPrincipalForDocument(cuenta.documento_id);
      }
    }

    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        ficha_ruc:ficha_ruc_id (
          id,
          ruc,
          razon_social,
          estado_contribuyente,
          condicion_domicilio,
          distrito,
          provincia,
          departamento_ubicacion,
          actividad_economica,
          ciiu
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe una cuenta con estos datos');
      }
      throw new Error(`Error actualizando cuenta bancaria: ${error.message}`);
    }

    return data;
  }

  // Eliminar cuenta bancaria
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cuentas_bancarias')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error eliminando cuenta bancaria: ${error.message}`);
    }
  }

  // Obtener cuenta por ID con información de Ficha RUC
  static async getById(id: string): Promise<CuentaBancaria | null> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ficha_ruc_id (
          id,
          ruc,
          razon_social,
          estado_contribuyente,
          condicion_domicilio,
          distrito,
          provincia,
          departamento_ubicacion,
          actividad_economica,
          ciiu
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Error obteniendo cuenta bancaria: ${error.message}`);
    }

    return data;
  }

  // Desmarcar cuenta principal para un documento
  private static async unsetPrincipalForDocument(documentoId: string): Promise<void> {
    const { error } = await supabase
      .from('cuentas_bancarias')
      .update({ es_principal: false })
      .eq('documento_id', documentoId)
      .eq('es_principal', true);

    if (error) {
      console.error('Error desmarcando cuenta principal:', error);
    }
  }

  // Marcar cuenta como principal
  static async setPrincipal(id: string): Promise<CuentaBancaria> {
    const cuenta = await this.getById(id);
    if (!cuenta) {
      throw new Error('Cuenta no encontrada');
    }

    // Desmarcar otras cuentas principales del mismo documento
    await this.unsetPrincipalForDocument(cuenta.documento_id);

    // Marcar esta como principal
    return await this.update(id, { es_principal: true });
  }

  // Obtener todas las cuentas con información de Ficha RUC
  static async getAll(): Promise<CuentaBancaria[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ficha_ruc_id (
          id,
          ruc,
          razon_social,
          estado_contribuyente,
          condicion_domicilio,
          distrito,
          provincia,
          departamento_ubicacion,
          actividad_economica,
          ciiu
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error obteniendo cuentas bancarias: ${error.message}`);
    }

    return data || [];
  }

  // Obtener cuentas por RUC
  static async getByRuc(rucNumber: string): Promise<CuentaBancaria[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ficha_ruc_id!inner (
          id,
          ruc,
          razon_social,
          estado_contribuyente,
          condicion_domicilio,
          distrito,
          provincia,
          departamento_ubicacion,
          actividad_economica,
          ciiu
        )
      `)
      .eq('ficha_ruc.ruc', rucNumber)
      .order('es_principal', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error obteniendo cuentas por RUC: ${error.message}`);
    }

    return data || [];
  }

  // Asociar cuenta bancaria con Ficha RUC
  static async associateWithFichaRuc(cuentaId: string, fichaRucId: number): Promise<CuentaBancaria> {
    return await this.update(cuentaId, { ficha_ruc_id: fichaRucId });
  }

  // Buscar Ficha RUC por número para asociar
  static async findFichaRucByNumber(rucNumber: string): Promise<{ id: number; razon_social: string } | null> {
    const { data, error } = await supabase
      .from('ficha_ruc')
      .select('id, ruc, razon_social')
      .eq('ruc', rucNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Error buscando Ficha RUC: ${error.message}`);
    }

    return data;
  }

  // Obtener estadísticas de cuentas
  static async getStats() {
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

    const { count: withFichaRucCount } = await supabase
      .from('cuentas_bancarias')
      .select('*', { count: 'exact', head: true })
      .not('ficha_ruc_id', 'is', null);

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
      withFichaRucCount: withFichaRucCount || 0,
      withoutFichaRucCount: (totalCount || 0) - (withFichaRucCount || 0),
      mostCommonEstado: Object.entries(estadoCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '',
      estadoDistribution: estadoCount,
      monedaDistribution: monedaCount
    };
  }

  // Crear múltiples cuentas desde procesamiento de documento
  static async createMultiple(cuentas: CuentaBancariaInsert[]): Promise<CuentaBancaria[]> {
    const results: CuentaBancaria[] = [];
    
    for (const cuenta of cuentas) {
      try {
        const result = await this.create(cuenta);
        results.push(result);
      } catch (error) {
        console.error('Error creando cuenta:', error);
        // Continuar con las demás cuentas
      }
    }

    return results;
  }

  // Buscar cuentas por criterios
  static async search(filters: {
    nombre_banco?: string;
    moneda_cuenta?: Moneda;
    tipo_cuenta?: TipoCuenta;
    estado_cuenta?: EstadoCuenta;
    ruc?: string;
    razon_social?: string;
  }): Promise<CuentaBancaria[]> {
    let query = supabase
      .from('cuentas_bancarias')
      .select(`
        *,
        ficha_ruc:ficha_ruc_id (
          id,
          ruc,
          razon_social,
          estado_contribuyente,
          condicion_domicilio,
          distrito,
          provincia,
          departamento_ubicacion,
          actividad_economica,
          ciiu
        )
      `);

    if (filters.nombre_banco) {
      query = query.ilike('nombre_banco', `%${filters.nombre_banco}%`);
    }
    if (filters.moneda_cuenta) {
      query = query.eq('moneda_cuenta', filters.moneda_cuenta);
    }
    if (filters.tipo_cuenta) {
      query = query.eq('tipo_cuenta', filters.tipo_cuenta);
    }
    if (filters.estado_cuenta) {
      query = query.eq('estado_cuenta', filters.estado_cuenta);
    }
    if (filters.ruc) {
      query = query.eq('ficha_ruc.ruc', filters.ruc);
    }
    if (filters.razon_social) {
      query = query.ilike('ficha_ruc.razon_social', `%${filters.razon_social}%`);
    }

    const { data, error } = await query
      .order('es_principal', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error buscando cuentas bancarias: ${error.message}`);
    }

    return data || [];
  }

  // Obtener todas las opciones de Ficha RUC para selección
  static async getFichaRucOptions(): Promise<Array<{ id: number; ruc: string; razon_social: string }>> {
    const { data, error } = await supabase
      .from('ficha_ruc')
      .select('id, ruc, razon_social')
      .order('razon_social');

    if (error) {
      throw new Error(`Error obteniendo opciones de Ficha RUC: ${error.message}`);
    }

    return data || [];
  }

  // Crear datos de prueba
  static async createTestData(): Promise<void> {
    try {
      // Verificar si existe al menos un documento
      const { data: documentos, error: docError } = await supabase
        .from('documentos')
        .select('id')
        .eq('tipo', 'cuenta_bancaria')
        .limit(1);

      if (docError) {
        throw new Error(`Error fetching documentos: ${docError.message}`);
      }

      let documentoId: string;

      if (documentos && documentos.length > 0) {
        documentoId = documentos[0].id;
      } else {
        // Crear un documento de prueba
        const { data: nuevoDoc, error: createDocError } = await supabase
          .from('documentos')
          .insert({
            tipo: 'cuenta_bancaria',
            storage_path: 'test/cuenta_bancaria_test.pdf',
            estado: 'completed',
            nombre_archivo: 'cuenta_bancaria_test.pdf'
          })
          .select()
          .single();

        if (createDocError || !nuevoDoc) {
          throw new Error(`Error creating test documento: ${createDocError?.message || 'Unknown error'}`);
        }

        documentoId = nuevoDoc.id;
      }

      // Buscar una Ficha RUC existente para asociar
      const { data: fichaRucData } = await supabase
        .from('ficha_ruc')
        .select('id, ruc, razon_social')
        .limit(1)
        .single();

      // Crear cuentas de prueba con relación a Ficha RUC
      const testCuentas: CuentaBancariaInsert[] = [
        {
          documento_id: documentoId,
          ficha_ruc_id: fichaRucData?.id, // Asociar con Ficha RUC si existe
          nombre_banco: 'BCP - Banco de Crédito del Perú',
          numero_cuenta: '191-123456789-0-12',
          tipo_cuenta: 'corriente',
          codigo_cuenta_interbancaria: '00219112345678901234', // CCI
          moneda_cuenta: 'PEN',
          titular_cuenta: fichaRucData?.razon_social || 'EMPRESA DE PRUEBA S.A.C.',
          estado_cuenta: 'activa',
          es_principal: true,
          notas: 'Cuenta principal para operaciones'
        },
        {
          documento_id: documentoId,
          ficha_ruc_id: fichaRucData?.id,
          nombre_banco: 'Interbank',
          numero_cuenta: '898-300123456789',
          tipo_cuenta: 'ahorros',
          codigo_cuenta_interbancaria: '00389830012345678901', // CCI
          moneda_cuenta: 'USD',
          titular_cuenta: fichaRucData?.razon_social || 'EMPRESA DE PRUEBA S.A.C.',
          estado_cuenta: 'activa',
          es_principal: false,
          notas: 'Cuenta en dólares para exportaciones'
        },
        {
          documento_id: documentoId,
          // Sin Ficha RUC asociada (información parcial)
          nombre_banco: 'BBVA',
          numero_cuenta: '0011-0123-0123456789',
          tipo_cuenta: 'detraccion',
          moneda_cuenta: 'PEN',
          titular_cuenta: 'EMPRESA SIN IDENTIFICAR',
          estado_cuenta: 'activa',
          es_principal: false,
          notas: 'Cuenta con información parcial extraída por IA'
        }
      ];

      for (const cuentaData of testCuentas) {
        await this.create(cuentaData);
      }

      console.log('CuentaBancariaService: Created test data successfully');
    } catch (error) {
      console.error('Error in CuentaBancariaService.createTestData:', error);
      throw error;
    }
  }
}