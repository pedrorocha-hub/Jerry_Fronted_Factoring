import { supabase } from '@/integrations/supabase/client';
import { RepresentanteLegal, RepresentanteLegalInsert, RepresentanteLegalUpdate, RepresentanteLegalWithFicha } from '@/types/representante-legal';

export class RepresentanteLegalService {
  // Obtener todos los representantes legales
  static async getAll(): Promise<RepresentanteLegalWithFicha[]> {
    const { data, error } = await supabase
      .from('representante_legal')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching representantes legales:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener representante legal por ID
  static async getById(id: number): Promise<RepresentanteLegalWithFicha | null> {
    const { data, error } = await supabase
      .from('representante_legal')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching representante legal by ID:', error);
      throw error;
    }

    return data;
  }

  // Obtener representantes legales por RUC
  static async getByRuc(ruc: string): Promise<RepresentanteLegal[]> {
    const { data, error } = await supabase
      .from('representante_legal')
      .select('*')
      .eq('ruc', ruc)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching representantes by RUC:', error);
      throw error;
    }

    return data || [];
  }

  // Crear nuevo representante legal
  static async create(representanteData: RepresentanteLegalInsert): Promise<RepresentanteLegal> {
    const { data, error } = await supabase
      .from('representante_legal')
      .insert(representanteData)
      .select()
      .single();

    if (error) {
      console.error('Error creating representante legal:', error);
      throw error;
    }

    return data;
  }

  // Actualizar representante legal existente
  static async update(id: number, representanteData: RepresentanteLegalUpdate): Promise<RepresentanteLegal> {
    const updateData = {
      ...representanteData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('representante_legal')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating representante legal:', error);
      throw error;
    }

    return data;
  }

  // Eliminar representante legal
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('representante_legal')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting representante legal:', error);
      throw error;
    }
  }

  // Buscar representantes legales por texto
  static async search(searchTerm: string): Promise<RepresentanteLegalWithFicha[]> {
    const { data, error } = await supabase
      .from('representante_legal')
      .select(`
        *,
        ficha_ruc:ruc (
          id,
          nombre_empresa,
          ruc
        )
      `)
      .or(`nombre_completo.ilike.%${searchTerm}%,numero_documento_identidad.ilike.%${searchTerm}%,cargo.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching representantes legales:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener estadísticas
  static async getStats() {
    try {
      const { count: totalCount } = await supabase
        .from('representante_legal')
        .select('*', { count: 'exact', head: true });

      const { count: thisMonthCount } = await supabase
        .from('representante_legal')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      // Contar representantes con cargo definido
      const { count: withCargoCount } = await supabase
        .from('representante_legal')
        .select('*', { count: 'exact', head: true })
        .not('cargo', 'is', null)
        .neq('cargo', '');

      // Contar por cargo más común
      const { data: cargoStats } = await supabase
        .from('representante_legal')
        .select('cargo')
        .not('cargo', 'is', null)
        .neq('cargo', '');

      const cargoCount: { [key: string]: number } = {};
      cargoStats?.forEach(item => {
        if (item.cargo && item.cargo.trim() !== '') {
          cargoCount[item.cargo] = (cargoCount[item.cargo] || 0) + 1;
        }
      });

      const mostCommonCargo = Object.entries(cargoCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      return {
        total: totalCount || 0,
        thisMonth: thisMonthCount || 0,
        withCargo: withCargoCount || 0,
        withoutCargo: (totalCount || 0) - (withCargoCount || 0),
        mostCommonCargo,
        cargoDistribution: cargoCount,
        documentTypeDistribution: {} // Placeholder for compatibility
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de representantes legales:', error);
      return {
        total: 0,
        thisMonth: 0,
        withCargo: 0,
        withoutCargo: 0,
        mostCommonCargo: '',
        cargoDistribution: {},
        documentTypeDistribution: {}
      };
    }
  }

  // Crear múltiples representantes para una ficha RUC
  static async createMultiple(ruc: string, representantes: Omit<RepresentanteLegalInsert, 'ruc'>[]): Promise<RepresentanteLegal[]> {
    const representantesWithRuc = representantes.map(rep => ({
      ...rep,
      ruc: ruc
    }));

    const { data, error } = await supabase
      .from('representante_legal')
      .insert(representantesWithRuc)
      .select();

    if (error) {
      console.error('Error creating multiple representantes legales:', error);
      throw error;
    }

    return data || [];
  }
}