import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { RibAuditLogService } from '@/services/ribAuditLogService';
import { RibAuditLogWithUserInfo } from '@/types/rib-audit-log';

interface RibAuditLogViewerProps {
  ribId: string;
}

const RibAuditLogViewer: React.FC<RibAuditLogViewerProps> = ({ ribId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    if (!ribId) {
      return [];
    }
    const data = await RibAuditLogService.getLogsByRibId(ribId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string): string => {
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
    return fieldNames[field] || field;
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

  const getCreatedMessage = (): string => {
    return '✨ Reporte RIB creado inicialmente';
  };

  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<BaseAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      title="Historial de Auditoría - RIB"
      description="Registro completo de todos los cambios realizados en este reporte"
      groupLogs={false}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      getCreatedMessage={getCreatedMessage}
    />
  );
};

export default RibAuditLogViewer;