import { supabase } from '@/integrations/supabase/client';
import { Eeff, CreateEeffDto, UpdateEeffDto } from '@/types/eeff';

export class EeffService {
  static async getAll(): Promise<Eeff[]> {
    const { data, error } = await supabase
      .from('eeff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Eeff | null> {
    const { data, error } = await supabase
      .from('eeff')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getByRepresentanteLegalId(representanteLegalId: number): Promise<Eeff[]> {
    const { data, error } = await supabase
      .from('eeff')
      .select('*')
      .eq('representante_legal_id', representanteLegalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async create(eeff: CreateEeffDto): Promise<Eeff> {
    const { data, error } = await supabase
      .from('eeff')
      .insert(eeff)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, eeff: UpdateEeffDto): Promise<Eeff> {
    const { data, error } = await supabase
      .from('eeff')
      .update({ ...eeff, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('eeff')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getStats(): Promise<{ total: number; recent: number }> {
    const { count: total, error: totalError } = await supabase
      .from('eeff')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recent, error: recentError } = await supabase
      .from('eeff')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) throw recentError;

    return {
      total: total || 0,
      recent: recent || 0
    };
  }
}