import React, { useState, useEffect } from 'react';
import { History, User, Calendar, FileEdit, AlertCircle, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RibEeffAuditLogService } from '@/services/ribEeffAuditLogService';
import { RibEeffAuditLogWithUserInfo, RibEeffAuditAction } from '@/types/rib-eeff-audit-log';
import { Loader2 } from 'lucide-react';

interface RibEeffAuditLogViewerProps {
  ribEeffId: string;
}

interface GroupedLog {
  id: string;
  action: RibEeffAuditAction;
  user_full_name?: string;
  user_email: string | null;
  created_at: string;
  logs: RibEeffAuditLogWithUserInfo[];
}

const RibEeffAuditLogViewer: React.FC<RibEeffAuditLogViewerProps> = ({ ribEeffId }) => {
  const [logs, setLogs] = useState<RibEeffAuditLogWithUserInfo[]>([]);
  const [groupedLogs, setGroupedLogs] = useState<GroupedLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && ribEeffId) {
      loadLogs();
    }
  }, [isOpen, ribEeffId]);

  const loadLogs = async () => {
    if (!ribEeffId) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await RibEeffAuditLogService.getLogsByRibEeffId(ribEeffId);
      setLogs(data);
      groupLogsByOperation(data);
    } catch (error) {
      console.error('Error loading RIB EEFF audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupLogsByOperation = (logs: RibEeffAuditLogWithUserInfo[]) => {
    const groups: GroupedLog[] = [];
    
    logs.forEach((log) => {
      const existingGroup = groups.find((group) => {
        const timeDiff = Math.abs(
          new Date(group.created_at).getTime() - new Date(log.created_at).getTime()
        );
        return (
          timeDiff < 5000 &&
          group.user_email === log.user_email &&
          group.action === log.action
        );
      });

      if (existingGroup) {
        existingGroup.logs.push(log);
      } else {
        groups.push({
          id: log.id,
          action: log.action,
          user_full_name: log.user_full_name,
          user_email: log.user_email,
          created_at: log.created_at,
          logs: [log],
        });
      }
    });

    setGroupedLogs(groups);
  };

  const getActionIcon = (action: RibEeffAuditAction) => {
    switch (action) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'updated':
        return <FileEdit className="h-4 w-4 text-blue-400" />;
      case 'status_changed':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-400" />;
      default:
        return <FileEdit className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionLabel = (action: RibEeffAuditAction) => {
    switch (action) {
      case 'created':
        return 'Creado';
      case 'updated':
        return 'Actualizado';
      case 'status_changed':
        return 'Estado Cambiado';
      case 'deleted':
        return 'Eliminado';
      default:
        return action;
    }
  };

  const getActionBadgeColor = (action: RibEeffAuditAction) => {
    switch (action) {
      case 'created':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'updated':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'status_changed':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'deleted':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatFieldName = (field: string, anio?: number): string => {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
          <History className="h-4 w-4 mr-2" />
          Ver Historial de Cambios
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#121212] border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <History className="h-6 w-6 mr-3 text-[#00FF80]" />
            Historial de Auditoría - RIB EEFF
          </DialogTitle>
          <p className="text-gray-400 text-sm">
            Registro completo de todos los cambios realizados en este reporte
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
          </div>
        ) : groupedLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay cambios registrados para este reporte.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedLogs.map((group, groupIndex) => (
              <Card key={group.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getActionIcon(group.action)}
                      <div>
                        <Badge className={getActionBadgeColor(group.action)}>
                          {getActionLabel(group.action)}
                        </Badge>
                        {group.logs.length > 1 && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({group.logs.length} registros actualizados)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(group.created_at).toLocaleString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>
                      {group.user_full_name || group.user_email || 'Usuario desconocido'}
                    </span>
                  </div>

                  {group.logs.some(log => log.changed_fields && Object.keys(log.changed_fields).length > 0) && (
                    <>
                      <Separator className="my-3 bg-gray-800" />
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase">
                          Campos Modificados:
                        </h4>
                        {group.logs.map((log, logIndex) => {
                          if (!log.changed_fields || Object.keys(log.changed_fields).length === 0) {
                            return null;
                          }
                          
                          const anio = log.old_values?.anio_reporte || log.new_values?.anio_reporte;
                          
                          return (
                            <div key={logIndex}>
                              {Object.keys(log.changed_fields)
                                .filter(field => {
                                  if (field === 'anio_reporte') return false;
                                  
                                  const oldValue = log.old_values?.[field];
                                  const newValue = log.new_values?.[field];
                                  
                                  if ((oldValue === undefined || oldValue === null) && 
                                      (newValue === undefined || newValue === null)) {
                                    return false;
                                  }
                                  
                                  return true;
                                })
                                .map((field) => (
                                  <div key={`${logIndex}-${field}`} className="bg-gray-800/50 rounded p-3 space-y-1 mb-2">
                                    <div className="font-medium text-white text-sm">
                                      {formatFieldName(field, anio)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-400">Anterior: </span>
                                        <span className="text-red-400">
                                          {formatValue(log.old_values?.[field])}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Nuevo: </span>
                                        <span className="text-green-400">
                                          {formatValue(log.new_values?.[field])}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {group.action === 'created' && (
                    <div className="mt-3 text-sm text-gray-400">
                      <p>✨ Reporte de RIB EEFF creado inicialmente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Total de operaciones: {groupedLogs.length}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLogs}
              className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RibEeffAuditLogViewer;
