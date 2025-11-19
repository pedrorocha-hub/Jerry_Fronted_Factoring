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
import { ComportamientoCrediticio } from '@/types/comportamientoCrediticio';

interface ReporteWithDetails extends ComportamientoCrediticio {
  nombre_empresa?: string;
  creator_name?: string;
}

interface ComportamientoCrediticioTableProps {
  reports: ReporteWithDetails[];
  onEdit: (report: ReporteWithDetails) => void;
  onDelete: (id: string) => void;
}

const getStatusBadge = (status: string | null | undefined) => {
  switch (status) {
    case 'Aprobado':
      return <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">Aprobado</Badge>;
    case 'En revisión':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black border-transparent">En Revisión</Badge>;
    case 'Rechazado':
      return <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent">Rechazado</Badge>;
    case 'Borrador':
    default:
      return <Badge variant="outline">Borrador</Badge>;
  }
};

const ComportamientoCrediticioTable: React.FC<ComportamientoCrediticioTableProps> = ({ reports, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800">
          <TableHead className="text-gray-400">RUC</TableHead>
          <TableHead className="text-gray-400">Proveedor</TableHead>
          <TableHead className="text-gray-400">Deudor</TableHead>
          <TableHead className="text-gray-400">Estado</TableHead>
          <TableHead className="text-gray-400">Creador</TableHead>
          <TableHead className="text-gray-400">Última Actualización</TableHead>
          <TableHead className="text-gray-400 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id} className="border-gray-800">
            <TableCell className="text-gray-400 font-mono text-xs">
              {report.ruc}
            </TableCell>
            <TableCell className="text-white">
              <div className="flex flex-col">
                <span className="font-medium">{report.proveedor || report.nombre_empresa || 'N/A'}</span>
                {report.solicitud_id && (
                  <Link 
                    to={`/solicitudes-operacion/edit/${report.solicitud_id}`} 
                    className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs flex items-center mt-1"
                  >
                    <ClipboardList className="h-3 w-3 mr-1" />
                    Solicitud: {report.solicitud_id.substring(0, 8)}...
                  </Link>
                )}
              </div>
            </TableCell>
            <TableCell className="text-white">
              {report.deudor ? (
                <span className="text-white">{report.deudor}</span>
              ) : (
                <span className="text-gray-500 text-xs italic">Sin deudor</span>
              )}
            </TableCell>
            <TableCell>{getStatusBadge(report.status)}</TableCell>
            <TableCell className="text-gray-400 text-sm">{report.creator_name || 'N/A'}</TableCell>
            <TableCell className="text-gray-400 text-sm">
              {report.updated_at ? new Date(report.updated_at).toLocaleDateString('es-ES') : '-'}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(report)}
                >
                  <Edit className="h-4 w-4 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(report.id)}
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

export default ComportamientoCrediticioTable;