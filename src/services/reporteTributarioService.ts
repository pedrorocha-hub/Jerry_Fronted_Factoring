import { supabase } from '@/integrations/supabase/client';
import { ReporteTributario, ReporteTributarioInsert, ReporteTributarioUpdate, ReporteTributarioWithFicha } from '@/types/reporte-tributario';

export class ReporteTributarioService {
  // Obtener todos los reportes tributarios
  static async getAll(): Promise<ReporteTributarioWithFicha[]> {
    try {
      console.log('ReporteTributarioService: Fetching all reportes tributarios...');
      
      // Primero vamos a ver qué columnas existen realmente
      const { data: reportesData, error: reportesError } = await supabase
        .from('reporte_tributario')
        .select('*')
        .limit(1);

      if (reportesError) {
        console.error('Error fetching reportes tributarios:', reportesError);
        throw new Error(`Error en consulta de reportes: ${reportesError.message}`);
      }

      console.log('Sample reporte data structure:', reportesData?.[0]);

      // Ahora hacer la consulta completa sin ordenar por anio_reporte
      const { data: allReportesData, error: allReportesError } = await supabase
        .from('reporte_tributario')
        .select('*');

      if (allReportesError) {
        console.error('Error fetching all reportes tributarios:', allReportesError);
        throw new Error(`Error en consulta de reportes: ${allReportesError.message}`);
      }

      console.log('All reportes data:', allReportesData);

      if (!allReportesData || allReportesData.length === 0) {
        console.log('No reportes found');
        return [];
      }

      // Obtener los datos de ficha_ruc por separado
      const fichaRucIds = [...new Set(allReportesData.map(r => r.ficha_ruc_id).filter(id => id))];
      console.log('Ficha RUC IDs:', fichaRucIds);

      let fichasData = [];
      if (fichaRucIds.length > 0) {
        const { data: fichasResult, error: fichasError } = await supabase
          .from('ficha_ruc')
          .select('id, nombre_empresa, ruc')
          .in('id', fichaRucIds);

        if (fichasError) {
          console.error('Error fetching fichas RUC:', fichasError);
          // No lanzar error, solo continuar sin datos de ficha
        } else {
          fichasData = fichasResult || [];
        }
      }

      console.log('Fichas data:', fichasData);

      // Combinar los datos
      const reportesWithFicha: ReporteTributarioWithFicha[] = allReportesData.map(reporte => ({
        ...reporte,
        ficha_ruc: fichasData.find(ficha => ficha.id === reporte.ficha_ruc_id) || undefined
      }));

      console.log(`ReporteTributarioService: Returning ${reportesWithFicha.length} reportes with ficha data`);
      return reportesWithFicha;

    } catch (error) {
      console.error('Error in ReporteTributarioService.getAll:', error);
      throw error;
    }
  }

  // Obtener reporte tributario por ID
  static async getById(id: number): Promise<ReporteTributarioWithFicha | null> {
    try {
      const { data: reporteData, error: reporteError } = await supabase
        .from('reporte_tributario')
        .select('*')
        .eq('id', id)
        .single();

      if (reporteError) {
        console.error('Error fetching reporte tributario by ID:', reporteError);
        throw reporteError;
      }

      if (!reporteData) {
        return null;
      }

      // Obtener datos de ficha RUC si existe ficha_ruc_id
      let fichaData = null;
      if (reporteData.ficha_ruc_id) {
        const { data: fichaResult, error: fichaError } = await supabase
          .from('ficha_ruc')
          .select('id, nombre_empresa, ruc')
          .eq('id', reporteData.ficha_ruc_id)
          .single();

        if (fichaError) {
          console.error('Error fetching ficha RUC:', fichaError);
        } else {
          fichaData = fichaResult;
        }
      }

      return {
        ...reporteData,
        ficha_ruc: fichaData || undefined
      };

    } catch (error) {
      console.error('Error in ReporteTributarioService.getById:', error);
      throw error;
    }
  }

