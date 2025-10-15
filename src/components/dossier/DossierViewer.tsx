import React from 'react';
import { Save, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DossierRib } from '@/types/dossier';
import SolicitudOperacionSection from './sections/SolicitudOperacionSection';
import AnalisisRibSection from './sections/AnalisisRibSection';
import ComportamientoCrediticioSection from './sections/ComportamientoCrediticioSection';
import RibReporteTributarioSection from './sections/RibReporteTributarioSection';
import VentasMensualesSection from './sections/VentasMensualesSection';
import RibEeffSection from './sections/RibEeffSection';

interface DossierViewerProps {
  dossier: DossierRib;
  onSave?: () => void;
  saving?: boolean;
  onDownload?: () => void;
}

const DossierViewer: React.FC<DossierViewerProps> = ({ dossier, onSave, saving = false, onDownload }) => {
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

  const nombreEmpresa = dossier.fichaRuc?.nombre_empresa || 
                       dossier.top10kData?.razon_social || 
                       'Empresa sin nombre';

  return (
    <div className="space-y-6">
      {/* Header del Dossier */}
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-[#00FF80]" />
              <div>
                <CardTitle className="text-white text-xl">
                  Dossier RIB - {nombreEmpresa}
                </CardTitle>
                <p className="text-gray-400">RUC: {dossier.solicitudOperacion.ruc}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className={getStatusColor(dossier.solicitudOperacion.status)}>
                {dossier.solicitudOperacion.status}
              </Badge>
              {onSave && (
                <Button 
                  onClick={onSave}
                  disabled={saving}
                  className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                >
                  <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Guardando...' : 'Guardar Dossier'}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onDownload}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Creado por:</span>
              <p className="text-white">{dossier.creatorInfo?.fullName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-400">Fecha de creación:</span>
              <p className="text-white">
                {new Date(dossier.solicitudOperacion.created_at).toLocaleDateString('es-PE')}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Última actualización:</span>
              <p className="text-white">
                {new Date(dossier.solicitudOperacion.updated_at).toLocaleDateString('es-PE')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secciones del Dossier */}
      <SolicitudOperacionSection dossier={dossier} />
      
      {dossier.analisisRib && (
        <AnalisisRibSection dossier={dossier} />
      )}
      
      {dossier.comportamientoCrediticio && (
        <ComportamientoCrediticioSection dossier={dossier} />
      )}
      
      {dossier.ribReporteTributario && dossier.ribReporteTributario.length > 0 && (
        <RibReporteTributarioSection dossier={dossier} />
      )}
      
      <VentasMensualesSection dossier={dossier} />

      {dossier.ribEeff && dossier.ribEeff.length > 0 && (
        <RibEeffSection dossier={dossier} />
      )}
    </div>
  );
};

export default DossierViewer;