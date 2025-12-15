import { supabase } from '@/integrations/supabase/client';
import { ReporteTributario, ReporteTributarioWithFicha } from '@/types/reporte-tributario';

export interface ReporteTributarioPorEmpresa {
  ruc: string;
  nombre_empresa: string;
  total_reportes: number;
  años_disponibles: number[];
  ultimo_reporte: string;
  promedio_ingresos: number;
}

export interface ReporteTributarioStats {
  total: number;
  thisYear: number;
  uniqueYears: number;
  avgUtilidadNeta: number;
  positiveUtilidad: number;
  negativeUtilidad: number;
  empresasConReportes: number;
}

export class ReporteTributarioService {
  static async getAll(): Promise<ReporteTributarioWithFicha[]> {
    try {
      const { data, error } = await supabase.rpc('get_reportes_tributarios_with_ficha');

      if (error) {
        console.error('Error fetching reportes tributarios via RPC:', error);
        throw new Error(`Error al obtener reportes tributarios: ${error.message}`);
      }

      if (!data) return [];

      // The RPC returns a flat structure, so we need to shape it to match ReporteTributarioWithFicha
      const mappedData = data.map(item => {
        const { nombre_empresa, ...reporteFields } = item;
        return {
          ...reporteFields,
          ficha_ruc: {
            nombre_empresa: nombre_empresa || 'Sin nombre',
            ruc: item.ruc,
          }
        } as ReporteTributarioWithFicha;
      });

      return mappedData;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  static async getAllGroupedByEmpresa(): Promise<ReporteTributarioPorEmpresa[]> {
    try {
      const { data: reportesData, error: reportesError } = await supabase
        .from('reporte_tributario')
        .select('ruc, anio_reporte, renta_ingresos_netos');

      if (reportesError) {
        console.error('Error fetching grouped reportes:', reportesError);
        throw new Error(`Error al obtener reportes agrupados: ${reportesError.message}`);
      }

      if (!reportesData) return [];

      const rucs = [...new Set(reportesData.map(r => r.ruc))];
      if (rucs.length === 0) return [];

      const { data: fichasData, error: fichasError } = await supabase
        .from('ficha_ruc')
        .select('ruc, nombre_empresa')
        .in('ruc', rucs);
      
      if (fichasError) {
        console.error('Error fetching ficha_ruc for grouping:', fichasError);
        throw new Error(`Error al obtener datos de empresas: ${fichasError.message}`);
      }

      const rucToNameMap = new Map(fichasData?.map(f => [f.ruc, f.nombre_empresa]) || []);

      const dataWithNames = reportesData.map(item => ({
        ...item,
        ficha_ruc: {
          nombre_empresa: rucToNameMap.get(item.ruc)
        }
      }));

      // Agrupar por RUC
      const grouped = dataWithNames.reduce((acc, item) => {
        const ruc = item.ruc;
        if (!acc[ruc]) {
          acc[ruc] = {
            ruc,
            nombre_empresa: item.ficha_ruc.nombre_empresa || 'Sin nombre',
            reportes: [],
            años: new Set(),
            ingresos: []
          };
        }
        acc[ruc].reportes.push(item);
        acc[ruc].años.add(item.anio_reporte);
        if (item.renta_ingresos_netos) {
          acc[ruc].ingresos.push(Number(item.renta_ingresos_netos));
        }
        return acc;
      }, {} as any);

      // Convertir a array y calcular estadísticas
      return Object.values(grouped).map((group: any) => ({
        ruc: group.ruc,
        nombre_empresa: group.nombre_empresa,
        total_reportes: group.reportes.length,
        años_disponibles: Array.from(group.años).sort((a: any, b: any) => b - a) as number[],
        ultimo_reporte: Math.max(...(Array.from(group.años) as number[])).toString(),
        promedio_ingresos: group.ingresos.length > 0 
          ? group.ingresos.reduce((sum: number, val: number) => sum + val, 0) / group.ingresos.length 
          : 0
      }));
    } catch (error) {
      console.error('Error in getAllGroupedByEmpresa:', error);
      throw error;
    }
  }

  static async getStats(): Promise<ReporteTributarioStats> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select('ruc, anio_reporte, renta_resultado_antes_participaciones');

      if (error) {
        console.error('Error fetching stats:', error);
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
      }

      if (!data) {
        return {
          total: 0,
          thisYear: 0,
          uniqueYears: 0,
          avgUtilidadNeta: 0,
          positiveUtilidad: 0,
          negativeUtilidad: 0,
          empresasConReportes: 0
        };
      }

      const currentYear = new Date().getFullYear();
      const uniqueYears = new Set(data.map(item => item.anio_reporte)).size;
      const thisYearCount = data.filter(item => item.anio_reporte === currentYear).length;
      
      const utilidades = data
        .map(item => Number(item.renta_resultado_antes_participaciones))
        .filter(val => !isNaN(val));

      const avgUtilidad = utilidades.length > 0 
        ? utilidades.reduce((sum, val) => sum + val, 0) / utilidades.length 
        : 0;

      const positiveCount = utilidades.filter(val => val > 0).length;
      const negativeCount = utilidades.filter(val => val < 0).length;

      // Contar empresas únicas directamente desde los datos
      const empresasUnicas = new Set(data.map(r => r.ruc)).size;

      return {
        total: data.length,
        thisYear: thisYearCount,
        uniqueYears,
        avgUtilidadNeta: avgUtilidad,
        positiveUtilidad: positiveCount,
        negativeUtilidad: negativeCount,
        empresasConReportes: empresasUnicas
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      throw error;
    }
  }

  static async getReportesByRuc(ruc: string): Promise<ReporteTributario[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select('*')
        .eq('ruc', ruc)
        .order('anio_reporte', { ascending: false });

      if (error) {
        console.error('Error fetching reportes by RUC:', error);
        throw new Error(`Error al obtener reportes por RUC: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getReportesByRuc:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<ReporteTributarioWithFicha | null> {
    try {
      const { data: reporteData, error } = await supabase
        .from('reporte_tributario')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching reporte by ID:', error);
        throw new Error(`Error al obtener reporte: ${error.message}`);
      }

      if (!reporteData) return null;

      const { data: fichaData, error: fichaError } = await supabase
        .from('ficha_ruc')
        .select('nombre_empresa, ruc')
        .eq('ruc', reporteData.ruc)
        .single();

      if (fichaError && fichaError.code !== 'PGRST116') {
        console.error('Error fetching related ficha_ruc:', fichaError);
      }

      return {
        ...reporteData,
        ficha_ruc: fichaData ? {
          id: 0,
          nombre_empresa: fichaData.nombre_empresa,
          ruc: fichaData.ruc,
        } : undefined
      };
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  static async create(reporte: Partial<ReporteTributario>): Promise<ReporteTributario> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .insert([reporte])
        .select()
        .single();

      if (error) {
        console.error('Error creating reporte:', error);
        throw new Error(`Error al crear reporte: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  static async update(id: number, reporte: Partial<ReporteTributario>): Promise<ReporteTributario> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .update(reporte)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reporte:', error);
        throw new Error(`Error al actualizar reporte: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('reporte_tributario')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reporte:', error);
        throw new Error(`Error al eliminar reporte: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }
}