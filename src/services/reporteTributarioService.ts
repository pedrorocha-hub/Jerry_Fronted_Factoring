import { supabase } from '@/integrations/supabase/client';
import { ReporteTributario, ReporteTributarioInsert, ReporteTributarioUpdate, ReporteTributarioWithFicha } from '@/types/reporte-tributario';

export interface ReporteTributarioPorEmpresa {
  ruc: string;
  nombre_empresa: string;
  ficha_ruc_id: number;
  reportes: ReporteTributarioWithFicha[];
  años: (number | undefined)[];
  ultimoReporte: string;
}

export class ReporteTributarioService {
  // Obtener todos los reportes tributarios
  static async getAll(): Promise<ReporteTributarioWithFicha[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select(`
          *,
          ficha_ruc:ruc (
            id,
            nombre_empresa,
            ruc
          )
        `);

      if (error) {
        console.error('Error fetching reportes tributarios:', error);
        throw new Error(`Error en consulta de reportes: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Error in ReporteTributarioService.getAll:', error);
      throw error;
    }
  }

  // Obtener todos los reportes agrupados por empresa
  static async getAllGroupedByEmpresa(): Promise<ReporteTributarioPorEmpresa[]> {
    const reportes = await this.getAll();
    
    const grouped = reportes.reduce((acc, reporte) => {
      const ruc = reporte.ruc;
      if (!ruc || !reporte.ficha_ruc) return acc;

      if (!acc[ruc]) {
        acc[ruc] = {
          ruc: ruc,
          nombre_empresa: reporte.ficha_ruc.nombre_empresa,
          ficha_ruc_id: reporte.ficha_ruc.id,
          reportes: [],
          años: [],
          ultimoReporte: 'N/A'
        };
      }
      
      acc[ruc].reportes.push(reporte);
      return acc;
    }, {} as Record<string, ReporteTributarioPorEmpresa>);

    // Ordenar reportes y extraer años/último reporte
    Object.values(grouped).forEach(empresa => {
      empresa.reportes.sort((a, b) => (b.anio_reporte || 0) - (a.anio_reporte || 0));
      empresa.años = empresa.reportes.map(r => r.anio_reporte).sort((a, b) => (b || 0) - (a || 0));
      if (empresa.reportes[0]?.created_at) {
        empresa.ultimoReporte = new Date(empresa.reportes[0].created_at).toLocaleDateString('es-ES');
      }
    });

    return Object.values(grouped).sort((a, b) => a.nombre_empresa.localeCompare(b.nombre_empresa));
  }

  // Obtener reporte tributario por ID
  static async getById(id: number): Promise<ReporteTributarioWithFicha | null> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
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
        console.error('Error fetching reporte tributario by ID:', error);
        throw error;
      }

      return data;

    } catch (error) {
      console.error('Error in ReporteTributarioService.getById:', error);
      throw error;
    }
  }

  // Obtener reportes tributarios por RUC
  static async getByRuc(ruc: string): Promise<ReporteTributario[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select('*')
        .eq('ruc', ruc);

      if (error) {
        console.error('Error fetching reportes by RUC:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in ReporteTributarioService.getByRuc:', error);
      throw error;
    }
  }

  // Crear nuevo reporte tributario
  static async create(reporteData: ReporteTributarioInsert): Promise<ReporteTributario> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .insert(reporteData)
        .select()
        .single();

      if (error) {
        console.error('Error creating reporte tributario:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ReporteTributarioService.create:', error);
      throw error;
    }
  }

  // Actualizar reporte tributario existente
  static async update(id: number, reporteData: ReporteTributarioUpdate): Promise<ReporteTributario> {
    try {
      const updateData = {
        ...reporteData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('reporte_tributario')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reporte tributario:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in ReporteTributarioService.update:', error);
      throw error;
    }
  }

  // Eliminar reporte tributario
  static async delete(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('reporte_tributario')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting reporte tributario:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in ReporteTributarioService.delete:', error);
      throw error;
    }
  }

  // Obtener estadísticas simplificadas
  static async getStats() {
    try {
      const { count: totalCount } = await supabase
        .from('reporte_tributario')
        .select('*', { count: 'exact', head: true });

      const { data: uniqueRucs, error } = await supabase
        .from('reporte_tributario')
        .select('ruc', { count: 'exact' });

      if (error) throw error;

      const uniqueCompanies = new Set(uniqueRucs.map(item => item.ruc)).size;

      return {
        total: totalCount || 0,
        empresasConReportes: uniqueCompanies,
      };
    } catch (error) {
      console.error('Error in ReporteTributarioService.getStats:', error);
      return {
        total: 0,
        empresasConReportes: 0,
      };
    }
  }
}