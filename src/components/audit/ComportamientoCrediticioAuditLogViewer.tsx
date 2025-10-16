import React, { useState, useEffect } from 'react';
import { History, User, Calendar, FileEdit, AlertCircle, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ComportamientoCrediticioAuditLogService } from '@/services/comportamientoCrediticioAuditLogService';
import { ComportamientoCrediticioAuditLogWithUserInfo, ComportamientoCrediticioAuditAction } from '@/types/comportamiento-crediticio-audit-log';
import { Loader2 } from 'lucide-react';

interface ComportamientoCrediticioAuditLogViewerProps {
  reportId: string;
}

const ComportamientoCrediticioAuditLogViewer: React.FC<ComportamientoCrediticioAuditLogViewerProps> = ({ reportId }) => {
  const [logs, setLogs] = useState<ComportamientoCrediticioAuditLogWithUserInfo[]>([]);
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
      const data = await ComportamientoCrediticioAuditLogService.getLogsByReportId(reportId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading Comportamiento Crediticio audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: ComportamientoCrediticioAuditAction) => {
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

  const getActionLabel = (action: ComportamientoCrediticioAuditAction) => {
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

  const getActionBadgeColor = (action: ComportamientoCrediticioAuditAction) => {
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

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      // Proveedor
      proveedor: 'Proveedor',
      equifax_score: 'Score Equifax (Proveedor)',
      sentinel_score: 'Score Sentinel (Proveedor)',
      equifax_calificacion: 'Calificación Equifax (Proveedor)',
      sentinel_calificacion: 'Calificación Sentinel (Proveedor)',
      equifax_deuda_directa: 'Deuda Directa Equifax (Proveedor)',
      sentinel_deuda_directa: 'Deuda Directa Sentinel (Proveedor)',
      equifax_deuda_indirecta: 'Deuda Indirecta Equifax (Proveedor)',
      sentinel_deuda_indirecta: 'Deuda Indirecta Sentinel (Proveedor)',
      equifax_impagos: 'Impagos Equifax (Proveedor)',
      sentinel_impagos: 'Impagos Sentinel (Proveedor)',
      equifax_deuda_sunat: 'Deuda SUNAT Equifax (Proveedor)',
      sentinel_deuda_sunat: 'Deuda SUNAT Sentinel (Proveedor)',
      equifax_protestos: 'Protestos Equifax (Proveedor)',
      sentinel_protestos: 'Protestos Sentinel (Proveedor)',
      apefac_descripcion: 'Descripción Apefac (Proveedor)',
      comentarios: 'Comentarios (Proveedor)',
      
      // Deudor
      deudor: 'Deudor',
      deudor_equifax_score: 'Score Equifax (Deudor)',
      deudor_sentinel_score: 'Score Sentinel (Deudor)',
      deudor_equifax_calificacion: 'Calificación Equifax (Deudor)',
      deudor_sentinel_calificacion: 'Calificación Sentinel (Deudor)',
      deudor_equifax_deuda_directa: 'Deuda Directa Equifax (Deudor)',
      deudor_sentinel_deuda_directa: 'Deuda Directa Sentinel (Deudor)',
      deudor_equifax_deuda_indirecta: 'Deuda Indirecta Equifax (Deudor)',
      deudor_sentinel_deuda_indirecta: 'Deuda Indirecta Sentinel (Deudor)',
      deudor_equifax_impagos: 'Impagos Equifax (Deudor)',
      deudor_sentinel_impagos: 'Impagos Sentinel (Deudor)',
      deudor_equifax_deuda_sunat: 'Deuda SUNAT Equifax (Deudor)',
      deudor_sentinel_deuda_sunat: 'Deuda SUNAT Sentinel (Deudor)',
      deudor_equifax_protestos: 'Protestos Equifax (Deudor)',
      deudor_sentinel_protestos: 'Protestos Sentinel (Deudor)',
      deudor_apefac_descripcion: 'Descripción Apefac (Deudor)',
      deudor_comentarios: 'Comentarios (Deudor)',
      
      // Gestión
      status: 'Estado',
      validado_por: 'Validado Por',
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
            Historial de Auditoría - Comportamiento Crediticio
          </DialogTitle>
          <p className="text-gray-400 text-sm">
            Registro completo de todos los cambios realizados en este reporte
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
                      <div>
                        <Badge className={getActionBadgeColor(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString('es-PE', {
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
                      {log.user_full_name || log.user_email || 'Usuario desconocido'}
                    </span>
                  </div>

                  {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                    <>
                      <Separator className="my-3 bg-gray-800" />
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase">
                          Campos Modificados:
                        </h4>
                        {Object.keys(log.changed_fields).map((field) => (
                          <div key={field} className="bg-gray-800/50 rounded p-3 space-y-1">
                            <div className="font-medium text-white text-sm">
                              {formatFieldName(field)}
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
                    </>
                  )}

                  {log.action === 'created' && (
                    <div className="mt-3 text-sm text-gray-400">
                      <p>✨ Reporte de Comportamiento Crediticio creado inicialmente</p>
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
              <span>Total de cambios: {logs.length}</span>
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

export default ComportamientoCrediticioAuditLogViewer;