import React from 'react';
import { Eye, Star, Building2, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DossierSummary } from '@/types/dossier';

interface DossierTableProps {
  dossiers: DossierSummary[];
  loading: boolean;
  onViewDossier: (ruc: string) => void;
}

const DossierTable: React.FC<DossierTableProps> = ({ dossiers, loading, onViewDossier }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-PE');
    } catch (error) {
      return 'N/A';
    }
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

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando dossiers completados...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (dossiers.length === 0) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay dossiers completados disponibles</p>
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
          Dossiers RIB Completados ({dossiers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Empresa</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">RUC</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Sector</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Ranking</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Estado</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Creado por</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actualizado</th>
                <th className="text-center py-3 px-4 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {dossiers.map((dossier, index) => (
                <tr key={index} className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-white font-medium text-sm">{dossier.nombreEmpresa}</p>
                        {dossier.sector && (
                          <p className="text-gray-400 text-xs">{dossier.sector}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white font-mono text-sm">{dossier.ruc}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-300 text-sm">{dossier.sector || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {dossier.ranking ? (
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 font-bold">#{dossier.ranking}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className={getStatusColor(dossier.status)}>
                      {dossier.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-300 text-sm">{dossier.creadorNombre}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-300 text-sm">{formatDate(dossier.fechaActualizacion)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button
                      onClick={() => onViewDossier(dossier.ruc)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
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