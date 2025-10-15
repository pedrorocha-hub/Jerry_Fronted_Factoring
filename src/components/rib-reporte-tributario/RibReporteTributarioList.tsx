import React from 'react';
import { Building2, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RibReporteTributarioSummary } from '@/services/ribReporteTributarioService';

interface RibReporteTributarioListProps {
  reports: RibReporteTributarioSummary[];
  onSelectReport: (id: string) => void;
  onDeleteReport?: (id: string) => void;
}

const RibReporteTributarioList: React.FC<RibReporteTributarioListProps> = ({ 
  reports, 
  onSelectReport,
  onDeleteReport 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Borrador':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteReport) {
      onDeleteReport(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectReport(id);
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">No hay reportes RIB guardados</h3>
        <p className="text-sm">Crea un nuevo reporte para empezar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <div 
          key={report.id}
          className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-[#00FF80]/50 transition-all duration-200 hover:bg-gray-900/70"
        >
          <div className="flex items-center justify-between">
            {/* Información principal */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Empresa */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-[#00FF80] mr-2" />
                  <span className="text-xs text-gray-400 font-medium">EMPRESA</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm leading-tight" title={report.nombre_empresa}>
                    {report.nombre_empresa || 'Empresa sin nombre'}
                  </p>
                  <p className="text-gray-400 text-xs font-mono mt-1">
                    RUC: {report.ruc}
                  </p>
                </div>
              </div>

              {/* Ejecutivo */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-xs text-gray-400 font-medium">EJECUTIVO</span>
                </div>
                <p className="text-white text-sm">
                  {report.creator_name || 'No asignado'}
                </p>
              </div>

              {/* Fecha */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-xs text-gray-400 font-medium">FECHA</span>
                </div>
                <p className="text-white text-sm">
                  {formatDate(report.updated_at)}
                </p>
              </div>

              {/* Estado */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 font-medium">ESTADO</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getStatusColor(report.status)} w-fit`}
                >
                  {report.status}
                </Badge>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => handleEdit(e, report.id)}
                className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              
              {onDeleteReport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleDelete(e, report.id)}
                  className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RibReporteTributarioList;