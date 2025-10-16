import React from 'react';
import { Trash2, Edit, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VentasMensualesSummary } from '@/types/ventasMensuales';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface VentasMensualesListProps {
  items: VentasMensualesSummary[];
  onSelectReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
}

const VentasMensualesList: React.FC<VentasMensualesListProps> = ({
  items,
  onSelectReport,
  onDeleteReport,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'Borrador': { label: 'Borrador', className: 'bg-gray-500' },
      'Completado': { label: 'Completado', className: 'bg-green-500' },
      'En Revisión': { label: 'En Revisión', className: 'bg-yellow-500' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-500' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No hay reportes de ventas mensuales guardados.</p>
        <p className="text-sm mt-2">Crea uno nuevo para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-400">RUC</TableHead>
            <TableHead className="text-gray-400">Empresa</TableHead>
            <TableHead className="text-gray-400">Estado</TableHead>
            <TableHead className="text-gray-400">Creado por</TableHead>
            <TableHead className="text-gray-400">Última actualización</TableHead>
            <TableHead className="text-gray-400 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="border-gray-800 hover:bg-gray-900/50 cursor-pointer"
              onClick={() => onSelectReport(item.id)}
            >
              <TableCell className="font-mono text-white">{item.ruc}</TableCell>
              <TableCell className="text-white">{item.nombre_empresa || 'Sin nombre'}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell className="text-gray-400">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {item.creator_name || 'Desconocido'}
                </div>
              </TableCell>
              <TableCell className="text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(item.last_updated_at)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReport(item.id);
                    }}
                    className="text-[#00FF80] hover:text-[#00FF80]/80 hover:bg-gray-800"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReport(item.id);
                    }}
                    className="text-red-500 hover:text-red-400 hover:bg-gray-800"
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
  );
};

export default VentasMensualesList;