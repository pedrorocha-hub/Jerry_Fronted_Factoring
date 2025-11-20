import { supabase } from '@/integrations/supabase/client';
import { FichaRuc } from '@/types/ficha-ruc';

export const FichaRucService = {
  async getByRuc(ruc: string): Promise<FichaRuc | null> {
    try {
      // Usamos maybeSingle en lugar de single para evitar error 406 cuando no existe
      const { data, error } = await supabase
        .from('ficha_ruc')
        .select('*')
        .eq('ruc', ruc)
        .maybeSingle();

      if (error) {
        console.error('Error fetching ficha ruc:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error in getByRuc:', error);
      return null;
    }
  },

  async getAll(): Promise<FichaRuc[]> {
    const { data, error } = await supabase
      .from('ficha_ruc')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getStats() {
    const { count: total } = await supabase
      .from('ficha_ruc')
      .select('*', { count: 'exact', head: true });

    const { count: active } = await supabase
      .from('ficha_ruc')
      .select('*', { count: 'exact', head: true })
      .ilike('estado_contribuyente', '%activo%');

    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();

    const { count: thisMonth } = await supabase
      .from('ficha_ruc')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDay);

    return {
      total: total || 0,
      active: active || 0,
      inactive: (total || 0) - (active || 0),
      thisMonth: thisMonth || 0
    };
  },

  async create(ficha: Partial<FichaRuc>): Promise<FichaRuc> {
    const { data, error } = await supabase
      .from('ficha_ruc')
      .insert([ficha])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, updates: Partial<FichaRuc>): Promise<FichaRuc> {
    const { data, error } = await supabase
      .from('ficha_ruc')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async search(term: string): Promise<any[]> {
    // Buscar por RUC o nombre usando ILIKE para búsqueda flexible
    const { data, error } = await supabase
      .from('ficha_ruc')
      .select('ruc, nombre_empresa')
      .or(`ruc.ilike.%${term}%,nombre_empresa.ilike.%${term}%`)
      .limit(10);

    if (error) throw error;
    
    // Retornar formato compatible con AsyncCombobox {value, label}
    return (data || []).map(item => ({
      value: item.ruc,
      label: `${item.nombre_empresa} (${item.ruc})`
    }));
  }
};