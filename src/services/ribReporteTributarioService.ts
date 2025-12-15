import { supabase } from '@/integrations/supabase/client';

export interface RibReporteTributarioData {
  id?: string;
  ruc: string;
  proveedor_ruc: string | null;
  anio: number;
  tipo_entidad: 'proveedor' | 'deudor';
  status?: string;
  cuentas_por_cobrar_giro: number | null;
  total_activos: number | null;
  cuentas_por_pagar_giro: number | null;
  total_pasivos: number | null;
  capital_pagado: number | null;
  total_patrimonio: number | null;
  total_pasivo_patrimonio: number | null;
  ingreso_ventas: number | null;
  utilidad_bruta: number | null;
  utilidad_antes_impuesto: number | null;
  solvencia: number | null;
  gestion: number | null;
  user_id?: string | null;
  solicitud_id: string;
  created_at?: string;
  updated_at?: string;
  nombre_empresa?: string | null;
}

export interface AutoCompleteResult {
  found: boolean;
  data: RibReporteTributarioData[];
  source: 'reporte_tributario' | 'rib_reporte_tributario' | 'none';
  empresa_nombre: string | null;
  warnings: string[];
}

export class RibReporteTributarioService {
  /**
   * Busca datos para auto-completar desde reporte_tributario
   * Si no encuentra, retorna estructura vacía para ingreso manual
   */
  static async autoCompleteFromReporteTributario(
    ruc: string,
    tipoEntidad: 'proveedor' | 'deudor',
    solicitudId: string,
    proveedorRuc?: string | null
  ): Promise<AutoCompleteResult> {
    console.log('🔍 Auto-completando RIB Reporte Tributario:', {
      ruc,
      tipoEntidad,
      solicitudId,
      proveedorRuc
    });

    const warnings: string[] = [];

    try {
      // 1. Buscar en reporte_tributario (tabla principal)
      console.log('📊 Buscando en reporte_tributario para RUC:', ruc);
      
      const { data: reportes, error } = await supabase
        .from('reporte_tributario')
        .select(`
          anio_reporte,
          razon_social,
          renta_cuentas_por_cobrar_comerciales_terceros,
          renta_total_activos_netos,
          renta_total_cuentas_por_pagar,
          renta_total_patrimonio,
          renta_capital_social,
          renta_ingresos_netos,
          renta_resultado_bruto,
          renta_resultado_antes_participaciones
        `)
        .eq('ruc', ruc)
        .in('anio_reporte', [2022, 2023, 2024])
        .order('anio_reporte', { ascending: true });

      if (error) {
        console.error('❌ Error buscando en reporte_tributario:', error);
        warnings.push('Error al buscar datos previos');
      }

      console.log('📊 Reportes encontrados:', reportes?.length || 0, reportes);

      // Si encontró datos en reporte_tributario
      if (reportes && reportes.length > 0) {
        console.log('✅ Datos encontrados en reporte_tributario, auto-completando...');
        
        const empresa_nombre = reportes[0]?.razon_social || null;
        const ribData: RibReporteTributarioData[] = [];

        for (const reporte of reportes) {
          // Calcular campos derivados
          const total_pasivos = reporte.renta_total_cuentas_por_pagar || 0;
          const total_patrimonio = reporte.renta_total_patrimonio || 0;
          const total_pasivo_patrimonio = total_pasivos + total_patrimonio;
          const total_activos = reporte.renta_total_activos_netos || 0;

          // Calcular ratios
          const solvencia = total_pasivos > 0 ? (total_activos / total_pasivos) : null;
          const cuentas_por_cobrar = reporte.renta_cuentas_por_cobrar_comerciales_terceros || 0;
          const ingresos = reporte.renta_ingresos_netos || 0;
          const gestion = ingresos > 0 ? ((cuentas_por_cobrar / ingresos) * 365) : null;

          // Validación contable
          if (total_activos > 0 && total_pasivo_patrimonio > 0) {
            const diferencia = Math.abs(total_activos - total_pasivo_patrimonio);
            if (diferencia > 1) {
              warnings.push(
                `Año ${reporte.anio_reporte}: Activos (${total_activos.toLocaleString()}) ≠ Pasivo+Patrimonio (${total_pasivo_patrimonio.toLocaleString()})`
              );
            }
          }

          ribData.push({
            ruc: ruc,
            proveedor_ruc: tipoEntidad === 'proveedor' ? ruc : proveedorRuc || null,
            anio: reporte.anio_reporte,
            tipo_entidad: tipoEntidad,
            status: 'Borrador',
            cuentas_por_cobrar_giro: reporte.renta_cuentas_por_cobrar_comerciales_terceros,
            total_activos: reporte.renta_total_activos_netos,
            cuentas_por_pagar_giro: reporte.renta_total_cuentas_por_pagar,
            total_pasivos: reporte.renta_total_cuentas_por_pagar,
            capital_pagado: reporte.renta_capital_social,
            total_patrimonio: reporte.renta_total_patrimonio,
            total_pasivo_patrimonio,
            ingreso_ventas: reporte.renta_ingresos_netos,
            utilidad_bruta: reporte.renta_resultado_bruto,
            utilidad_antes_impuesto: reporte.renta_resultado_antes_participaciones,
            solvencia,
            gestion,
            solicitud_id: solicitudId,
            nombre_empresa: empresa_nombre
          });
        }

        console.log('✅ Auto-completado exitoso:', ribData.length, 'años');

        return {
          found: true,
          data: ribData,
          source: 'reporte_tributario',
          empresa_nombre,
          warnings
        };
      }

      // 2. Si no encontró en reporte_tributario, buscar en rib_reporte_tributario
      console.log('📊 No encontrado en reporte_tributario, buscando en rib_reporte_tributario...');
      
      const { data: ribData, error: ribError } = await supabase
        .from('rib_reporte_tributario')
        .select('*')
        .eq('ruc', ruc)
        .eq('tipo_entidad', tipoEntidad)
        .eq('solicitud_id', solicitudId)
        .order('anio', { ascending: true });

      if (ribError) {
        console.error('❌ Error buscando en rib_reporte_tributario:', ribError);
      }

      if (ribData && ribData.length > 0) {
        console.log('✅ Datos encontrados en rib_reporte_tributario:', ribData.length);
        
        return {
          found: true,
          data: ribData,
          source: 'rib_reporte_tributario',
          empresa_nombre: ribData[0]?.nombre_empresa || null,
          warnings: ['Datos cargados desde registros previos']
        };
      }

      // 3. No se encontraron datos en ninguna tabla
      console.log('ℹ️ No se encontraron datos previos. Permitiendo ingreso manual.');
      
      return {
        found: false,
        data: [],
        source: 'none',
        empresa_nombre: null,
        warnings: ['No se encontraron datos previos. Puede ingresar valores manualmente.']
      };

    } catch (error) {
      console.error('❌ Error en autoCompleteFromReporteTributario:', error);
      
      return {
        found: false,
        data: [],
        source: 'none',
        empresa_nombre: null,
        warnings: ['Error al cargar datos. Puede ingresar valores manualmente.']
      };
    }
  }

  /**
   * Guarda o actualiza datos en rib_reporte_tributario
   */
  static async saveData(data: RibReporteTributarioData[]): Promise<void> {
    console.log('💾 Guardando datos en rib_reporte_tributario:', data.length, 'registros');

    try {
      for (const item of data) {
        if (item.id) {
          // Actualizar existente
          const { error } = await supabase
            .from('rib_reporte_tributario')
            .update(item)
            .eq('id', item.id);

          if (error) throw error;
        } else {
          // Insertar nuevo
          const { error } = await supabase
            .from('rib_reporte_tributario')
            .insert(item);

          if (error) throw error;
        }
      }

      console.log('✅ Datos guardados exitosamente');
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      throw error;
    }
  }
}