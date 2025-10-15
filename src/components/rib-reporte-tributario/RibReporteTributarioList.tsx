import React from 'react';
import { Building2 } from 'lucide-react';

interface GroupedReport {
  ruc: string;
  nombre_empresa: string;
  reports: any[];
}

interface RibReporteTributarioListProps {
  reports: GroupedReport[];
  onSelectReport: (ruc: string) => void;
}

const RibReporteTributarioList: React.FC<RibReporteTributarioListProps> = ({ 
  reports, 
  onSelectReport,
}) => {
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
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-[#00FF80] mr-3" />
              <div>
                <p className="text-white font-medium text-sm leading-tight" title={group.nombre_empresa}>
                  {group.nombre_empresa || 'Empresa sin nombre'}
                </p>
                <p className="text-gray-400 text-xs font-mono mt-1">
                  RUC: {group.ruc}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RibReporteTributarioList;