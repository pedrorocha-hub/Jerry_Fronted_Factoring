import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReporteTributario {
  id: number;
  anio_reporte: number;
  ruc: string;
  renta_total_activos_netos?: number;
  renta_total_cuentas_por_pagar?: number;
  renta_total_patrimonio?: number;
  renta_capital_social?: number;
  renta_total_pasivo?: number;
  renta_cuentas_por_cobrar_comerciales_terceros?: number;
}

interface EstadoSituacionAnio {
  cuentas_por_cobrar_del_giro: number | null;
  total_activos: number | null;
  cuentas_por_pagar_del_giro: number | null;
  total_pasivos: number | null;
  capital_pagado: number | null;
  total_patrimonio: number | null;
  total_pasivo_y_patrimonio: number | null;
  warning?: string;
}

interface EstadoSituacionCompleto {
  ruc: string;
  data_2022: EstadoSituacionAnio | null;
  data_2023: EstadoSituacionAnio | null;
  data_2024: EstadoSituacionAnio | null;
  success: boolean;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { ruc_input } = await req.json()

    if (!ruc_input) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'RUC es requerido',
          data: null 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Buscando reportes tributarios para RUC: ${ruc_input}`)

    // Buscar todos los reportes tributarios para el RUC
    const { data: reportes, error } = await supabase
      .from('reporte_tributario')
      .select(`
        id,
        anio_reporte,
        ruc,
        renta_total_activos_netos,
        renta_total_cuentas_por_pagar,
        renta_total_patrimonio,
        renta_capital_social,
        renta_total_pasivo,
        renta_cuentas_por_cobrar_comerciales_terceros
      `)
      .eq('ruc', ruc_input)
      .in('anio_reporte', [2022, 2023, 2024])

    if (error) {
      console.error('Error consultando reportes tributarios:', error)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error consultando base de datos: ${error.message}`,
          data: null 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Encontrados ${reportes?.length || 0} reportes`)

    // Función para limpiar valores numéricos
    const limpiarNumero = (valor: any): number | null => {
      if (valor === null || valor === undefined) return null
      
      let numeroLimpio = valor
      if (typeof valor === 'string') {
        // Eliminar puntos separadores de miles y convertir comas decimales a puntos
        numeroLimpio = valor.replace(/\./g, '').replace(',', '.')
      }
      
      const numero = parseFloat(numeroLimpio)
      return isNaN(numero) ? null : numero
    }

    // Función para procesar un año específico
    const procesarAnio = (reporte: ReporteTributario | undefined): EstadoSituacionAnio | null => {
      if (!reporte) return null

      const cuentas_por_cobrar_del_giro = limpiarNumero(reporte.renta_cuentas_por_cobrar_comerciales_terceros)
      const total_activos = limpiarNumero(reporte.renta_total_activos_netos)
      const cuentas_por_pagar_del_giro = limpiarNumero(reporte.renta_total_cuentas_por_pagar)
      const total_pasivos = limpiarNumero(reporte.renta_total_pasivo)
      const capital_pagado = limpiarNumero(reporte.renta_capital_social)
      const total_patrimonio = limpiarNumero(reporte.renta_total_patrimonio)

      // Calcular total_pasivo_y_patrimonio
      let total_pasivo_y_patrimonio: number | null = null
      if (total_pasivos !== null && total_patrimonio !== null) {
        total_pasivo_y_patrimonio = total_pasivos + total_patrimonio
      } else if (total_pasivos !== null) {
        total_pasivo_y_patrimonio = total_pasivos
      } else if (total_patrimonio !== null) {
        total_pasivo_y_patrimonio = total_patrimonio
      }

      // Validar que cuadre con total_activos
      let warning: string | undefined
      if (total_activos !== null && total_pasivo_y_patrimonio !== null) {
        const diferencia = Math.abs(total_activos - total_pasivo_y_patrimonio)
        if (diferencia > 1) {
          warning = `No cuadra con total_activos (diferencia: ${diferencia.toLocaleString()})`
        }
      }

      const resultado: EstadoSituacionAnio = {
        cuentas_por_cobrar_del_giro,
        total_activos,
        cuentas_por_pagar_del_giro,
        total_pasivos,
        capital_pagado,
        total_patrimonio,
        total_pasivo_y_patrimonio
      }

      if (warning) {
        resultado.warning = warning
      }

      return resultado
    }

    // Organizar reportes por año
    const reportesPorAnio: { [key: number]: ReporteTributario } = {}
    reportes?.forEach(reporte => {
      reportesPorAnio[reporte.anio_reporte] = reporte
    })

    // Procesar cada año
    const resultado: EstadoSituacionCompleto = {
      ruc: ruc_input,
      data_2022: procesarAnio(reportesPorAnio[2022]),
      data_2023: procesarAnio(reportesPorAnio[2023]),
      data_2024: procesarAnio(reportesPorAnio[2024]),
      success: true,
      message: `Procesados ${reportes?.length || 0} reportes tributarios`
    }

    console.log('Resultado procesado:', JSON.stringify(resultado, null, 2))

    return new Response(
      JSON.stringify(resultado),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error inesperado:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Error inesperado: ${error.message}`,
        data: null 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})