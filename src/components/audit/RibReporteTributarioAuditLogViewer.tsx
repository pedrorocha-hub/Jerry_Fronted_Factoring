import React, { useState, useEffect } from 'react';
import { History, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RibReporteTributarioAuditLogService, RibReporteTributarioAuditLog } from '@/services/ribReporteTributarioAuditLogService';
import { showError } from '@/utils/toast';

interface RibReporteTributarioAuditLogViewerProps {
  reporteId: string;
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

const getActionLabel = (action: string) => {
  switch (action) {
    case 'created': return 'Creado';
    case 'updated': return 'Actualizado';
    case 'status_changed': return 'Estado Cambiado';
    case 'deleted': return 'Eliminado';
    default: return action;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'created': return 'text-green-400';
    case 'updated': return 'text-blue-400';
    case 'status_changed': return 'text-yellow-400';
    case 'deleted': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

const RibReporteTributarioAuditLogViewer: React.FC<RibReporteTributarioAuditLogViewerProps> = ({ reporteId }) => {
  const [logs, setLogs] = useState<RibReporteTributarioAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isExpanded && reporteId) {
      loadLogs();
    }
  }, [isExpanded, reporteId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await RibReporteTributarioAuditLogService.getByReporteId(reporteId);
      setLogs(data);
    } catch (err) {
      showError('Error al cargar el historial de auditoría');
      console.error(err);
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
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="w-full">
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        <span className="flex items-center">
          <History className="h-4 w-4 mr-2" />
          Historial de Auditoría
        </span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <Card className="mt-4 bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Registro de Cambios</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-gray-400">Cargando historial...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-4 text-gray-400">No hay cambios registrados</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border border-gray-700 rounded-lg p-3 bg-gray-800/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLogExpansion(log.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {expandedLogs.has(log.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center text-xs text-gray-400 space-x-4">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {log.user_email || 'Sistema'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(log.created_at).toLocaleString('es-PE')}
                      </div>
                    </div>

                    {expandedLogs.has(log.id) && log.changed_fields && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-300 mb-2">Campos modificados:</h4>
                        <div className="space-y-2">
                          {Object.keys(log.changed_fields).map((field) => (
                            <div key={field} className="text-xs">
                              <span className="text-gray-400">{fieldLabels[field] || field}:</span>
                              <div className="ml-4 mt-1">
                                <div className="text-red-400">
                                  Anterior: {formatValue(log.old_values?.[field])}
                                </div>
                                <div className="text-green-400">
                                  Nuevo: {formatValue(log.new_values?.[field])}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RibReporteTributarioAuditLogViewer;