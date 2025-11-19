import React, { useState, useEffect, useMemo } from 'react';
import { History, User, Calendar, FileEdit, AlertCircle, CheckCircle, Trash2, Clock, Filter, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// Tipos genéricos
export interface BaseAuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_full_name?: string;
  action: string;
  changed_fields: Record<string, boolean> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
}

export interface GroupedLog<T extends BaseAuditLog = BaseAuditLog> {
  id: string;
  action: string;
  user_full_name?: string;
  user_email: string | null;
  created_at: string;
  logs: T[];
}

interface BaseAuditLogViewerProps<T extends BaseAuditLog> {
  // Función para cargar los logs
  loadLogs: () => Promise<T[]>;
  
  // Trigger personalizado (opcional)
  trigger?: React.ReactNode;
  
  // Título del modal
  title: string;
  
  // Descripción del modal (opcional)
  description?: string;
  
  // Si true, agrupa logs por operación (mismo usuario, acción y tiempo)
  groupLogs?: boolean;
  
  // Tiempo en ms para considerar logs como parte de la misma operación (default 5000)
  groupingTimeWindow?: number;
  
  // Función para formatear nombres de campos
  formatFieldName?: (field: string, log?: T) => string;
  
  // Función para formatear valores
  formatValue?: (value: any, fieldName?: string, log?: T) => string;
  
  // Función para filtrar campos que no se deben mostrar
  shouldShowField?: (field: string, log?: T) => boolean;
  
  // Mapeo de acciones a labels (opcional, usa defaults si no se provee)
  actionLabels?: Record<string, string>;
  
  // Mapeo de acciones a colores (opcional, usa defaults si no se provee)
  actionColors?: Record<string, string>;
  
  // Mensaje cuando se crea un registro
  getCreatedMessage?: (log: T) => string;
  
  // Mensaje cuando se elimina un registro
  getDeletedMessage?: (log: T) => string;
  
  // Iconos adicionales para acciones personalizadas
  customActionIcons?: Record<string, React.ReactNode>;
  
  // Función para renderizar badges adicionales personalizados
  renderAdditionalBadges?: (log: T) => React.ReactNode;
  
  // Props del componente trigger
  triggerClassName?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost' | 'link';
  triggerSize?: 'default' | 'sm' | 'lg' | 'icon';
}

