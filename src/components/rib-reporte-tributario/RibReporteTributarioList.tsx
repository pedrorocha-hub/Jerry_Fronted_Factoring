import React from 'react';
import { Building2, Calendar, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RibReporteTributarioSummary } from '@/services/ribReporteTributarioService';

interface RibReporteTributarioListProps {
  reports: RibReporteTributarioSummary[];
  onSelectReport: (ruc: string) => void;
}

const RibReporteTributarioList: React.FC<RibReporteTributarioListProps> = ({ reports, onSelectReport }) => {
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.ruc}
          className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 hover:bg-gray-900/70 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Building2 className="h-5 w-5 text-[#00FF80]" />
                <h3 className="text-white font-medium">{report.nombre_empresa}</h3>
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center space-x-1">
                  <span>RUC:</span>
                  <span className="text-white">{report.ruc}</span>
                </span>
                
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(report.updated_at)}</span>
                </span>
                
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{report.creator_name}</span>
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => onSelectReport(report.ruc)}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver/Editar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RibReporteTributarioList;