import React, { useState, useEffect } from 'react';
import { History, User, Calendar, FileEdit, AlertCircle, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuditLogService } from '@/services/auditLogService';
import { AuditLogWithUserInfo, AuditAction } from '@/types/audit-log';
import { Loader2 } from 'lucide-react';

interface AuditLogViewerProps {
  solicitudId: string;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ solicitudId }) => {
  const [logs, setLogs] = useState<AuditLogWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, solicitudId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await AuditLogService.getLogsBySolicitudId(solicitudId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: AuditAction) => {
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

  const getActionLabel = (action: AuditAction) => {
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

  const getActionBadgeColor = (action: AuditAction) => {
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
      ruc: 'RUC',
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
            Historial de Auditoría
          </DialogTitle>
          <p className="text-gray-400 text-sm">
            Registro completo de todos los cambios realizados en este expediente
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay cambios registrados para este expediente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
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
                      <p>✨ Expediente creado inicialmente</p>
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

export default AuditLogViewer;