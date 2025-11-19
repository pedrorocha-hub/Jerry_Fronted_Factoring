import { supabase } from '@/integrations/supabase/client';
import { FichaRuc, FichaRucInsert, FichaRucUpdate } from '@/types/ficha-ruc';

export class FichaRucService {
  // Obtener todas las fichas RUC
  static async getAll(): Promise<FichaRuc[]> {
    try {
      const { data, error } = await supabase
        .from('ficha_ruc')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error obteniendo fichas RUC: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  // Obtener ficha RUC por ID, incluyendo sus accionistas
  static async getById(id: number): Promise<FichaRuc | null> {
    try {
      const { data, error } = await supabase
        .from('ficha_ruc')
        .select('*, accionistas(*)')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error obteniendo ficha RUC: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  // Obtener ficha RUC por RUC (versión corregida y más robusta)
  static async getByRuc(ruc: string): Promise<FichaRuc | null> {
    try {
      const { data, error } = await supabase
        .from('ficha_ruc')
        .select('*')
        .eq('ruc', ruc)
        .limit(1);

      if (error) {
        throw new Error(`Error obteniendo ficha RUC por RUC: ${error.message}`);
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error en getByRuc:', error);
      throw error;
    }
  }

  // Crear nueva ficha RUC
  static async create(fichaData: FichaRucInsert): Promise<FichaRuc> {
    try {
      const { data, error } = await supabase
        .from('ficha_ruc')
        .insert(fichaData)
        .select()
        .single();

      if (error) {
        if (error.message.includes('row-level security') || error.message.includes('RLS')) {
          throw new Error('Error de permisos: Las políticas de seguridad están bloqueando la inserción.');
        }
        throw new Error(`Error creando ficha RUC: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  // Actualizar ficha RUC existente
  static async update(id: number, fichaData: FichaRucUpdate): Promise<FichaRuc> {
    try {
      const updateData = {
        ...fichaData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ficha_ruc')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error actualizando ficha RUC: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  // Crear o actualizar ficha RUC (upsert por RUC)
  static async upsertByRuc(fichaData: FichaRucInsert): Promise<FichaRuc> {
    try {
      const existing = await this.getByRuc(fichaData.ruc);
      
      if (existing) {
        return await this.update(existing.id, fichaData);
      } else {
        return await this.create(fichaData);
      }
    } catch (error) {
      console.error('Error en upsertByRuc:', error);
      throw error;
    }
  }

  // Eliminar ficha RUC
  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('ficha_ruc')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error eliminando ficha RUC: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  // Buscar fichas RUC por texto (usando RPC)
  static async search(searchTerm: string): Promise<{ value: string; label: string }[]> {
    if (searchTerm.length < 2) {
      return [];
    }
    try {
      const { data, error } = await supabase.rpc('search_ficha_ruc', {
        search_term: searchTerm,
      });

      if (error) {
        console.error('Error searching fichas RUC:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en search:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  static async getStats() {
    try {
      const { count: totalCount } = await supabase
        .from('ficha_ruc')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('ficha_ruc')
        .select('*', { count: 'exact', head: true })
        .eq('estado_contribuyente', 'Activo');

      const { count: thisMonthCount } = await supabase
        .from('ficha_ruc')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      return {
        total: totalCount || 0,
        active: activeCount || 0,
        thisMonth: thisMonthCount || 0,
        inactive: (totalCount || 0) - (activeCount || 0)
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        active: 0,
        thisMonth: 0,
        inactive: 0
      };
    }
  }

  // Método para probar la conexión
  static async testConnection(): Promise<void> {
    try {
      const { data, error, count } = await supabase
        .from('ficha_ruc')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error en testConnection:', error);
      throw error;
    }
  }
}