import { supabase } from '@/integrations/supabase/client';
import { ExperienciaPagoInterna, ExperienciaPagoInternaInsert, ExperienciaPagoInternaUpdate } from '@/types/experienciaPagoInterna';

export class ExperienciaPagoInternaService {
  static async getByComportamientoId(comportamientoCrediticioId: string): Promise<ExperienciaPagoInterna[]> {
    const { data, error } = await supabase
      .from('experiencia_pago_interna')
      .select('*')
      .eq('comportamiento_crediticio_id', comportamientoCrediticioId)
      .order('fecha_otorgamiento', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async create(insertData: ExperienciaPagoInternaInsert): Promise<ExperienciaPagoInterna> {
    const { data, error } = await supabase
      .from('experiencia_pago_interna')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updateData: ExperienciaPagoInternaUpdate): Promise<ExperienciaPagoInterna> {
    const { data, error } = await supabase
      .from('experiencia_pago_interna')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('experiencia_pago_interna')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}