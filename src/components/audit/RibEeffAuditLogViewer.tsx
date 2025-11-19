import React from 'react';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { RibEeffAuditLogService } from '@/services/ribEeffAuditLogService';
import { RibEeffAuditLogWithUserInfo } from '@/types/rib-eeff-audit-log';

interface RibEeffAuditLogViewerProps {
  ribEeffId: string;
}

const RibEeffAuditLogViewer: React.FC<RibEeffAuditLogViewerProps> = ({ ribEeffId }) => {
  const loadLogs = async (): Promise<BaseAuditLog[]> => {
    if (!ribEeffId) {
      return [];
    }
    const data = await RibEeffAuditLogService.getLogsByRibEeffId(ribEeffId);
    return data as BaseAuditLog[];
  };

  const formatFieldName = (field: string, log?: BaseAuditLog): string => {
    const fieldNames: Record<string, string> = {
      status: 'Estado',
      solicitud_id: 'Solicitud Asociada',
      anio_reporte: 'Año del Reporte',
      tipo_entidad: 'Tipo de Entidad',
      // Activos
      activo_caja_inversiones_disponible: 'Caja e Inversiones Disponibles',
      activo_cuentas_por_cobrar_del_giro: 'Cuentas por Cobrar del Giro',
      activo_cuentas_por_cobrar_relacionadas_no_comerciales: 'Cuentas por Cobrar Relacionadas',
      activo_cuentas_por_cobrar_personal_accionistas_directores: 'Cuentas por Cobrar Personal/Accionistas',
      activo_otras_cuentas_por_cobrar_diversas: 'Otras Cuentas por Cobrar',
      activo_existencias: 'Existencias',
      activo_gastos_pagados_por_anticipado: 'Gastos Pagados por Anticipado',
      activo_otros_activos_corrientes: 'Otros Activos Corrientes',
      activo_total_activo_circulante: 'Total Activo Circulante',
      activo_activo_fijo_neto: 'Activo Fijo Neto',
      activo_inversiones_en_valores: 'Inversiones en Valores',
      activo_intangibles: 'Intangibles',
      activo_total_activos: 'Total Activos',
      // Pasivos
      pasivo_sobregiro_bancos_y_obligaciones_corto_plazo: 'Sobregiro Bancos y Obligaciones',
      pasivo_cuentas_por_pagar_del_giro: 'Cuentas por Pagar del Giro',
      pasivo_cuentas_por_pagar_relacionadas_no_comerciales: 'Cuentas por Pagar Relacionadas',
      pasivo_otras_cuentas_por_pagar_diversas: 'Otras Cuentas por Pagar',
      pasivo_total_pasivos: 'Total Pasivos',
      // Patrimonio
      patrimonio_neto_capital_pagado: 'Capital Pagado',
      patrimonio_neto_total_patrimonio: 'Total Patrimonio',
      patrimonio_neto_total_pasivos_y_patrimonio: 'Total Pasivos y Patrimonio',
    };
    
    const baseName = fieldNames[field] || field;
    
    // Si hay año, agregarlo al nombre
    const anio = log?.old_values?.anio_reporte || log?.new_values?.anio_reporte;
    if (anio) {
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
    return '✨ Reporte de RIB EEFF creado inicialmente';
  };

  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<BaseAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      title="Historial de Auditoría - RIB EEFF"
      description="Registro completo de todos los cambios realizados en este reporte"
      groupLogs={true}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      shouldShowField={shouldShowField}
      getCreatedMessage={getCreatedMessage}
    />
  );
};

export default RibEeffAuditLogViewer;
