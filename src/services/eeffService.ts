import { supabase } from '@/integrations/supabase/client';
import { Eeff, CreateEeffDto, UpdateEeffDto } from '@/types/eeff';

const TABLE_NAME = 'eeff';

const COLUMNS = `
  id, ruc, anio_reporte, created_at, updated_at, razon_social, created_by,
  activo_efectivo_y_equivalentes_de_efectivo, activo_inversiones_financieras,
  activo_ctas_por_cobrar_comerciales_terceros, activo_ctas_por_cobrar_comerciales_relacionadas,
  activo_cuentas_por_cobrar_al_personal_socios_y_directores, activo_ctas_por_cobrar_diversas_terceros,
  activo_ctas_por_cobrar_diversas_relacionadas, activo_serv_y_otros_contratados_por_anticipado,
  activo_estimacion_ctas_de_cobranza_dudosa, activo_mercaderias, activo_productos_terminados,
  activo_subproductos_desechos_y_desperdicios, activo_productos_en_proceso, activo_materias_primas,
  activo_materiales_aux_suministros_y_repuestos, activo_envases_y_embalajes, activo_inventarios_por_recibir,
  activo_desvalorizacion_de_inventarios, activo_activos_no_ctes_mantenidos_para_la_venta,
  activo_otro_activos_corrientes, activo_inversiones_mobiliarias, activo_propiedades_de_inversion,
  activo_activos_por_derecho_de_uso, activo_propiedades_planta_y_equipo,
  activo_depreciacion_de_1_2_y_ppe_acumulados, activo_intangibles, activo_activos_biologicos,
  activo_deprec_act_biologico_y_amortiz_acumulada, activo_desvalorizacion_de_activo_inmovilizado,
  activo_activo_diferido, activo_otros_activos_no_corrientes, activo_total_activo_neto,
  pasivo_sobregiros_bancarios, pasivo_trib_y_aport_sist_pens_y_salud_por_pagar,
  pasivo_remuneraciones_y_participaciones_por_pagar, pasivo_ctas_por_pagar_comerciales_terceros,
  pasivo_ctas_por_pagar_comerciales_relacionadas, pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct,
  pasivo_ctas_por_pagar_diversas_terceros, pasivo_ctas_por_pagar_diversas_relacionadas,
  pasivo_obligaciones_financieras, pasivo_provisiones, pasivo_pasivo_diferido, pasivo_total_pasivo,
  patrimonio_capital, patrimonio_acciones_de_inversion, patrimonio_capital_adicional_positivo,
  patrimonio_capital_adicional_negativo, patrimonio_resultados_no_realizados,
  patrimonio_excedente_de_revaluacion, patrimonio_reservas, patrimonio_resultados_acumulados_positivos,
  patrimonio_resultados_acumulados_negativos, patrimonio_utilidad_de_ejercicio,
  patrimonio_perdida_de_ejercicio, patrimonio_total_patrimonio, patrimonio_total_pasivo_y_patrimonio
`;

export interface EeffSummary {
  latest_id: string;
  ruc: string;
  nombre_empresa: string | null;
  last_updated_at: string;
  creator_name: string | null;
  years: number[];
}

export const EeffService = {
  async getAll(): Promise<Eeff[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select(COLUMNS).order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching EEFF data:", error);
      throw new Error(error.message);
    }
    return data || [];
  },

  async getAllSummaries(): Promise<EeffSummary[]> {
    const { data, error } = await supabase.rpc('get_eeff_summaries');
    if (error) {
      console.error("Error fetching EEFF summaries:", error);
      throw new Error(error.message);
    }
    return data || [];
  },

  async getById(id: string): Promise<Eeff | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(COLUMNS)
      .eq('id', id)
      .single();
    if (error) {
      console.error(`Error fetching EEFF record ${id}:`, error);
      throw new Error(error.message);
    }
    return data;
  },

  async getByRuc(ruc: string): Promise<Eeff[]> {
    if (!ruc) return [];
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(COLUMNS)
      .eq('ruc', ruc)
      .order('anio_reporte', { ascending: true });
    if (error) {
      console.error(`Error fetching EEFF data for RUC ${ruc}:`, error);
      throw new Error(error.message);
    }
    return data || [];
  },

  async create(dto: CreateEeffDto): Promise<Eeff> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(dto)
      .select(COLUMNS)
      .single();
    if (error) {
      console.error("Error creating EEFF record:", error);
      throw new Error(error.message);
    }
    return data;
  },

  async update(id: string, dto: UpdateEeffDto): Promise<Eeff> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(dto)
      .eq('id', id)
      .select(COLUMNS)
      .single();
    if (error) {
      console.error(`Error updating EEFF record ${id}:`, error);
      throw new Error(error.message);
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
    if (error) {
      console.error(`Error deleting EEFF record ${id}:`, error);
      throw new Error(error.message);
    }
  },
};