import React from 'react';
import { Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BaseAuditLogViewer, { BaseAuditLog } from './BaseAuditLogViewer';
import { FichaRucAuditLogService, UnifiedAuditLog } from '@/services/fichaRucAuditLogService';

interface FichaRucAuditLogViewerProps {
  ruc: string;
}

// Extender BaseAuditLog para incluir entity_type
interface ExtendedAuditLog extends BaseAuditLog {
  entity_type: 'ficha_ruc' | 'accionista' | 'gerencia';
}

const FichaRucAuditLogViewer: React.FC<FichaRucAuditLogViewerProps> = ({ ruc }) => {
  const loadLogs = async (): Promise<ExtendedAuditLog[]> => {
    if (!ruc) {
      return [];
    }
    const data = await FichaRucAuditLogService.getUnifiedLogsByRuc(ruc);
    return data as ExtendedAuditLog[];
  };

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'ficha_ruc':
        return <Building2 className="h-4 w-4 text-purple-400" />;
      case 'accionista':
        return <Users className="h-4 w-4 text-blue-400" />;
      case 'gerencia':
        return <Users className="h-4 w-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'ficha_ruc':
        return 'Ficha RUC';
      case 'accionista':
        return 'Accionista';
      case 'gerencia':
        return 'Gerencia';
      default:
        return entityType;
    }
  };

  const getEntityTypeBadgeColor = (entityType: string) => {
    switch (entityType) {
      case 'ficha_ruc':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'accionista':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'gerencia':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      // Ficha RUC
      nombre_empresa: 'Nombre de Empresa',
      ruc: 'RUC',
      actividad_empresa: 'Actividad Empresarial',
      fecha_inicio_actividades: 'Fecha de Inicio de Actividades',
      estado_contribuyente: 'Estado del Contribuyente',
      domicilio_fiscal: 'Domicilio Fiscal',
      nombre_representante_legal: 'Representante Legal',
      // Accionista
      dni: 'DNI',
      nombre: 'Nombre',
      porcentaje: 'Porcentaje de Participación',
      vinculo: 'Vínculo',
      calificacion: 'Calificación',
      comentario: 'Comentario',
      // Gerencia
      cargo: 'Cargo',
    };
    return fieldNames[field] || field;
  };

  const formatValue = (value: any, fieldName?: string): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    
    // Formatear porcentaje
    if (fieldName === 'porcentaje' && typeof value === 'number') {
      return `${value}%`;
    }
    
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getCreatedMessage = (log: ExtendedAuditLog): string => {
    if (log.entity_type === 'ficha_ruc') return '✨ Ficha RUC creada inicialmente';
    if (log.entity_type === 'accionista') return `✨ Accionista agregado: ${log.new_values?.nombre}`;
    if (log.entity_type === 'gerencia') return `✨ Gerente agregado: ${log.new_values?.nombre} (${log.new_values?.cargo})`;
    return '✨ Registro creado';
  };

  const getDeletedMessage = (log: ExtendedAuditLog): string => {
    if (log.entity_type === 'accionista') return `🗑️ Accionista eliminado: ${log.old_values?.nombre}`;
    if (log.entity_type === 'gerencia') return `🗑️ Gerente eliminado: ${log.old_values?.nombre} (${log.old_values?.cargo})`;
    return '🗑️ Registro eliminado';
  };

  // Render custom trigger con icono simple
  const trigger = (
    <Button 
      variant="ghost" 
      size="sm"
      title="Ver historial de cambios"
      className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </Button>
  );

  // Renderizar badges adicionales para mostrar el tipo de entidad
  const renderAdditionalBadges = (log: ExtendedAuditLog) => {
    return (
      <Badge className={getEntityTypeBadgeColor(log.entity_type)}>
        {getEntityTypeIcon(log.entity_type)}
        <span className="ml-1.5">{getEntityTypeLabel(log.entity_type)}</span>
      </Badge>
    );
  };
  
  // Workaround para evitar problemas de sintaxis con genéricos en JSX
  const AuditLogViewerComponent = BaseAuditLogViewer<ExtendedAuditLog>;
  
  return (
    <AuditLogViewerComponent
      loadLogs={loadLogs}
      trigger={trigger}
      title="Historial de Auditoría - Ficha RUC"
      description="Registro completo de cambios en Ficha RUC, Accionistas y Gerencia"
      groupLogs={false}
      formatFieldName={formatFieldName}
      formatValue={formatValue}
      getCreatedMessage={getCreatedMessage}
      getDeletedMessage={getDeletedMessage}
      renderAdditionalBadges={renderAdditionalBadges}
    />
  );
};

export default FichaRucAuditLogViewer;
