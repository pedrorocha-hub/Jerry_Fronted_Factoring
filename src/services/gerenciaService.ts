import { supabase } from '@/integrations/supabase/client';
import { Gerente, GerenteInsert, GerenteUpdate } from '@/types/gerencia';

export class GerenciaService {
  static async getAllByRuc(ruc: string): Promise<Gerente[]> {
    const { data, error } = await supabase
      .from('ficha_ruc_gerencia')
      .select('*')
      .eq('ruc', ruc)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async create(gerenteData: GerenteInsert): Promise<Gerente> {
    const { data, error } = await supabase
      .from('ficha_ruc_gerencia')
      .insert(gerenteData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, gerenteData: GerenteUpdate): Promise<Gerente> {
    const { data, error } = await supabase
      .from('ficha_ruc_gerencia')
      .update({ ...gerenteData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('ficha_ruc_gerencia')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}