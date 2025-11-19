import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { ReporteTributarioAuditLogService } from '@/services/reporteTributarioAuditLogService';
import { ReporteTributarioAuditLogWithUserInfo } from '@/types/reporte-tributario-audit-log';

interface ReporteTributarioAuditLogViewerProps {
  reporteId: number;
}

const ReporteTributarioAuditLogViewer: React.FC<ReporteTributarioAuditLogViewerProps> = ({ reporteId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    if (!reporteId) {
      return [];
    }
    const data = await ReporteTributarioAuditLogService.getLogsByReporteId(reporteId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      // General
      anio_reporte: 'Año del Reporte',
      razon_social: 'Razón Social',
      ruc: 'RUC',
      fecha_emision: 'Fecha de Emisión',
      
      // RUC Info
      ruc_fecha_informacion: 'Fecha de Información',
      ruc_nombre_comercial: 'Nombre Comercial',
      ruc_fecha_inscripcion: 'Fecha de Inscripción',
      ruc_fecha_inicio_actividades: 'Fecha Inicio de Actividades',
      ruc_estado_contribuyente: 'Estado del Contribuyente',
      ruc_condicion_contribuyente: 'Condición del Contribuyente',
      ruc_domicilio_fiscal: 'Domicilio Fiscal',
      ruc_actividad_comercio_exterior: 'Actividad Comercio Exterior',
      ruc_actividad_economica: 'Actividad Económica',
      
      // Facturación
      facturacion_sistema_emision_comprobante: 'Sistema Emisión Comprobante',
      facturacion_sistema_contabilidad: 'Sistema de Contabilidad',
      facturacion_comprobantes_autorizados: 'Comprobantes Autorizados',
      facturacion_sistema_emision_electronica: 'Sistema Emisión Electrónica',
      facturacion_afiliado_ple_desde: 'Afiliado PLE Desde',
      
      // Renta (Declaración Anual)
      renta_fecha_informacion: 'Fecha de Información (Renta)',
      renta_ingresos_netos: 'Ingresos Netos',
      renta_otros_ingresos: 'Otros Ingresos',
      renta_total_activos_netos: 'Total Activos Netos',
      renta_total_cuentas_por_pagar: 'Total Cuentas por Pagar',
      renta_total_patrimonio: 'Total Patrimonio',
      renta_capital_social: 'Capital Social',
      renta_resultado_bruto: 'Resultado Bruto',
      renta_resultado_antes_participaciones: 'Resultado Antes de Participaciones',
      renta_importe_pagado: 'Importe Pagado',
      renta_cuentas_por_cobrar_comerciales_terceros: 'Cuentas por Cobrar Comerciales (Terceros)',
      
      // ITAN
      itan_presento_declaracion: 'Presentó Declaración ITAN',
      itan_base_imponible: 'Base Imponible ITAN',
      itan_itan_a_pagar: 'ITAN a Pagar',
      itan_cuotas_cantidad: 'Cantidad de Cuotas',
      itan_cuotas_monto: 'Monto de Cuota',
      
      // Ingresos Mensuales
      ingresos_enero: 'Ingresos Enero',
      ingresos_febrero: 'Ingresos Febrero',
      ingresos_marzo: 'Ingresos Marzo',
      ingresos_abril: 'Ingresos Abril',
      ingresos_mayo: 'Ingresos Mayo',
      ingresos_junio: 'Ingresos Junio',
      ingresos_julio: 'Ingresos Julio',
      ingresos_agosto: 'Ingresos Agosto',
      ingresos_setiembre: 'Ingresos Setiembre',
      ingresos_octubre: 'Ingresos Octubre',
      ingresos_noviembre: 'Ingresos Noviembre',
      ingresos_diciembre: 'Ingresos Diciembre',
      
      // Ventas Mensuales
      ventas_enero: 'Ventas Enero',
      ventas_febrero: 'Ventas Febrero',
      ventas_marzo: 'Ventas Marzo',
      ventas_abril: 'Ventas Abril',
      ventas_mayo: 'Ventas Mayo',
      ventas_junio: 'Ventas Junio',
      ventas_julio: 'Ventas Julio',
      ventas_agosto: 'Ventas Agosto',
      ventas_setiembre: 'Ventas Setiembre',
      ventas_octubre: 'Ventas Octubre',
      ventas_noviembre: 'Ventas Noviembre',
      ventas_diciembre: 'Ventas Diciembre',
      ventas_total_ingresos: 'Total Ingresos Anuales',
      ventas_total_essalud: 'Total ESSALUD Anual',
    };
    
    return fieldNames[field] || field;
  };

  const formatValue = (value: any, fieldName?: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    
    // Formatear fechas
    if (fieldName && (
      fieldName.includes('fecha') ||
      fieldName.includes('_desde')
    )) {
      try {
        return new Date(value).toLocaleDateString('es-ES');
      } catch {
        return String(value);
      }
    }
    
    // Formatear valores monetarios
    if (fieldName && (
      fieldName.startsWith('renta_') ||
      fieldName.startsWith('itan_') ||
      fieldName.startsWith('ingresos_') ||
      fieldName.startsWith('ventas_')
    ) && typeof value === 'number') {
      // Solo formatear como moneda si el campo parece ser monetario
      if (
        fieldName.includes('cantidad') || 
        fieldName.includes('cuotas_cantidad')
      ) {
        return String(value);
      }
      
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

  const getCreatedMessage = (): string => {
    return '✨ Reporte Tributario creado inicialmente';
  };

  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<BaseAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      title="Historial de Auditoría - Reporte Tributario"
      description="Registro completo de todos los cambios realizados en este reporte tributario"
      groupLogs={true}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      getCreatedMessage={getCreatedMessage}
    />
  );
};

export default ReporteTributarioAuditLogViewer;

