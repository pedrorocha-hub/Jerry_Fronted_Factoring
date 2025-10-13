import React from 'react';
import { ClipboardEdit, Edit, Trash2, PlusCircle, Building2, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SolicitudOperacion } from '@/types/solicitudOperacion';

interface SolicitudOperacionListProps {
  solicitudes: SolicitudOperacion[];
  loading: boolean;
  onEdit: (solicitud: SolicitudOperacion) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const SolicitudOperacionList: React.FC<SolicitudOperacionListProps> = ({
  solicitudes,
  loading,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'Borrador': 'bg-gray-500/20 text-gray-400 border-gray-500/20',
      'En Revisión': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      'Aprobado': 'bg-green-500/20 text-green-400 border-green-500/20',
      'Rechazado': 'bg-red-500/20 text-red-400 border-red-500/20',
      'Completado': 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    };

    return (
      <Badge className={statusColors[status] || statusColors['Borrador']}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ClipboardEdit className="h-6 w-6 mr-3 text-[#00FF80]" />
            Solicitudes de Operación
          </h1>
          <p className="text-gray-400">
            Gestión de solicitudes de operación y análisis de riesgo
          </p>
        </div>
        <Button onClick={onCreate} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Solicitudes Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {solicitudes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ClipboardEdit className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-white mb-2">No hay solicitudes registradas</h3>
              <p className="mb-6">Crea tu primera solicitud de operación para comenzar</p>
              <Button onClick={onCreate} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                <PlusCircle className="h-4 w-4 mr-2" />
                Crear Primera Solicitud
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-900/50">
                    <TableHead className="text-gray-300">RUC</TableHead>
                    <TableHead className="text-gray-300">Producto</TableHead>
                    <TableHead className="text-gray-300">Proveedor</TableHead>
                    <TableHead className="text-gray-300">Deudor</TableHead>
                    <TableHead className="text-gray-300">Estado</TableHead>
                    <TableHead className="text-gray-300">Fecha</TableHead>
                    <TableHead className="text-right text-gray-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudes.map((solicitud) => (
                    <TableRow key={solicitud.id} className="border-gray-800 hover:bg-gray-900/30">
                      <TableCell className="font-mono text-white">{solicitud.ruc}</TableCell>
                      <TableCell className="text-white">{solicitud.producto || '-'}</TableCell>
                      <TableCell className="text-white">{solicitud.proveedor || '-'}</TableCell>
                      <TableCell className="text-white">{solicitud.deudor || '-'}</TableCell>
                      <TableCell>{getStatusBadge(solicitud.status || 'Borrador')}</TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(solicitud.created_at).toLocaleDateString('es-PE')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(solicitud)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(solicitud.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitudOperacionList;