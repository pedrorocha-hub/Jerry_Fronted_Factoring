import React from 'react';
import { Building2, User, Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RibReporteTributarioSummary } from '@/services/ribReporteTributarioService';

interface RibReporteTributarioListProps {
  reports: RibReporteTributarioSummary[];
  onSelectReport: (ruc: string) => void;
}

const RibReporteTributarioList: React.FC<RibReporteTributarioListProps> = ({ 
  reports, 
  onSelectReport 
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

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-medium mb-2">No hay reportes RIB guardados</h3>
        <p className="text-sm">Busca una empresa por RUC para crear su reporte tributario</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => (
        <Card 
          key={report.ruc}
          className="bg-gray-900/50 border border-gray-700 hover:border-[#00FF80]/50 transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-[#00FF80]/10"
          onClick={() => onSelectReport(report.ruc)}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header con empresa y estado */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <Building2 className="h-5 w-5 text-[#00FF80] mr-2 flex-shrink-0" />
                    <h3 className="font-semibold text-white text-sm leading-tight">
                      Empresa
                    </h3>
                  </div>
                  <p className="text-white font-medium text-base mb-1 truncate" title={report.nombre_empresa}>
                    {report.nombre_empresa || 'Empresa sin nombre'}
                  </p>
                  <p className="text-gray-400 text-sm font-mono">
                    RUC: {report.ruc}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-2 text-xs font-medium ${getStatusColor(report.status)} flex-shrink-0`}
                >
                  {report.status}
                </Badge>
              </div>

              {/* Ejecutivo */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-gray-300 text-sm font-medium">Ejecutivo</span>
                </div>
                <p className="text-white text-sm ml-6">
                  {report.creator_name || 'No asignado'}
                </p>
              </div>

              {/* Fecha de actualización */}
              <div className="space-y-1">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-gray-300 text-sm font-medium">Última actualización</span>
                </div>
                <p className="text-white text-sm ml-6">
                  {formatDate(report.updated_at)}
                </p>
              </div>

              {/* Footer con indicador de acción */}
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Click para editar</span>
                  <Clock className="h-3 w-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RibReporteTributarioList;