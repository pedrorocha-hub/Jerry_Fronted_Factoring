import React, { useState, useEffect } from 'react';
import { History, User, Calendar, FileEdit, AlertCircle, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RibReporteTributarioAuditLogService } from '@/services/ribReporteTributarioAuditLogService';
import { RibReporteTributarioAuditLogWithUserInfo, RibReporteTributarioAuditAction } from '@/types/rib-reporte-tributario-audit-log';
import { Loader2 } from 'lucide-react';

interface RibReporteTributarioAuditLogViewerProps {
  reportId: string;
}

const RibReporteTributarioAuditLogViewer: React.FC<RibReporteTributarioAuditLogViewerProps> = ({ reportId }) => {
  const [logs, setLogs] = useState<RibReporteTributarioAuditLogWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, reportId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await RibReporteTributarioAuditLogService.getLogsByReportId(reportId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading RIB Reporte Tributario audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: RibReporteTributarioAuditAction) => {
    switch (action) {
      case 'created': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'updated': return <FileEdit className="h-4 w-4 text-blue-400" />;
      case 'status_changed': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'deleted': return <Trash2 className="h-4 w-4 text-red-400" />;
      default: return <FileEdit className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionLabel = (action: RibReporteTributarioAuditAction) => {
    const labels: Record<RibReporteTributarioAuditAction, string> = {
      created: 'Creado',
      updated: 'Actualizado',
      status_changed: 'Estado Cambiado',
      deleted: 'Eliminado',
    };
    return labels[action] || action;
  };

  const getActionBadgeColor = (action: RibReporteTributarioAuditAction) => {
    const colors: Record<RibReporteTributarioAuditAction, string> = {
      created: 'bg-green-500/20 text-green-400 border-green-500/30',
      updated: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      status_changed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      deleted: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      ruc: 'RUC',
      proveedor_ruc: 'RUC Proveedor',
      anio: 'Año',
      tipo_entidad: 'Tipo de Entidad',
      cuentas_por_cobrar_giro: 'Cuentas por Cobrar (Giro)',
      total_activos: 'Total Activos',
      cuentas_por_pagar_giro: 'Cuentas por Pagar (Giro)',
      total_pasivos: 'Total Pasivos',
      capital_pagado: 'Capital Pagado',
      total_patrimonio: 'Total Patrimonio',
      total_pasivo_patrimonio: 'Total Pasivo + Patrimonio',
      ingreso_ventas: 'Ingreso por Ventas',
      utilidad_bruta: 'Utilidad Bruta',
      utilidad_antes_impuesto: 'Utilidad antes de Impuesto',
      solvencia: 'Solvencia',
      gestion: 'Gestión',
      status: 'Estado',
      solicitud_id: 'Solicitud Asociada',
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
            Historial de Auditoría - RIB Reporte Tributario
          </DialogTitle>
          <p className="text-gray-400 text-sm">
            Registro de cambios para este reporte.
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay cambios registrados para este reporte.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="bg-gray-900/50 border-gray-800">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getActionIcon(log.action)}
                      <Badge className={getActionBadgeColor(log.action)}>{getActionLabel(log.action)}</Badge>
                    </div>
                    <div className="text-right text-sm text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.created_at).toLocaleString('es-PE')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{log.user_full_name || log.user_email || 'Usuario desconocido'}</span>
                  </div>
                  {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                    <>
                      <Separator className="my-3 bg-gray-800" />
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase">Campos Modificados:</h4>
                        {log.changed_fields.aggregated ? (
                          <div className="bg-gray-800/50 rounded p-3 space-y-1">
                            <div className="font-medium text-white text-sm">
                              Múltiples campos actualizados
                            </div>
                            <div className="text-xs text-gray-400">
                              El formulario completo fue guardado en una sola acción.
                            </div>
                          </div>
                        ) : (
                          Object.keys(log.changed_fields).map((field) => (
                            <div key={field} className="bg-gray-800/50 rounded p-3 space-y-1">
                              <div className="font-medium text-white text-sm">{formatFieldName(field)}</div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div><span className="text-gray-400">Anterior: </span><span className="text-red-400">{formatValue(log.old_values?.[field])}</span></div>
                                <div><span className="text-gray-400">Nuevo: </span><span className="text-green-400">{formatValue(log.new_values?.[field])}</span></div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                  {log.action === 'created' && <div className="mt-3 text-sm text-gray-400"><p>✨ Reporte creado inicialmente</p></div>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>Total de cambios: {logs.length}</span></div>
          <Button variant="ghost" size="sm" onClick={loadLogs} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">Actualizar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RibReporteTributarioAuditLogViewer;