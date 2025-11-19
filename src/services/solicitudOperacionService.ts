import { supabase } from '@/integrations/supabase/client';
import { SolicitudOperacion, SolicitudOperacionWithRiesgos } from '@/types/solicitud-operacion';

export class SolicitudOperacionService {
  static async getAll(): Promise<SolicitudOperacionWithRiesgos[]> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select(`
        *,
        riesgos:solicitud_operacion_riesgos(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with company names from ficha_ruc
    const enrichedData = await Promise.all(
      (data || []).map(async (solicitud) => {
        const { data: fichaData } = await supabase
          .from('ficha_ruc')
          .select('nombre_empresa')
          .eq('ruc', solicitud.ruc)
          .single();

        return {
          ...solicitud,
          empresa_nombre: fichaData?.nombre_empresa || solicitud.ruc,
        };
      })
    );

    return enrichedData;
  }

  static async getById(id: string): Promise<SolicitudOperacionWithRiesgos | null> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .select(`
        *,
        riesgos:solicitud_operacion_riesgos(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Enrich with company name
    if (data) {
      const { data: fichaData } = await supabase
        .from('ficha_ruc')
        .select('nombre_empresa')
        .eq('ruc', data.ruc)
        .single();

      return {
        ...data,
        empresa_nombre: fichaData?.nombre_empresa || data.ruc,
      };
    }

    return null;
  }

  static async create(solicitud: Partial<SolicitudOperacion>): Promise<SolicitudOperacion> {
    const { data: { user } } = await supabase.auth.getUser();
    const dataToInsert = {
      ...solicitud,
      user_id: user?.id,
    };

    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, solicitud: Partial<SolicitudOperacion>): Promise<SolicitudOperacion> {
    const { data, error } = await supabase
      .from('solicitudes_operacion')
      .update(solicitud)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('solicitudes_operacion')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}