import React from 'react';
import { BarChart3, Building2, Phone, MapPin, Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DossierRib } from '@/types/dossier';

interface AnalisisRibSectionProps {
  dossier: DossierRib;
}

const AnalisisRibSection: React.FC<AnalisisRibSectionProps> = ({ dossier }) => {
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
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-[#00FF80]" />
          2. Análisis RIB
        </CardTitle>
        <Badge variant="outline" className={getStatusColor(dossier.analisisRib.status)}>
          {dossier.analisisRib.status}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* INFORMACIÓN BÁSICA DE LA EMPRESA */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
            <h4 className="text-white font-medium text-lg">Información Básica de la Empresa</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Descripción de la Empresa</Label>
                <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <p className="text-white text-sm">{dossier.analisisRib.descripcion_empresa || 'N/A'}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Inicio de Actividades</Label>
                <p className="text-white">{formatDate(dossier.analisisRib.inicio_actividades)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Grupo Económico</Label>
                <p className="text-white">{dossier.analisisRib.grupo_economico || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">¿Cómo llegó a LCP?</Label>
                <p className="text-white">{dossier.analisisRib.como_llego_lcp || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN DE CONTACTO */}
        <div className="border-t border-gray-800 pt-6 mb-8">
          <div className="flex items-center mb-4">
            <Phone className="h-5 w-5 mr-2 text-blue-400" />
            <h4 className="text-white font-medium text-lg">Información de Contacto</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Dirección</Label>
                <p className="text-white">{dossier.analisisRib.direccion || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Teléfono</Label>
                <p className="text-white font-mono">{dossier.analisisRib.telefono || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Relación Comercial con Deudor</Label>
                <p className="text-white">{dossier.analisisRib.relacion_comercial_deudor || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN DE VISITA */}
        <div className="border-t border-gray-800 pt-6 mb-8">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 mr-2 text-purple-400" />
            <h4 className="text-white font-medium text-lg">Información de Visita</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-400">Visita</Label>
              <div className="mt-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <p className="text-white text-sm">{dossier.analisisRib.visita || 'No especificada'}</p>
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Validado por</Label>
              <p className="text-white">{dossier.analisisRib.validado_por || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* ACCIONISTAS */}
        {dossier.accionistas.length > 0 && (
          <div className="border-t border-gray-800 pt-6 mb-8">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 mr-2 text-orange-400" />
              <h4 className="text-white font-medium text-lg">Accionistas</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">DNI</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Porcentaje</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Vínculo</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Calificación</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Comentario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dossier.accionistas.map((accionista, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4 text-white font-medium">{accionista.nombre}</td>
                      <td className="py-3 px-4 text-white font-mono">{accionista.dni}</td>
                      <td className="py-3 px-4 text-right text-white font-mono">
                        {accionista.porcentaje ? `${accionista.porcentaje}%` : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-white">{accionista.vinculo || 'N/A'}</td>
                      <td className="py-3 px-4 text-white">
                        <Badge variant="outline" className="text-xs">
                          {accionista.calificacion || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{accionista.comentario || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GERENCIA */}
        {dossier.gerencia.length > 0 && (
          <div className="border-t border-gray-800 pt-6">
            <div className="flex items-center mb-4">
              <UserCheck className="h-5 w-5 mr-2 text-green-400" />
              <h4 className="text-white font-medium text-lg">Gerencia</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Nombre</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">DNI</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Cargo</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Vínculo</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Calificación</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Comentario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dossier.gerencia.map((gerente, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4 text-white font-medium">{gerente.nombre}</td>
                      <td className="py-3 px-4 text-white font-mono">{gerente.dni}</td>
                      <td className="py-3 px-4 text-white">{gerente.cargo || 'N/A'}</td>
                      <td className="py-3 px-4 text-white">{gerente.vinculo || 'N/A'}</td>
                      <td className="py-3 px-4 text-white">
                        <Badge variant="outline" className="text-xs">
                          {gerente.calificacion || 'N/A'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white text-sm">{gerente.comentario || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalisisRibSection;