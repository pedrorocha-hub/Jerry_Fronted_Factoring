import React from 'react';
import { Save, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RibReporteTributario } from '@/services/ribReporteTributarioService';

interface ReporteStatusManagerProps {
  report: RibReporteTributario;
  creatorName: string | null;
  onStatusChange: (status: 'Borrador' | 'En revisión' | 'Completado') => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const ReporteStatusManager: React.FC<ReporteStatusManagerProps> = ({
  report,
  creatorName,
  onStatusChange,
  onSave,
  isSaving,
  hasUnsavedChanges
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completado':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'En revisión':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Estado del Reporte</span>
          <Badge className={getStatusColor(report.status || 'Borrador')}>
            {getStatusIcon(report.status || 'Borrador')}
            <span className="ml-2">{report.status || 'Borrador'}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Cambiar Estado</label>
            <Select
              value={report.status || 'Borrador'}
              onValueChange={(value: 'Borrador' | 'En revisión' | 'Completado') => onStatusChange(value)}
            >
              <SelectTrigger className="bg-gray-900/50 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Borrador">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    Borrador
                  </div>
                </SelectItem>
                <SelectItem value="En revisión">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-yellow-400" />
                    En revisión
                  </div>
                </SelectItem>
                <SelectItem value="Completado">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                    Completado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Información</label>
            <div className="space-y-1 text-sm text-gray-400">
              {creatorName && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>Creado por: {creatorName}</span>
                </div>
              )}
              {report.created_at && (
                <div>Creado: {formatDate(report.created_at)}</div>
              )}
              {report.updated_at && (
                <div>Actualizado: {formatDate(report.updated_at)}</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            {hasUnsavedChanges && (
              <span className="text-yellow-400">• Hay cambios sin guardar</span>
            )}
          </div>
          
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
          >
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Reporte
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReporteStatusManager;