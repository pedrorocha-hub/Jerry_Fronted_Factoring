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
}

export class ReporteTributarioService {
  static async getAll(): Promise<ReporteTributarioWithFicha[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select(`
          *,
          ficha_ruc!inner(
            nombre_empresa,
            ruc
          )
        `)
        .order('anio_reporte', { ascending: false });

      if (error) {
        console.error('Error fetching reportes tributarios:', error);
        throw new Error(`Error al obtener reportes tributarios: ${error.message}`);
      }

      return data?.map(item => ({
        ...item,
        nombre_empresa: (item.ficha_ruc as any)?.nombre_empresa || 'Sin nombre',
        ruc: (item.ficha_ruc as any)?.ruc || item.ruc
      })) || [];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  static async getAllGroupedByEmpresa(): Promise<ReporteTributarioPorEmpresa[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select(`
          ruc,
          anio_reporte,
          renta_ingresos_netos,
          ficha_ruc!inner(
            nombre_empresa
          )
        `)
        .order('ruc');

      if (error) {
        console.error('Error fetching grouped reportes:', error);
        throw new Error(`Error al obtener reportes agrupados: ${error.message}`);
      }

      if (!data) return [];

      // Agrupar por RUC
      const grouped = data.reduce((acc, item) => {
        const ruc = item.ruc;
        if (!acc[ruc]) {
          acc[ruc] = {
            ruc,
            nombre_empresa: (item.ficha_ruc as any)?.nombre_empresa || 'Sin nombre',
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
        .select('anio_reporte, renta_resultado_antes_participaciones');

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
          negativeUtilidad: 0
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

      return {
        total: data.length,
        thisYear: thisYearCount,
        uniqueYears,
        avgUtilidadNeta: avgUtilidad,
        positiveUtilidad: positiveCount,
        negativeUtilidad: negativeCount
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
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select(`
          *,
          ficha_ruc(
            nombre_empresa,
            ruc
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching reporte by ID:', error);
        throw new Error(`Error al obtener reporte: ${error.message}`);
      }

      if (!data) return null;

      return {
        ...data,
        nombre_empresa: (data.ficha_ruc as any)?.nombre_empresa || 'Sin nombre',
        ruc: (data.ficha_ruc as any)?.ruc || data.ruc
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