import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VentasMensualesProveedorSummary } from '@/services/ventasMensualesProveedorService';
import { FilePenLine, Calendar, User, Building2, Trash2 } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';

interface VentasMensualesProveedorListProps {
  reports: VentasMensualesProveedorSummary[];
  onSelectReport: (ruc: string) => void;
  onDeleteReport: (ruc: string) => void;
}

const VentasMensualesProveedorList: React.FC<VentasMensualesProveedorListProps> = ({ reports, onSelectReport, onDeleteReport }) => {
  const { isAdmin } = useSession();

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Borrador':
        return <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded-full border border-gray-500/20">Borrador</span>;
      case 'En revisión':
        return <span className="px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 rounded-full border border-yellow-500/20">En Revisión</span>;
      case 'Completado':
        return <span className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Completado</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-400 rounded-full border border-gray-500/20">Sin Estado</span>;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[2fr,1.5fr,1fr,auto] gap-4 px-4 py-2 text-xs text-gray-400 font-medium">
        <h3>Empresa</h3>
        <h3>Ejecutivo</h3>
        <h3 className="text-center">Estado</h3>
        <span className="w-36"></span>
      </div>

      {reports.map((report) => (
        <Card key={report.ruc} className="bg-gray-900/50 border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
          <CardContent className="p-3 grid grid-cols-1 md:grid-cols-[2fr,1.5fr,1fr,auto] gap-4 items-center">
            
            {/* Empresa Info */}
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 bg-gray-800 rounded-md">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate">{report.nombre_empresa || 'N/A'}</p>
                <p className="text-sm text-gray-500 font-mono">{report.ruc}</p>
              </div>
            </div>

            {/* Ejecutivo Info */}
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-gray-800 rounded-md hidden sm:block">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">{report.creator_name || 'No asignado'}</p>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  <span>{new Date(report.last_updated_at).toLocaleDateString('es-PE')}</span>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="flex justify-center">
              {getStatusBadge(report.status)}
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" className="w-full md:w-24" onClick={() => onSelectReport(report.ruc)}>
                <FilePenLine className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Editar</span>
              </Button>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('¿Seguro deseas eliminar este reporte de ventas?')) {
                      onDeleteReport(report.ruc);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VentasMensualesProveedorList;