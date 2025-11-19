import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { SentinelAuditLogService } from '@/services/sentinelAuditLogService';
import { SentinelAuditLogWithUserInfo } from '@/types/sentinel-audit-log';

interface SentinelAuditLogViewerProps {
  sentinelId: string;
}

const SentinelAuditLogViewer: React.FC<SentinelAuditLogViewerProps> = ({ sentinelId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    if (!sentinelId) {
      return [];
    }
    const data = await SentinelAuditLogService.getLogsBySentinelId(sentinelId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      ruc: 'RUC',
      status: 'Estado',
      score: 'Score / Calificación',
      comportamiento_calificacion: 'Calificación del Comportamiento',
      deuda_directa: 'Deuda Directa',
      deuda_indirecta: 'Deuda Indirecta',
      impagos: 'Impagos',
      deudas_sunat: 'Deudas SUNAT',
      protestos: 'Protestos',
    };
    
    return fieldNames[field] || field;
  };

  const formatValue = (value: any, fieldName?: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    
    // Formatear valores monetarios (deudas, impagos, protestos)
    if (fieldName && (
      fieldName === 'deuda_directa' || 
      fieldName === 'deuda_indirecta' || 
      fieldName === 'impagos' || 
      fieldName === 'deudas_sunat' || 
      fieldName === 'protestos'
    ) && typeof value === 'number') {
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
    return '✨ Documento Sentinel creado inicialmente';
  };

  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<BaseAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      title="Historial de Auditoría - Sentinel"
      description="Registro completo de todos los cambios realizados en este documento Sentinel"
      groupLogs={true}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      getCreatedMessage={getCreatedMessage}
    />
  );
};

export default SentinelAuditLogViewer;

