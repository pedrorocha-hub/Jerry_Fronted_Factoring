import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VentasMensualesProveedorSummary } from '@/services/ventasMensualesProveedorService';
import { FilePenLine, Calendar, User, Building2 } from 'lucide-react';

interface VentasMensualesProveedorListProps {
  reports: VentasMensualesProveedorSummary[];
  onSelectReport: (ruc: string) => void;
}

const VentasMensualesProveedorList: React.FC<VentasMensualesProveedorListProps> = ({ reports, onSelectReport }) => {
  
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Borrador':
        return <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">Borrador</span>;
      case 'En revisión':
        return <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">En Revisión</span>;
      case 'Completado':
        return <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Completado</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded-full border border-gray-500/20">Sin Estado</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report) => (
        <Card key={report.ruc} className="bg-gray-900/50 border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-400 flex items-center"><Building2 className="h-3 w-3 mr-1.5" /> Empresa</p>
                  <h3 className="font-bold text-white">{report.nombre_empresa || 'N/A'}</h3>
                  <p className="text-sm text-gray-500 font-mono">{report.ruc}</p>
                </div>
                {getStatusBadge(report.status)}
              </div>

              <div className="text-sm space-y-2">
                <div className="flex items-center text-gray-400">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="font-medium text-gray-300">{report.creator_name || 'No asignado'}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{new Date(report.last_updated_at).toLocaleDateString('es-PE')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full" onClick={() => onSelectReport(report.ruc)}>
                <FilePenLine className="h-4 w-4 mr-2" />
                Editar Reporte
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VentasMensualesProveedorList;