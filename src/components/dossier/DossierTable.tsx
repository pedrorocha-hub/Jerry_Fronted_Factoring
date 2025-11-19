import React from 'react';
import { Eye, Building2, Calendar, User, TrendingUp, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DossierSummary } from '@/types/dossier';

interface DossierTableProps {
  dossiers: DossierSummary[];
  loading: boolean;
  onViewDossier: (solicitudId: string) => void;
  onDeleteDossier: (dossierId: string) => void;
}

const DossierTable: React.FC<DossierTableProps> = ({ dossiers, loading, onViewDossier, onDeleteDossier }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Guardado':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Borrador':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando RIBs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dossiers || dossiers.length === 0) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay RIBs guardados disponibles</p>
            <p className="text-gray-500 text-sm mt-2">
              Busca un ID de Solicitud y guarda el RIB para verlo aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
          RIBs Guardados ({dossiers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">RUC</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Empresa</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Estado</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Ranking</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Sector</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Creador</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actualizado</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map((dossier) => (
                <tr 
                  key={dossier.id} 
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="text-white font-mono text-sm">{dossier.ruc}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <p className="text-white text-sm font-medium truncate">
                        {dossier.nombreEmpresa}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={getStatusColor(dossier.status)}>
                      {dossier.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-[#00FF80] mr-1" />
                      <span className="text-white text-sm">
                        {dossier.ranking ? `#${dossier.ranking}` : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-300 text-sm">
                      {dossier.sector || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-300 text-sm">
                        {dossier.creadorNombre}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-300 text-sm">
                        {formatDate(dossier.fechaActualizacion)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => onViewDossier(dossier.solicitud_id)}
                        className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteDossier(dossier.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DossierTable;