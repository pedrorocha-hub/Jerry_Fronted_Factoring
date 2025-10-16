import React, { useState, useEffect } from 'react';
import { History, User, Calendar, FileEdit, AlertCircle, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RibEeffAuditLogService } from '@/services/ribEeffAuditLogService';
import { RibEeffAuditLogWithUserInfo, RibEeffAuditAction } from '@/types/rib-eeff-audit-log';
import { Loader2 } from 'lucide-react';

interface RibEeffAuditLogViewerProps {
  reportId: string;
}

const RibEeffAuditLogViewer: React.FC<RibEeffAuditLogViewerProps> = ({ reportId }) => {
  const [logs, setLogs] = useState<RibEeffAuditLogWithUserInfo[]>([]);
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
      const data = await RibEeffAuditLogService.getLogsByReportId(reportId);
      setLogs(data);
    } catch (error) {
      console.error('Error loading RIB EEFF audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: RibEeffAuditAction) => {
    switch (action) {
      case 'created': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'updated': return <FileEdit className="h-4 w-4 text-blue-400" />;
      case 'status_changed': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'deleted': return <Trash2 className="h-4 w-4 text-red-400" />;
      default: return <FileEdit className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionLabel = (action: RibEeffAuditAction) => {
    const labels: Record<RibEeffAuditAction, string> = {
      created: 'Creado',
      updated: 'Actualizado',
      status_changed: 'Estado Cambiado',
      deleted: 'Eliminado',
    };
    return labels[action] || action;
  };

  const getActionBadgeColor = (action: RibEeffAuditAction) => {
    const colors: Record<RibEeffAuditAction, string> = {
      created: 'bg-green-500/20 text-green-400 border-green-500/30',
      updated: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      status_changed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      deleted: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      activo_caja_inversiones_disponible: "Caja e Inversiones Disponibles",
      activo_cuentas_por_cobrar_del_giro: "Cuentas por Cobrar del Giro",
      activo_cuentas_por_cobrar_relacionadas_no_comerciales: "Cuentas por Cobrar Relacionadas (No Comerciales)",
      activo_cuentas_por_cobrar_personal_accionistas_directores: "Cuentas por Cobrar (Personal, Accionistas, Directores)",
      activo_otras_cuentas_por_cobrar_diversas: "Otras Cuentas por Cobrar Diversas",
      activo_existencias: "Existencias",
      activo_gastos_pagados_por_anticipado: "Gastos Pagados por Anticipado",
      activo_otros_activos_corrientes: "Otros Activos Corrientes",
      activo_total_activo_circulante: "Total Activo Circulante",
      activo_cuentas_por_cobrar_comerciales_lp: "Cuentas por Cobrar Comerciales (Largo Plazo)",
      activo_otras_cuentas_por_cobrar_diversas_lp: "Otras Cuentas por Cobrar Diversas (Largo Plazo)",
      activo_activo_fijo_neto: "Activo Fijo Neto",
      activo_inversiones_en_valores: "Inversiones en Valores",
      activo_intangibles: "Intangibles",
      activo_activo_diferido_y_otros: "Activo Diferido y Otros",
      activo_total_activos_no_circulantes: "Total Activos no Circulantes",
      activo_total_activos: "Total Activos",
      pasivo_sobregiro_bancos_y_obligaciones_corto_plazo: "Sobregiro Bancos y Obligaciones (Corto Plazo)",
      pasivo_parte_corriente_obligaciones_bancos_y_leasing: "Parte Corriente Obligaciones Bancos y Leasing",
      pasivo_cuentas_por_pagar_del_giro: "Cuentas por Pagar del Giro",
      pasivo_cuentas_por_pagar_relacionadas_no_comerciales: "Cuentas por Pagar Relacionadas (No Comerciales)",
      pasivo_otras_cuentas_por_pagar_diversas: "Otras Cuentas por Pagar Diversas",
      pasivo_dividendos_por_pagar: "Dividendos por Pagar",
      pasivo_total_pasivos_circulantes: "Total Pasivos Circulantes",
      pasivo_parte_no_corriente_obligaciones_bancos_y_leasing: "Parte no Corriente Obligaciones Bancos y Leasing",
      pasivo_cuentas_por_pagar_comerciales_lp: "Cuentas por Pagar Comerciales (Largo Plazo)",
      pasivo_otras_cuentas_por_pagar_diversas_lp: "Otras Cuentas por Pagar Diversas (Largo Plazo)",
      pasivo_otros_pasivos: "Otros Pasivos",
      pasivo_total_pasivos_no_circulantes: "Total Pasivos no Circulantes",
      pasivo_total_pasivos: "Total Pasivos",
      patrimonio_neto_capital_pagado: "Capital Pagado",
      patrimonio_neto_capital_adicional: "Capital Adicional",
      patrimonio_neto_excedente_de_revaluacion: "Excedente de Revaluación",
      patrimonio_neto_reserva_legal: "Reserva Legal",
      patrimonio_neto_utilidad_perdida_acumulada: "Utilidad/Pérdida Acumulada",
      patrimonio_neto_utilidad_perdida_del_ejercicio: "Utilidad/Pérdida del Ejercicio",
      patrimonio_neto_total_patrimonio: "Total Patrimonio",
      patrimonio_neto_total_pasivos_y_patrimonio: "Total Pasivos y Patrimonio",
      status: 'Estado',
      solicitud_id: 'Solicitud Asociada',
    };
    return fieldNames[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const parseAggregateKey = (key: string): string => {
    const parts = key.split('_');
    if (parts.length === 2) {
      const [year, entityType] = parts;
      const formattedEntityType = entityType.charAt(0).toUpperCase() + entityType.slice(1);
      return `${formattedEntityType} - Año ${year}`;
    }
    return key;
  };

  const renderAggregatedChanges = (log: RibEeffAuditLogWithUserInfo) => {
    const allKeys = [...new Set([...Object.keys(log.old_values || {}), ...Object.keys(log.new_values || {})])];

    return (
      <Accordion type="multiple" className="w-full">
        {allKeys.map(key => {
          const oldData = log.old_values?.[key] || {};
          const newData = log.new_values?.[key] || {};
          const allFields = [...new Set([...Object.keys(oldData), ...Object.keys(newData)])];
          const changedFields = allFields.filter(field => JSON.stringify(oldData[field]) !== JSON.stringify(newData[field]));

          if (changedFields.length === 0) return null;

          return (
            <AccordionItem value={key} key={key} className="border-gray-800">
              <AccordionTrigger className="text-base hover:no-underline bg-gray-800/50 px-4 py-2 rounded-md">
                {parseAggregateKey(key)}
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="space-y-2 p-3">
                  {changedFields.map(field => {
                    if (['id', 'user_id', 'created_at', 'updated_at', 'solicitud_id', 'ruc', 'anio_reporte', 'tipo_entidad'].includes(field)) return null;
                    
                    return (
                      <div key={field} className="bg-gray-800/50 rounded p-3 space-y-1">
                        <div className="font-medium text-white text-sm">{formatFieldName(field)}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-gray-400">Anterior: </span><span className="text-red-400">{formatValue(oldData[field])}</span></div>
                          <div><span className="text-gray-400">Nuevo: </span><span className="text-green-400">{formatValue(newData[field])}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
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
          <p className="text-gray-400 text-sm">Registro de cambios para este reporte.</p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div>
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
                      <Badge className={getActionBadgeColor('updated')}>Actualizado</Badge>
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
                  <Separator className="my-3 bg-gray-800" />
                  <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Detalles del Cambio:</h4>
                  {renderAggregatedChanges(log)}
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

export default RibEeffAuditLogViewer;