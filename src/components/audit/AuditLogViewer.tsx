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
      visita: 'Visita (Resumen)',
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
      
      // Nuevos campos de clasificación
      tipo_producto: 'Tipo de Producto',
      tipo_operacion: 'Tipo de Operación',

      // Nuevos campos de Visita Estructurada
      visita_tipo: 'Tipo de Visita',
      visita_fecha: 'Fecha de Visita',
      visita_contacto_nombre: 'Nombre del Entrevistado',
      visita_contacto_cargo: 'Cargo del Entrevistado',

      // Nuevos campos Financieros
      monto_original: 'Monto Original',
      porcentaje_anticipo: '% Anticipo',
      plazo_dias: 'Plazo (Días)',
      tasa_minima: 'Tasa Mínima',
      tasa_tea: 'Tasa Global (TEA)',
      comision_estructuracion: 'Comisión Estructuración',
      tipo_garantia: 'Tipo de Garantía',

      // Campos de solicitud_operacion_riesgos
      lp: 'L/P',
      producto: 'Producto (Riesgos)',
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