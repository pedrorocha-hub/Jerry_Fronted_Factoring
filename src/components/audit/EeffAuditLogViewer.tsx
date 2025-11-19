import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { EeffAuditLogService } from '@/services/eeffAuditLogService';
import { EeffAuditLogWithUserInfo } from '@/types/eeff-audit-log';

interface EeffAuditLogViewerProps {
  eeffId: string;
}

const EeffAuditLogViewer: React.FC<EeffAuditLogViewerProps> = ({ eeffId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    if (!eeffId) {
      return [];
    }
    const data = await EeffAuditLogService.getLogsByEeffId(eeffId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string, log?: BaseAuditLog): string => {
    const fieldNames: Record<string, string> = {
      ruc: 'RUC',
      anio_reporte: 'Año del Reporte',
      // Activos
      activo_efectivo_y_equivalentes_de_efectivo: 'Efectivo y Equivalentes de Efectivo',
      activo_inversiones_financieras: 'Inversiones Financieras',
      activo_ctas_por_cobrar_comerciales_terceros: 'Cuentas por Cobrar Comerciales (Terceros)',
      activo_ctas_por_cobrar_comerciales_relacionadas: 'Cuentas por Cobrar Comerciales (Relacionadas)',
      activo_cuentas_por_cobrar_al_personal_socios_y_directores: 'Cuentas por Cobrar (Personal, Socios y Directores)',
      activo_ctas_por_cobrar_diversas_terceros: 'Cuentas por Cobrar Diversas (Terceros)',
      activo_ctas_por_cobrar_diversas_relacionadas: 'Cuentas por Cobrar Diversas (Relacionadas)',
      activo_serv_y_otros_contratados_por_anticipado: 'Servicios y Otros Contratados por Anticipado',
      activo_estimacion_ctas_de_cobranza_dudosa: 'Estimación de Cuentas de Cobranza Dudosa',
      activo_mercaderias: 'Mercaderías',
      activo_productos_terminados: 'Productos Terminados',
      activo_subproductos_desechos_y_desperdicios: 'Subproductos, Desechos y Desperdicios',
      activo_productos_en_proceso: 'Productos en Proceso',
      activo_materias_primas: 'Materias Primas',
      activo_materiales_aux_suministros_y_repuestos: 'Materiales Auxiliares, Suministros y Repuestos',
      activo_envases_y_embalajes: 'Envases y Embalajes',
      activo_inventarios_por_recibir: 'Inventarios por Recibir',
      activo_desvalorizacion_de_inventarios: 'Desvalorización de Inventarios',
      activo_activos_no_ctes_mantenidos_para_la_venta: 'Activos no Corrientes Mantenidos para la Venta',
      activo_otro_activos_corrientes: 'Otros Activos Corrientes',
      activo_inversiones_mobiliarias: 'Inversiones Mobiliarias',
      activo_propiedades_de_inversion: 'Propiedades de Inversión',
      activo_activos_por_derecho_de_uso: 'Activos por Derecho de Uso',
      activo_propiedades_planta_y_equipo: 'Propiedades, Planta y Equipo',
      activo_depreciacion_de_1_2_y_ppe_acumulados: 'Depreciación Acumulada',
      activo_intangibles: 'Activos Intangibles',
      activo_activos_biologicos: 'Activos Biológicos',
      activo_deprec_act_biologico_y_amortiz_acumulada: 'Depreciación de Activos Biológicos y Amortización Acumulada',
      activo_desvalorizacion_de_activo_inmovilizado: 'Desvalorización de Activo Inmovilizado',
      activo_activo_diferido: 'Activo Diferido',
      activo_otros_activos_no_corrientes: 'Otros Activos no Corrientes',
      activo_total_activo_neto: 'Total Activo Neto',
      // Pasivos
      pasivo_sobregiros_bancarios: 'Sobregiros Bancarios',
      pasivo_trib_y_aport_sist_pens_y_salud_por_pagar: 'Tributos y Aportes al Sistema de Pensiones y Salud por Pagar',
      pasivo_remuneraciones_y_participaciones_por_pagar: 'Remuneraciones y Participaciones por Pagar',
      pasivo_ctas_por_pagar_comerciales_terceros: 'Cuentas por Pagar Comerciales (Terceros)',
      pasivo_ctas_por_pagar_comerciales_relacionadas: 'Cuentas por Pagar Comerciales (Relacionadas)',
      pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct: 'Cuentas por Pagar (Accionistas, Socios, Participantes y Directores)',
      pasivo_ctas_por_pagar_diversas_terceros: 'Cuentas por Pagar Diversas (Terceros)',
      pasivo_ctas_por_pagar_diversas_relacionadas: 'Cuentas por Pagar Diversas (Relacionadas)',
      pasivo_obligaciones_financieras: 'Obligaciones Financieras',
      pasivo_provisiones: 'Provisiones',
      pasivo_pasivo_diferido: 'Pasivo Diferido',
      pasivo_total_pasivo: 'Total Pasivo',
      // Patrimonio
      patrimonio_capital: 'Capital',
      patrimonio_acciones_de_inversion: 'Acciones de Inversión',
      patrimonio_capital_adicional_positivo: 'Capital Adicional Positivo',
      patrimonio_capital_adicional_negativo: 'Capital Adicional Negativo',
      patrimonio_resultados_no_realizados: 'Resultados no Realizados',
      patrimonio_excedente_de_revaluacion: 'Excedente de Revaluación',
      patrimonio_reservas: 'Reservas',
      patrimonio_resultados_acumulados_positivos: 'Resultados Acumulados Positivos',
      patrimonio_resultados_acumulados_negativos: 'Resultados Acumulados Negativos',
      patrimonio_utilidad_de_ejercicio: 'Utilidad del Ejercicio',
      patrimonio_perdida_de_ejercicio: 'Pérdida del Ejercicio',
      patrimonio_total_patrimonio: 'Total Patrimonio',
      patrimonio_total_pasivo_y_patrimonio: 'Total Pasivo y Patrimonio',
    };
    
    const baseName = fieldNames[field] || field;
    
    // Si hay año, agregarlo al nombre
    const anio = log?.old_values?.anio_reporte || log?.new_values?.anio_reporte;
    if (anio && field !== 'anio_reporte') {
      return `${baseName} (${anio})`;
    }
    return baseName;
  };

  const formatValue = (value: any, fieldName?: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    
    // Formatear valores monetarios (todos los campos de activo, pasivo y patrimonio)
    if (fieldName && (
      fieldName.startsWith('activo_') || 
      fieldName.startsWith('pasivo_') || 
      fieldName.startsWith('patrimonio_')
    ) && typeof value === 'number') {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    }
    
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const shouldShowField = (field: string): boolean => {
    // No mostrar el campo anio_reporte ya que se incluye en el nombre
    return field !== 'anio_reporte';
  };

  const getCreatedMessage = (): string => {
    return '✨ Estado Financiero (EEFF) creado inicialmente';
  };

  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<BaseAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      title="Historial de Auditoría - EEFF"
      description="Registro completo de todos los cambios realizados en este estado financiero"
      groupLogs={true}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      shouldShowField={shouldShowField}
      getCreatedMessage={getCreatedMessage}
    />
  );
};

export default EeffAuditLogViewer;

