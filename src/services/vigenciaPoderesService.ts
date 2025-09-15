import { supabase } from '@/integrations/supabase/client';
import { VigenciaPoderes, VigenciaPoderesInsert, VigenciaPoderesUpdate, VigenciaPoderesWithRepresentante } from '@/types/vigencia-poderes';

export class VigenciaPoderesService {
  // Obtener todas las vigencias de poderes
  static async getAll(): Promise<VigenciaPoderesWithRepresentante[]> {
    const { data, error } = await supabase
      .from('vigencia_poderes')
      .select(`
        *,
        representante_legal:representante_legal_id (
          id,
          nombre_completo,
          numero_documento_identidad,
          cargo,
          ficha_ruc:ficha_ruc_id (
            id,
            nombre_empresa,
            ruc
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vigencias de poderes:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener vigencia de poderes por ID
  static async getById(id: number): Promise<VigenciaPoderesWithRepresentante | null> {
    const { data, error } = await supabase
      .from('vigencia_poderes')
      .select(`
        *,
        representante_legal:representante_legal_id (
          id,
          nombre_completo,
          numero_documento_identidad,
          cargo,
          ficha_ruc:ficha_ruc_id (
            id,
            nombre_empresa,
            ruc
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vigencia de poderes by ID:', error);
      throw error;
    }

    return data;
  }

  // Obtener vigencias por Representante Legal ID
  static async getByRepresentanteLegalId(representanteLegalId: number): Promise<VigenciaPoderes[]> {
    const { data, error } = await supabase
      .from('vigencia_poderes')
      .select('*')
      .eq('representante_legal_id', representanteLegalId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vigencias by representante legal ID:', error);
      throw error;
    }

    return data || [];
  }

  // Crear nueva vigencia de poderes
  static async create(vigenciaData: VigenciaPoderesInsert): Promise<VigenciaPoderes> {
    const { data, error } = await supabase
      .from('vigencia_poderes')
      .insert(vigenciaData)
      .select()
      .single();

    if (error) {
      console.error('Error creating vigencia de poderes:', error);
      throw error;
    }

    return data;
  }

  // Actualizar vigencia de poderes existente
  static async update(id: number, vigenciaData: VigenciaPoderesUpdate): Promise<VigenciaPoderes> {
    const updateData = {
      ...vigenciaData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('vigencia_poderes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vigencia de poderes:', error);
      throw error;
    }

    return data;
  }

  // Eliminar vigencia de poderes
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('vigencia_poderes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vigencia de poderes:', error);
      throw error;
    }
  }

  // Buscar vigencias de poderes por texto
  static async search(searchTerm: string): Promise<VigenciaPoderesWithRepresentante[]> {
    const { data, error } = await supabase
      .from('vigencia_poderes')
      .select(`
        *,
        representante_legal:representante_legal_id (
          id,
          nombre_completo,
          numero_documento_identidad,
          cargo,
          ficha_ruc:ficha_ruc_id (
            id,
            nombre_empresa,
            ruc
          )
        )
      `)
      .or(`tipo_poder.ilike.%${searchTerm}%,alcance_poderes.ilike.%${searchTerm}%,estado.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching vigencias de poderes:', error);
      throw error;
    }

    return data || [];
  }

  // Obtener estadísticas
  static async getStats() {
    const { count: totalCount } = await supabase
      .from('vigencia_poderes')
      .select('*', { count: 'exact', head: true });

    const { count: thisMonthCount } = await supabase
      .from('vigencia_poderes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    // Contar por estado
    const { data: estadoStats } = await supabase
      .from('vigencia_poderes')
      .select('estado')
      .not('estado', 'is', null);

    const estadoCount: { [key: string]: number } = {};
    estadoStats?.forEach(item => {
      if (item.estado) {
        estadoCount[item.estado] = (estadoCount[item.estado] || 0) + 1;
      }
    });

    // Contar por tipo de poder
    const { data: tipoStats } = await supabase
      .from('vigencia_poderes')
      .select('tipo_poder')
      .not('tipo_poder', 'is', null);

    const tipoCount: { [key: string]: number } = {};
    tipoStats?.forEach(item => {
      if (item.tipo_poder) {
        tipoCount[item.tipo_poder] = (tipoCount[item.tipo_poder] || 0) + 1;
      }
    });

    // Contar vigencias que vencen pronto (próximos 30 días)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { count: vencenProntoCount } = await supabase
      .from('vigencia_poderes')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'Vigente')
      .lte('fecha_fin_vigencia', thirtyDaysFromNow.toISOString().split('T')[0]);

    const mostCommonTipo = Object.entries(tipoCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      total: totalCount || 0,
      thisMonth: thisMonthCount || 0,
      vigentes: estadoCount['Vigente'] || 0,
      vencidos: estadoCount['Vencido'] || 0,
      revocados: estadoCount['Revocado'] || 0,
      vencenProonto: vencenProntoCount || 0,
      mostCommonTipo,
      estadoDistribution: estadoCount,
      tipoDistribution: tipoCount
    };
  }

  // Crear múltiples vigencias para un representante legal
  static async createMultiple(representanteLegalId: number, vigencias: Omit<VigenciaPoderesInsert, 'representante_legal_id'>[]): Promise<VigenciaPoderes[]> {
    const vigenciasWithRepresentanteId = vigencias.map(vigencia => ({
      ...vigencia,
      representante_legal_id: representanteLegalId
    }));

    const { data, error } = await supabase
      .from('vigencia_poderes')
      .insert(vigenciasWithRepresentanteId)
      .select();

    if (error) {
      console.error('Error creating multiple vigencias de poderes:', error);
      throw error;
    }

    return data || [];
  }

  // Verificar vigencias que están por vencer
  static async getVigenciasProximasAVencer(dias: number = 30): Promise<VigenciaPoderesWithRepresentante[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const { data, error } = await supabase
      .from('vigencia_poderes')
      .select(`
        *,
        representante_legal:representante_legal_id (
          id,
          nombre_completo,
          numero_documento_identidad,
          cargo,
          ficha_ruc:ficha_ruc_id (
            id,
            nombre_empresa,
            ruc
          )
        )
      `)
      .eq('estado', 'Vigente')
      .lte('fecha_fin_vigencia', fechaLimite.toISOString().split('T')[0])
      .order('fecha_fin_vigencia', { ascending: true });

    if (error) {
      console.error('Error fetching vigencias próximas a vencer:', error);
      throw error;
    }

    return data || [];
  }
}