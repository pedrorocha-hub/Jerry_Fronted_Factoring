import { supabase } from '@/integrations/supabase/client';
import { ReporteTributario, ReporteTributarioInsert, ReporteTributarioUpdate, ReporteTributarioWithFicha } from '@/types/reporte-tributario';

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

  // Buscar reportes tributarios por texto
  static async search(searchTerm: string): Promise<ReporteTributarioWithFicha[]> {
    // Esta función es compleja de implementar con la relación por RUC y búsqueda de texto en la tabla relacionada.
    // Por ahora, devolverá todos los reportes.
    return this.getAll();
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
        .select('ruc')
        .limit(1);
        
      if (fichasError) {
        throw new Error(`Error fetching ficha RUC: ${fichasError.message}`);
      }
      
      let ruc: string;
      
      if (fichasRuc && fichasRuc.length > 0) {
        ruc = fichasRuc[0].ruc;
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
        
        ruc = nuevaFicha.ruc;
      }
      
      // Crear un reporte de prueba simple con solo los campos básicos
      const testReporte = {
        ruc: ruc,
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