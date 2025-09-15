import { supabase } from '@/integrations/supabase/client';
import { CuentaBancaria, CuentaBancariaInsert, CuentaBancariaUpdate } from '@/types/cuenta-bancaria';

// Definimos un tipo extendido para las consultas con JOIN
export type CuentaBancariaWithFicha = CuentaBancaria & {
  ficha_ruc: {
    id: number;
    nombre_empresa: string;
    ruc: string;
  } | null;
};

export class CuentaBancariaService {
  // Obtener todas las cuentas bancarias con datos de Ficha RUC
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

  // Obtener una cuenta por su ID
  static async getById(id: string): Promise<CuentaBancariaWithFicha | null> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`*, ficha_ruc:ficha_ruc_id (*)`)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener todas las cuentas asociadas a un documento
  static async getByDocumentoId(documentoId: string): Promise<CuentaBancariaWithFicha[]> {
    const { data, error } = await supabase
      .from('cuentas_bancarias')
      .select(`*, ficha_ruc:ficha_ruc_id (*)`)
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

  // Establecer una cuenta como principal para una empresa
  static async setPrincipal(id: string): Promise<void> {
    const { data: cuenta, error: fetchError } = await supabase
      .from('cuentas_bancarias')
      .select('ficha_ruc_id')
      .eq('id', id)
      .single();

    if (fetchError || !cuenta) throw new Error('Cuenta no encontrada.');

    // Si la cuenta está asociada a una empresa, quitar la marca de principal a las otras
    if (cuenta.ficha_ruc_id) {
      await supabase
        .from('cuentas_bancarias')
        .update({ es_principal: false })
        .eq('ficha_ruc_id', cuenta.ficha_ruc_id);
    }

    // Marcar la cuenta actual como principal
    await supabase
      .from('cuentas_bancarias')
      .update({ es_principal: true })
      .eq('id', id);
  }

  // Asociar una cuenta con una Ficha RUC
  static async associateWithFichaRuc(cuentaId: string, fichaRucId: number): Promise<void> {
    const { error } = await supabase
      .from('cuentas_bancarias')
      .update({ ficha_ruc_id: fichaRucId })
      .eq('id', cuentaId);

    if (error) throw error;
  }
}