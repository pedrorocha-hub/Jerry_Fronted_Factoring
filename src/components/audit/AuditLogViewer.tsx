import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { AuditLogService } from '@/services/auditLogService';
import { AuditLogWithUserInfo } from '@/types/audit-log';

interface AuditLogViewerProps {
  solicitudId: string;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ solicitudId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    const data = await AuditLogService.getLogsBySolicitudId(solicitudId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      // Campos de solicitudes_operacion
      ruc: 'RUC',
      deudor_ruc: 'RUC del Deudor',
      deudor: 'Nombre del Deudor',
      status: 'Estado',
      direccion: 'Dirección',
      visita: 'Visita',
      contacto: 'Contacto',
      comentarios: 'Comentarios',
      fianza: 'Fianza',
      proveedor: 'Proveedor',
      exposicion_total: 'Exposición Total',
      validado_por: 'Validado Por',
      resumen_solicitud: 'Resumen de Solicitud',
      garantias: 'Garantías',
      condiciones_desembolso: 'Condiciones de Desembolso',
      orden_servicio: 'Orden de Servicio',
      factura: 'Factura',
      tipo_cambio: 'Tipo de Cambio',
      
      // Campos de solicitud_operacion_riesgos
      lp: 'L/P',
      producto: 'Producto',
      lp_vigente_gve: 'L/P Vigente (GVE)',
      riesgo_aprobado: 'Riesgo Aprobado',
      propuesta_comercial: 'Propuesta Comercial',
    };
    return fieldNames[field] || field;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <BaseAuditLogViewer
      loadLogs={loadLogs}
      title="Historial de Auditoría"
      description="Registro completo de todos los cambios realizados en este expediente"
      groupLogs={false}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      getCreatedMessage={() => '✨ Expediente creado inicialmente'}
    />
  );
};

export default AuditLogViewer;