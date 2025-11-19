import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, ClipboardList } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VentasMensualesSummary, VentasStatus, getVentasStatusDisplay } from '@/types/ventasMensuales';

interface VentasMensualesListProps {
  items: VentasMensualesSummary[];
  onSelectReport: (summary: VentasMensualesSummary) => void;
  onDeleteReport: (id: string) => void;
}

const getStatusBadge = (status: VentasStatus | null | undefined) => {
  const displayStatus = getVentasStatusDisplay(status);
  
  switch (status) {
    case 'completado':
      return <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">{displayStatus}</Badge>;
    case 'en_revision':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black border-transparent">{displayStatus}</Badge>;
    case 'borrador':
    default:
      return <Badge variant="outline">{displayStatus}</Badge>;
  }
};

const VentasMensualesList: React.FC<VentasMensualesListProps> = ({ items, onSelectReport, onDeleteReport }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No se encontraron reportes de ventas.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800">
          <TableHead className="text-gray-400">Empresa (RUC)</TableHead>
          <TableHead className="text-gray-400">Creador</TableHead>
          <TableHead className="text-gray-400">Solicitud Asociada</TableHead>
          <TableHead className="text-gray-400">Estado</TableHead>
          <TableHead className="text-gray-400">Última Actualización</TableHead>
          <TableHead className="text-gray-400 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id} className="border-gray-800">
            <TableCell className="text-white font-medium">
              {item.nombre_empresa || 'N/A'} ({item.ruc})
            </TableCell>
            <TableCell className="text-white">{item.creator_name || 'N/A'}</TableCell>
            <TableCell>
              {item.solicitud_id ? (
                <Link 
                  to={`/solicitudes-operacion/editar/${item.solicitud_id}`} 
                  className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs flex items-center"
                >
                  <ClipboardList className="h-3 w-3 mr-1.5" />
                  {item.solicitud_id.substring(0, 8)}...
                </Link>
              ) : (
                <span className="text-gray-500 text-xs">N/A</span>
              )}
            </TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
            <TableCell className="text-gray-400">
              {item.last_updated_at ? new Date(item.last_updated_at).toLocaleDateString('es-ES') : '-'}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectReport(item)}
                >
                  <Edit className="h-4 w-4 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteReport(item.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default VentasMensualesList;