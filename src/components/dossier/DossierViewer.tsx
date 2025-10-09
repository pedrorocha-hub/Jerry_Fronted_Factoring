import React from 'react';
import { Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DossierRib } from '@/types/dossier';
import { showSuccess } from '@/utils/toast';

// Importar los componentes de sección
import SolicitudOperacionSection from './sections/SolicitudOperacionSection';
import AnalisisRibSection from './sections/AnalisisRibSection';
import ComportamientoCrediticioSection from './sections/ComportamientoCrediticioSection';
import RibReporteTributarioSection from './sections/RibReporteTributarioSection';
import VentasMensualesSection from './sections/VentasMensualesSection';

interface DossierViewerProps {
  dossier: DossierRib;
}

const DossierViewer: React.FC<DossierViewerProps> = ({ dossier }) => {
  const handleDownloadPDF = () => {
    showSuccess('Funcionalidad de descarga PDF en desarrollo.');
  };

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-PE');
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Dossier */}
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-5 w-5 mr-2 text-[#00FF80]" />
                Dossier RIB - {dossier.fichaRuc?.nombre_empresa || 'Empresa'}
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1">RUC: {dossier.solicitudOperacion.ruc}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={getStatusColor(dossier.solicitudOperacion.status || 'Borrador')}>
                {dossier.solicitudOperacion.status || 'Borrador'}
              </Badge>
              <Button 
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Dossier PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-gray-400">Fecha de Creación</Label>
              <p className="text-white">{formatDate(dossier.solicitudOperacion.created_at)}</p>
            </div>
            <div>
              <Label className="text-gray-400">Última Actualización</Label>
              <p className="text-white">{formatDate(dossier.solicitudOperacion.updated_at)}</p>
            </div>
            <div>
              <Label className="text-gray-400">Creado por</Label>
              <p className="text-white">{dossier.creatorInfo?.fullName || 'N/A'}</p>
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
      
      {dossier.ribReporteTributario.length > 0 && (
        <RibReporteTributarioSection dossier={dossier} />
      )}
      
      {dossier.ventasMensuales && (
        <VentasMensualesSection dossier={dossier} />
      )}
    </div>
  );
};

export default DossierViewer;