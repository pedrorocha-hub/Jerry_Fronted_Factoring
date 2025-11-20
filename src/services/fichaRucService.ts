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

  async search(term: string): Promise<FichaRuc[]> {
    const { data, error } = await supabase.rpc('search_ficha_ruc', {
      search_term: term
    });

    if (error) throw error;
    
    // Mapper simple ya que la función RPC retorna {value, label}
    // En una implementación real idealmente la RPC retornaría toda la fila o usaríamos .ilike()
    // Por compatibilidad con el componente, retornamos array vacío si es búsqueda RPC,
    // o hacemos búsqueda directa si es necesario.
    
    // Fallback a búsqueda directa si la RPC es solo para autocompletar
    const { data: directData, error: directError } = await supabase
      .from('ficha_ruc')
      .select('*')
      .or(`ruc.ilike.%${term}%,nombre_empresa.ilike.%${term}%`)
      .limit(10);
      
    if (directError) throw directError;
    return directData || [];
  }
};