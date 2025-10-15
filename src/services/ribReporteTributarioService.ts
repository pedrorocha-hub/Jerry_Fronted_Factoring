import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/supabase';

export type RibReporteTributario = Tables<'rib_reporte_tributario'>;

export interface RibReporteTributarioSummary {
  id: string;
  ruc: string;
  nombre_empresa: string | null;
  updated_at: string | null;
  status: string | null;
  creator_name: string | null;
  solicitud_id: string | null;
  anio: number;
}

export const getRibReporteTributarioSummaries = async (): Promise<RibReporteTributarioSummary[]> => {
  const { data, error } = await supabase.rpc('get_rib_reporte_tributario_summaries');

  if (error) {
    console.error('Error fetching RIB reporte tributario summaries:', error);
    throw new Error('No se pudieron cargar los resúmenes de reportes tributarios.');
  }

  return data || [];
};

export const getReporteTributarioForEdit = async (solicitudId: string, anio: number) => {
  const { data, error } = await supabase
    .from('rib_reporte_tributario')
    .select('*')
    .eq('solicitud_id', solicitudId)
    .eq('anio', anio);

  if (error) {
    console.error('Error fetching reporte tributario for edit:', error);
    throw new Error('Error al cargar el reporte para editar.');
  }

  const deudorReport = data.find(r => r.tipo_entidad === 'deudor') || null;
  const proveedorReport = data.find(r => r.tipo_entidad === 'proveedor') || null;

  return { deudorReport, proveedorReport };
};

export const upsertReporteTributario = async (reportData: Partial<RibReporteTributario>) => {
  const { data, error } = await supabase
    .from('rib_reporte_tributario')
    .upsert(reportData)
    .select()
    .single();

  if (error) {
    console.error('Error upserting reporte tributario:', error);
    throw new Error('Error al guardar el reporte tributario.');
  }

  return data;
};