  // Obtener reportes tributarios por Ficha RUC ID
  static async getByFichaRucId(fichaRucId: number): Promise<ReporteTributario[]> {
    try {
      const { data, error } = await supabase
        .from('reporte_tributario')
        .select('*')
        .eq('ficha_ruc_id', fichaRucId);

      if (error) {
        console.error('Error fetching reportes by ficha RUC ID:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in ReporteTributarioService.getByFichaRucId:', error);
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

  // Buscar reportes tributarios por texto
  static async search(searchTerm: string): Promise<ReporteTributarioWithFicha[]> {
    try {
      // Por ahora solo buscar todos los reportes
      const { data: reportesData, error } = await supabase
        .from('reporte_tributario')
        .select('*');

      if (error) {
        console.error('Error searching reportes tributarios:', error);
        throw error;
      }

      if (!reportesData || reportesData.length === 0) {
        return [];
      }

      // Obtener datos de ficha RUC
      const fichaRucIds = [...new Set(reportesData.map(r => r.ficha_ruc_id).filter(id => id))];
      let fichasData = [];
      
      if (fichaRucIds.length > 0) {
        const { data: fichasResult } = await supabase
          .from('ficha_ruc')
          .select('id, nombre_empresa, ruc')
          .in('id', fichaRucIds);
        fichasData = fichasResult || [];
      }

      // Combinar los datos
      return reportesData.map(reporte => ({
        ...reporte,
        ficha_ruc: fichasData.find(ficha => ficha.id === reporte.ficha_ruc_id) || undefined
      }));

    } catch (error) {
      console.error('Error in ReporteTributarioService.search:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  static async getStats() {
    try {
      const { count: totalCount } = await supabase
        .from('reporte_tributario')
        .select('*', { count: 'exact', head: true });

      // Para las estadísticas, necesitamos ver qué columnas existen realmente
      const { data: sampleData } = await supabase
        .from('reporte_tributario')
        .select('*')
        .limit(5);

      console.log('Sample data for stats:', sampleData);

      return {
        total: totalCount || 0,
        thisYear: 0, // Por ahora 0 hasta que sepamos la estructura
        uniqueYears: 0,
        avgUtilidadNeta: 0,
        positiveUtilidad: 0,
        negativeUtilidad: 0,
        empresasConReportes: 0
      };
    } catch (error) {
      console.error('Error in ReporteTributarioService.getStats:', error);
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
  }

  // Crear datos de prueba - necesitamos ver la estructura real primero
  static async createTestData(): Promise<void> {
    try {
      console.log('ReporteTributarioService: Checking table structure...');
      
      // Primero verificar la estructura de la tabla
      const { data: existingData, error: structureError } = await supabase
        .from('reporte_tributario')
        .select('*')
        .limit(1);
        
      if (structureError) {
        console.error('Error checking table structure:', structureError);
        throw new Error(`Error verificando estructura de tabla: ${structureError.message}`);
      }
      
      console.log('Table structure sample:', existingData?.[0]);
      
      // Verificar si existe al menos una ficha RUC
      const { data: fichasRuc, error: fichasError } = await supabase
        .from('ficha_ruc')
        .select('id')
        .limit(1);
        
      if (fichasError) {
        throw new Error(`Error fetching ficha RUC: ${fichasError.message}`);
      }
      
      let fichaRucId: number;
      
      if (fichasRuc && fichasRuc.length > 0) {
        fichaRucId = fichasRuc[0].id;
      } else {
        // Crear una ficha RUC de prueba
        const { data: nuevaFicha, error: createFichaError } = await supabase
          .from('ficha_ruc')
          .insert({
            nombre_empresa: 'EMPRESA DE PRUEBA S.A.C.',
            ruc: '20123456789',
            actividad_empresa: 'Actividad de prueba',
            estado_contribuyente: 'Activo'
          })
          .select()
          .single();
          
        if (createFichaError || !nuevaFicha) {
          throw new Error(`Error creating test ficha RUC: ${createFichaError?.message || 'Unknown error'}`);
        }
        
        fichaRucId = nuevaFicha.id;
      }
      
      // Crear un reporte de prueba simple con solo los campos básicos
      const testReporte = {
        ficha_ruc_id: fichaRucId,
        // Agregar otros campos según la estructura real de la tabla
      };
      
      console.log('Creating test reporte:', testReporte);
      
      const { data, error } = await supabase
        .from('reporte_tributario')
        .insert(testReporte)
        .select();
        
      if (error) {
        console.error('Error creating test reporte:', error);
        throw new Error(`Error creating test reporte tributario: ${error.message}`);
      }
      
      console.log(`ReporteTributarioService: Created test reporte tributario:`, data);
    } catch (error) {
      console.error('Error in ReporteTributarioService.createTestData:', error);
      throw error;
    }
  }
}