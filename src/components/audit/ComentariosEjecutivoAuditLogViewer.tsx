import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  History, 
  User, 
  Calendar, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ComentariosEjecutivoAuditLogService } from '@/services/comentariosEjecutivoAuditLogService';
import { ComentariosEjecutivoAuditLogWithUserInfo } from '@/types/comentarios-ejecutivo-audit-log';
import { showError } from '@/utils/toast';

interface ComentariosEjecutivoAuditLogViewerProps {
  comentarioId?: string;
  solicitudId?: string;
  ribId?: string;
  className?: string;
}

const ComentariosEjecutivoAuditLogViewer: React.FC<ComentariosEjecutivoAuditLogViewerProps> = ({
  comentarioId,
  solicitudId,
  ribId,
  className = ''
}) => {
  const [logs, setLogs] = useState<ComentariosEjecutivoAuditLogWithUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLogs();
  }, [comentarioId, solicitudId, ribId]);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let logsData: ComentariosEjecutivoAuditLogWithUserInfo[] = [];
      
      if (comentarioId) {
        logsData = await ComentariosEjecutivoAuditLogService.getLogsByComentarioId(comentarioId);
      } else if (solicitudId) {
        logsData = await ComentariosEjecutivoAuditLogService.getLogsBySolicitudId(solicitudId);
      } else if (ribId) {
        logsData = await ComentariosEjecutivoAuditLogService.getLogsByRibId(ribId);
      }
      
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Error al cargar el historial de cambios');
      showError('Error al cargar el historial de cambios');
    } finally {
      setLoading(false);
    }
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-400" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-400" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-400" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'updated':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'deleted':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Creado';
      case 'updated':
        return 'Actualizado';
      case 'deleted':
        return 'Eliminado';
      default:
        return action;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Lima'
    });
  };

  const renderFieldChanges = (log: ComentariosEjecutivoAuditLogWithUserInfo) => {
    if (!log.changed_fields || Object.keys(log.changed_fields).length === 0) {
      return null;
    }

    return (
      <div className="mt-3 space-y-2">
        <h4 className="text-sm font-semibold text-gray-300">Campos modificados:</h4>
        {Object.entries(log.changed_fields).map(([field, changed]) => {
          if (!changed) return null;
          
          const fieldLabels: Record<string, string> = {
            'comentario': 'Comentario',
            'archivos_adjuntos': 'Archivos adjuntos',
            'rib_id': 'RIB ID',
            'solicitud_id': 'Solicitud ID'
          };

          return (
            <div key={field} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="text-sm font-medium text-gray-300 mb-2">
                {fieldLabels[field] || field}
              </div>
              
              {log.old_values?.[field] && (
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-1">Valor anterior:</div>
                  <div className="text-sm text-red-300 bg-red-500/10 p-2 rounded border-l-2 border-red-500">
                    {field === 'archivos_adjuntos' 
                      ? JSON.stringify(log.old_values[field])
                      : String(log.old_values[field])
                    }
                  </div>
                </div>
              )}
              
              {log.new_values?.[field] && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Valor nuevo:</div>
                  <div className="text-sm text-green-300 bg-green-500/10 p-2 rounded border-l-2 border-green-500">
                    {field === 'archivos_adjuntos' 
                      ? JSON.stringify(log.new_values[field])
                      : String(log.new_values[field])
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={`bg-[#121212] border border-gray-800 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#00FF80]" />
            <span className="ml-2 text-gray-300">Cargando historial...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-[#121212] border border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <History className="h-5 w-5 mr-2 text-[#00FF80]" />
          Historial de Cambios
          {logs.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-gray-500/20 text-gray-400">
              {logs.length} cambio{logs.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No hay historial de cambios disponible</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleLogExpansion(log.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getActionIcon(log.action)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-white">
                            {getActionLabel(log.action)}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getActionColor(log.action)}`}
                          >
                            {log.action}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <User className="h-3 w-3 mr-1" />
                          <span>
                            {log.user_full_name || log.user_email || 'Usuario desconocido'}
                          </span>
                          <Calendar className="h-3 w-3 ml-3 mr-1" />
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {Object.keys(log.changed_fields).length} campo{Object.keys(log.changed_fields).length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      {expandedLogs.has(log.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedLogs.has(log.id) && (
                  <div className="border-t border-gray-700 p-4 bg-gray-900/30">
                    {renderFieldChanges(log)}
                    
                    {log.new_values && log.action === 'created' && (
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Datos iniciales:</h4>
                        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                          <div className="text-sm text-gray-300">
                            <div><strong>Comentario:</strong> {log.new_values.comentario || 'N/A'}</div>
                            <div><strong>Archivos:</strong> {log.new_values.archivos_adjuntos?.length || 0} archivo(s)</div>
                            {log.new_values.rib_id && <div><strong>RIB ID:</strong> {log.new_values.rib_id}</div>}
                            {log.new_values.solicitud_id && <div><strong>Solicitud ID:</strong> {log.new_values.solicitud_id}</div>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComentariosEjecutivoAuditLogViewer;
