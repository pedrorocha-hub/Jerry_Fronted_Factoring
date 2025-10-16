import React, { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, Clock, User, FileEdit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RibReporteTributarioAuditLog as AuditLogType, 
  RibReporteTributarioAuditService 
} from '@/services/ribReporteTributarioAuditService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RibReporteTributarioAuditLogProps {
  reporteId: string;
}

const RibReporteTributarioAuditLog: React.FC<RibReporteTributarioAuditLogProps> = ({ reporteId }) => {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAuditLogs();
  }, [reporteId]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await RibReporteTributarioAuditService.getAuditLogs(reporteId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'number') return value.toLocaleString('es-PE');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-gray-400">
            <Clock className="h-5 w-5 mr-2 animate-spin" />
            Cargando historial...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <History className="h-5 w-5 mr-2 text-[#00FF80]" />
            Historial de Cambios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <FileEdit className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay cambios registrados aún</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <History className="h-5 w-5 mr-2 text-[#00FF80]" />
            Historial de Cambios
          </div>
          <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
            {logs.length} {logs.length === 1 ? 'cambio' : 'cambios'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = expandedLogs.has(log.id);
            const hasChangedFields = log.changed_fields && Object.keys(log.changed_fields).length > 0;

            return (
              <div
                key={log.id}
                className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={RibReporteTributarioAuditService.getActionColor(log.action)}
                    >
                      {RibReporteTributarioAuditService.formatAction(log.action)}
                    </Badge>
                    <div className="text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(log.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                      {log.user_email && (
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-3 w-3" />
                          {log.user_email}
                        </div>
                      )}
                    </div>
                  </div>
                  {hasChangedFields && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLogExpansion(log.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Ocultar detalles
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Ver detalles
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {hasChangedFields && isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-gray-800 pt-4">
                    {Object.keys(log.changed_fields!).map((field) => (
                      <div key={field} className="bg-gray-900/50 rounded p-3">
                        <div className="font-medium text-white mb-2">
                          {RibReporteTributarioAuditService.formatFieldName(field)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500 mb-1">Valor anterior:</div>
                            <div className="text-red-400 font-mono">
                              {formatValue(log.old_values?.[field])}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500 mb-1">Valor nuevo:</div>
                            <div className="text-green-400 font-mono">
                              {formatValue(log.new_values?.[field])}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {log.action === 'created' && (
                  <div className="mt-3 text-sm text-gray-400">
                    Reporte creado inicialmente
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RibReporteTributarioAuditLog;