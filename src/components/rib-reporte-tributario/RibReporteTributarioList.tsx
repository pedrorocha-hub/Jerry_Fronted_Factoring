import React from 'react';
import { Building2, Calendar, User, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RibReporteTributarioSummary } from '@/services/ribReporteTributarioService';

interface GroupedReport {
  ruc: string;
  nombre_empresa: string;
  reports: any[];
  last_updated_at: string;
  status: string;
  creator_name: string;
}

interface RibReporteTributarioListProps {
  reports: GroupedReport[];
  onSelectReport: (ruc: string) => void;
}

const RibReporteTributarioList: React.FC<RibReporteTributarioListProps> = ({ 
  reports, 
  onSelectReport,
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
    <div className="space-y-2">
      {reports.map((group) => (
        <div 
          key={group.ruc}
          onClick={() => onSelectReport(group.ruc)}
          className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-[#00FF80]/50 transition-all duration-200 hover:bg-gray-900/70 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-[#00FF80] mr-2" />
                  <span className="text-xs text-gray-400 font-medium">EMPRESA</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm leading-tight" title={group.nombre_empresa}>
                    {group.nombre_empresa || 'Empresa sin nombre'}
                  </p>
                  <p className="text-gray-400 text-xs font-mono mt-1">
                    RUC: {group.ruc}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-400 mr-2" />
                  <span className="text-xs text-gray-400 font-medium">REPORTES</span>
                </div>
                <p className="text-white text-sm font-medium">
                  {group.reports.length} reporte(s)
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Últ. act: {formatDate(group.last_updated_at)}
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 font-medium">ESTADO ÚLTIMO REPORTE</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${getStatusColor(group.status)} w-fit mt-1`}
                >
                  {group.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RibReporteTributarioList;