function BaseAuditLogViewer<T extends BaseAuditLog>({
  loadLogs,
  trigger,
  title,
  description,
  groupLogs = false,
  groupingTimeWindow = 5000,
  formatFieldName,
  formatValue,
  shouldShowField,
  actionLabels,
  actionColors,
  getCreatedMessage,
  getDeletedMessage,
  customActionIcons,
  renderAdditionalBadges,
  triggerClassName,
  triggerVariant = 'outline',
  triggerSize = 'default',
}: BaseAuditLogViewerProps<T>) {
  const [logs, setLogs] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Estados de filtros
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await loadLogs();
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filtro por fecha desde
      if (dateFrom) {
        const logDate = new Date(log.created_at);
        const fromDate = new Date(dateFrom);
        if (logDate < fromDate) return false;
      }
      
      // Filtro por fecha hasta
      if (dateTo) {
        const logDate = new Date(log.created_at);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Incluir todo el día
        if (logDate > toDate) return false;
      }
      
      // Filtro por acción
      if (actionFilter !== 'all' && log.action !== actionFilter) {
        return false;
      }
      
      // Filtro por usuario
      if (userFilter) {
        const searchTerm = userFilter.toLowerCase();
        const fullName = log.user_full_name?.toLowerCase() || '';
        const email = log.user_email?.toLowerCase() || '';
        if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  }, [logs, dateFrom, dateTo, actionFilter, userFilter]);

  // Agrupar logs si es necesario
  const displayLogs = useMemo(() => {
    if (!groupLogs) {
      return filteredLogs.map(log => ({
        id: log.id,
        action: log.action,
        user_full_name: log.user_full_name,
        user_email: log.user_email,
        created_at: log.created_at,
        logs: [log],
      })) as GroupedLog<T>[];
    }

    const groups: GroupedLog<T>[] = [];
    
    filteredLogs.forEach((log) => {
      const existingGroup = groups.find((group) => {
        const timeDiff = Math.abs(
          new Date(group.created_at).getTime() - new Date(log.created_at).getTime()
        );
        return (
          timeDiff < groupingTimeWindow &&
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

    return groups;
  }, [filteredLogs, groupLogs, groupingTimeWindow]);

  // Obtener acciones únicas para el filtro
  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map(log => log.action)));
  }, [logs]);

  const getActionIcon = (action: string) => {
    if (customActionIcons && customActionIcons[action]) {
      return customActionIcons[action];
    }
    
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

  const getActionLabel = (action: string) => {
    if (actionLabels && actionLabels[action]) {
      return actionLabels[action];
    }
    
    const defaultLabels: Record<string, string> = {
      created: 'Creado',
      updated: 'Actualizado',
      status_changed: 'Estado Cambiado',
      deleted: 'Eliminado',
    };
    
    return defaultLabels[action] || action;
  };

  const getActionBadgeColor = (action: string) => {
    if (actionColors && actionColors[action]) {
      return actionColors[action];
    }
    
    const defaultColors: Record<string, string> = {
      created: 'bg-green-500/20 text-green-400 border-green-500/30',
      updated: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      status_changed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      deleted: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    
    return defaultColors[action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const defaultFormatFieldName = (field: string): string => {
    return field.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const defaultFormatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const defaultShouldShowField = (field: string): boolean => {
    return true;
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setActionFilter('all');
    setUserFilter('');
  };

  const hasActiveFilters = dateFrom || dateTo || actionFilter !== 'all' || userFilter;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant={triggerVariant} 
            size={triggerSize}
            className={triggerClassName || "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"}
          >
            <History className="h-4 w-4 mr-2" />
            Ver Historial de Cambios
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#121212] border-gray-800 text-white max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <History className="h-6 w-6 mr-3 text-[#00FF80]" />
            {title}
          </DialogTitle>
          {description && (
            <p className="text-gray-400 text-sm">{description}</p>
          )}
        </DialogHeader>

        {/* Filtros */}
        <div className="border-b border-gray-800 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-400 hover:text-white w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge className="bg-[#00FF80]/20 text-[#00FF80] border-[#00FF80]/30">
                  {[dateFrom, dateTo, actionFilter !== 'all', userFilter].filter(Boolean).length}
                </Badge>
              )}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </Button>
          
          {showFilters && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Desde</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Hasta</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white text-sm"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Acción</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white text-sm">
                    <SelectValue placeholder="Todas las acciones" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-gray-800">
                    <SelectItem value="all" className="text-white hover:bg-gray-800">
                      Todas las acciones
                    </SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem 
                        key={action} 
                        value={action}
                        className="text-white hover:bg-gray-800"
                      >
                        {getActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-gray-400">Usuario</Label>
                <Input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="bg-gray-900/50 border-gray-700 text-white text-sm placeholder-gray-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
            </div>
          ) : displayLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {hasActiveFilters 
                  ? 'No se encontraron cambios con los filtros aplicados.'
                  : 'No hay cambios registrados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayLogs.map((group) => (
                <Card key={group.id} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getActionIcon(group.action)}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getActionBadgeColor(group.action)}>
                            {getActionLabel(group.action)}
                          </Badge>
                          {renderAdditionalBadges && renderAdditionalBadges(group.logs[0])}
                          {group.logs.length > 1 && (
                            <span className="ml-2 text-xs text-gray-400">
                              ({group.logs.length} registros)
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
                            
                            return (
                              <div key={logIndex}>
                                {Object.keys(log.changed_fields)
                                  .filter(field => shouldShowField ? shouldShowField(field, log) : defaultShouldShowField(field))
                                  .map((field) => (
                                    <div key={`${logIndex}-${field}`} className="bg-gray-800/50 rounded p-3 space-y-1 mb-2">
                                      <div className="font-medium text-white text-sm">
                                        {formatFieldName ? formatFieldName(field, log) : defaultFormatFieldName(field)}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <span className="text-gray-400">Anterior: </span>
                                          <span className="text-red-400">
                                            {formatValue 
                                              ? formatValue(log.old_values?.[field], field, log) 
                                              : defaultFormatValue(log.old_values?.[field])}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-gray-400">Nuevo: </span>
                                          <span className="text-green-400">
                                            {formatValue 
                                              ? formatValue(log.new_values?.[field], field, log) 
                                              : defaultFormatValue(log.new_values?.[field])}
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

                    {group.action === 'created' && getCreatedMessage && (
                      <div className="mt-3 text-sm text-gray-400">
                        <p>{getCreatedMessage(group.logs[0])}</p>
                      </div>
                    )}
                    
                    {group.action === 'deleted' && getDeletedMessage && (
                      <div className="mt-3 text-sm text-red-400">
                        <p>{getDeletedMessage(group.logs[0])}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {groupLogs 
                  ? `Total de operaciones: ${displayLogs.length}`
                  : `Total de cambios: ${displayLogs.length}`}
              </span>
              {hasActiveFilters && filteredLogs.length !== logs.length && (
                <span className="text-xs text-gray-500">
                  (filtrados de {logs.length})
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10"
            >
              Actualizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BaseAuditLogViewer;

