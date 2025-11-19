import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { VentasMensualesAuditLogService } from '@/services/ventasMensualesAuditLogService';
import { VentasMensualesAuditLogWithUserInfo } from '@/types/ventas-mensuales-audit-log';
import { VentasStatus, getVentasStatusDisplay } from '@/types/ventasMensuales';

interface VentasMensualesAuditLogViewerProps {
  proveedorRuc: string;
  deudorRuc: string | null;
  solicitudId: string | null;
}

const VentasMensualesAuditLogViewer: React.FC<VentasMensualesAuditLogViewerProps> = ({ proveedorRuc, deudorRuc, solicitudId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    if (!solicitudId) {
      return [];
    }
    const data = await VentasMensualesAuditLogService.getLogsBySolicitud(proveedorRuc, deudorRuc, solicitudId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string, log?: BaseAuditLog): string => {
    const fieldNames: Record<string, string> = {
      proveedor_ruc: 'RUC Proveedor',
      deudor_ruc: 'RUC Deudor',
      anio: 'Año',
      tipo_entidad: 'Tipo de Entidad',
      status: 'Estado',
      validado_por: 'Validado Por',
      solicitud_id: 'Solicitud Asociada',
      enero: 'Enero',
      febrero: 'Febrero',
      marzo: 'Marzo',
      abril: 'Abril',
      mayo: 'Mayo',
      junio: 'Junio',
      julio: 'Julio',
      agosto: 'Agosto',
      setiembre: 'Setiembre',
      octubre: 'Octubre',
      noviembre: 'Noviembre',
      diciembre: 'Diciembre',
    };
    
    const baseName = fieldNames[field] || field;
    // Si hay año y es un mes, agregar el año al nombre
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
    const anio = log?.old_values?.anio || log?.new_values?.anio;
    if (anio && meses.includes(field)) {
      return `${baseName} (${anio})`;
    }
    return baseName;
  };

  const formatValue = (value: any, fieldName?: string): string => {
    if (value === null || value === undefined) return 'N/A';
    
    // Mapear status al formato de display
    if (fieldName === 'status') {
      return getVentasStatusDisplay(value as VentasStatus);
    }
    
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
    return '✨ Reporte de ventas creado inicialmente';
  };

  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<BaseAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      title="Historial de Auditoría - Ventas Mensuales"
      description="Registro completo de todos los cambios realizados en este reporte"
      groupLogs={true}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      shouldShowField={shouldShowField}
      getCreatedMessage={getCreatedMessage}
    />
  );
};

export default VentasMensualesAuditLogViewer;
