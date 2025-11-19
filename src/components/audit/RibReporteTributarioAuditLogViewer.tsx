import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { RibReporteTributarioAuditLogService } from '@/services/ribReporteTributarioAuditLogService';
import { RibReporteTributarioAuditLogWithUserInfo } from '@/types/rib-reporte-tributario-audit-log';

interface RibReporteTributarioAuditLogViewerProps {
  reporteId: string;
}

const RibReporteTributarioAuditLogViewer: React.FC<RibReporteTributarioAuditLogViewerProps> = ({ reporteId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    if (!reporteId) {
      return [];
    }
    const data = await RibReporteTributarioAuditLogService.getLogsByReporteId(reporteId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string, log?: BaseAuditLog): string => {
    const fieldNames: Record<string, string> = {
      ruc: 'RUC',
      anio: 'Año',
      tipo_entidad: 'Tipo de Entidad',
      status: 'Estado',
      solicitud_id: 'Solicitud Asociada',
      cuentas_por_cobrar_giro: 'Cuentas por Cobrar del Giro',
      total_activos: 'Total Activos',
      cuentas_por_pagar_giro: 'Cuentas por Pagar del Giro',
      total_pasivos: 'Total Pasivos',
      capital_pagado: 'Capital Pagado',
      total_patrimonio: 'Total Patrimonio',
      total_pasivo_patrimonio: 'Total Pasivo y Patrimonio',
      ingreso_ventas: 'Ingreso por Ventas',
      utilidad_bruta: 'Utilidad Bruta',
      utilidad_antes_impuesto: 'Utilidad Antes de Impuesto',
      solvencia: 'Solvencia',
      gestion: 'Gestión',
    };
    
    const baseName = fieldNames[field] || field;
    // Si hay año y no es el campo "anio" mismo, agregar el año al nombre
    const anio = log?.old_values?.anio || log?.new_values?.anio;
    if (anio && field !== 'anio' && field !== 'status' && field !== 'solicitud_id' && field !== 'ruc' && field !== 'tipo_entidad') {
      return `${baseName} (${anio})`;
    }
    return baseName;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const shouldShowField = (field: string): boolean => {
    // No mostrar el campo anio ya que se incluye en el nombre
    return field !== 'anio';
  };

  const getCreatedMessage = (): string => {
    return '✨ Reporte RIB creado inicialmente';
  };

  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<BaseAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      title="Historial de Auditoría - RIB Reporte Tributario"
      description="Registro completo de todos los cambios realizados en este reporte"
      groupLogs={true}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      shouldShowField={shouldShowField}
      getCreatedMessage={getCreatedMessage}
    />
  );
};

export default RibReporteTributarioAuditLogViewer;