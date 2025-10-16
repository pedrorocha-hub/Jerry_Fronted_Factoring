import React, { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RibReporteTributarioAuditLog, RibReporteTributarioAuditLogService } from '@/services/ribReporteTributarioAuditLogService';

interface RibReporteTributarioAuditLogViewerProps {
  reportId: string;
}

const fieldLabels: Record<string, string> = {
  ruc: 'RUC',
  proveedor_ruc: 'RUC Proveedor',
  anio: 'Año',
  tipo_entidad: 'Tipo de Entidad',
  cuentas_por_cobrar_giro: 'Cuentas por Cobrar del Giro',
  total_activos: 'Total Activos',
  cuentas_por_pagar_giro: 'Cuentas por Pagar del Giro',
  total_pasivos: 'Total Pasivos',
  capital_pagado: 'Capital Pagado',
  total_patrimonio: 'Total Patrimonio',
  total_pasivo_patrimonio: 'Total Pasivo y Patrimonio',
  ingreso_ventas: 'Ingreso por Ventas',
  utilidad_bruta: 'Utilidad Bruta',
  utilidad_antes_impuesto: 'Utilidad Antes de Impuestos',
  solvencia: 'Solvencia',
  gestion: 'Gestión',
  status: 'Estado',
  solicitud_id: 'Solicitud de Operación',
};

const getActionBadge = (action: string) => {
  switch (action) {
    case 'created':
      return <Badge className="bg-green-500/20 text-green-400">Creado</Badge>;
    case 'updated':
      return <Badge className="bg-blue-500/20 text-blue-400">Actualizado</Badge>;
    case 'status_changed':
      return <Badge className="bg-yellow-500/20 text-yellow-400">Cambio de Estado</Badge>;
    case 'deleted':
      return <Badge className="bg-red-500/20 text-red-400">Eliminado</Badge>;
    default:
      return <Badge className="bg-gray-500/20 text-gray-400">{action}</Badge>;
  }
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return value.toLocaleString('es-PE');
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const RibReporteTributarioAuditLogViewer: React.FC<RibReporteTributarioAuditLogViewerProps> = ({ reportId }) => {
  const [logs, setLogs] = useState<RibReporteTributarioAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLogs();
  }, [reportId]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await RibReporteTributarioAuditLogService.getLogsByReportId(reportId);
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

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-400">
        Cargando historial de auditoría...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        No hay registros de auditoría disponibles.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
      >
        <History className="h-4 w-4 mr-2" />
        {isExpanded ? 'Ocultar' : 'Ver'} Historial de Auditoría ({logs.length} registros)
        {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
      </Button>

      {isExpanded && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Historial de Cambios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border border-gray-800 rounded-lg p-4 bg-black/30 hover:bg-black/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleString('es-PE')}
                    </span>
                  </div>
                  {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLogExpansion(log.id)}
                      className="text-gray-400 hover:text-white h-6 px-2"
                    >
                      {expandedLogs.has(log.id) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <User className="h-3 w-3" />
                  <span>{log.user_email || 'Sistema'}</span>
                </div>

                {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                  <div className="text-xs text-gray-400 mb-2">
                    Campos modificados: {Object.keys(log.changed_fields).length}
                  </div>
                )}

                {expandedLogs.has(log.id) && log.changed_fields && (
                  <div className="mt-3 space-y-2 border-t border-gray-800 pt-3">
                    {Object.keys(log.changed_fields).map((field) => (
                      <div key={field} className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-gray-400 font-medium">
                          {fieldLabels[field] || field}:
                        </div>
                        <div className="text-red-400">
                          {formatValue(log.old_values?.[field])}
                        </div>
                        <div className="text-green-400">
                          → {formatValue(log.new_values?.[field])}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RibReporteTributarioAuditLogViewer;