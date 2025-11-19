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
import { RibReporteTributarioSummary } from '@/services/ribReporteTributarioService';

interface RibReporteTributarioListProps {
  reports: RibReporteTributarioSummary[];
  onSelectReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
}

const getStatusBadge = (status: string | null | undefined) => {
  switch (status) {
    case 'Completado':
      return <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">Completado</Badge>;
    case 'En revision':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black border-transparent">En Revisión</Badge>;
    case 'Borrador':
    default:
      return <Badge variant="outline">Borrador</Badge>;
  }
};

const RibReporteTributarioList: React.FC<RibReporteTributarioListProps> = ({ reports, onSelectReport, onDeleteReport }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No se encontraron reportes tributarios.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800">
          <TableHead className="text-gray-400">Deudor</TableHead>
          <TableHead className="text-gray-400">Proveedor</TableHead>
          <TableHead className="text-gray-400">Creador</TableHead>
          <TableHead className="text-gray-400">Solicitud</TableHead>
          <TableHead className="text-gray-400">Estado</TableHead>
          <TableHead className="text-gray-400">Última Act.</TableHead>
          <TableHead className="text-gray-400 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id} className="border-gray-800">
            <TableCell className="text-white">
              <div className="flex flex-col">
                <span className="font-medium">{report.deudor_nombre}</span>
                <span className="text-xs text-gray-400 font-mono">{report.deudor_ruc}</span>
              </div>
            </TableCell>
            <TableCell className="text-white">
              {report.proveedor_ruc && report.proveedor_ruc !== 'N/A' ? (
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{report.proveedor_nombre}</span>
                  <span className="text-xs text-gray-400 font-mono">{report.proveedor_ruc}</span>
                </div>
              ) : (
                <span className="text-gray-500 text-xs italic">Sin proveedor</span>
              )}
            </TableCell>
            <TableCell className="text-white text-sm">{report.creator_name || 'N/A'}</TableCell>
            <TableCell>
              {report.solicitud_id ? (
                <Link 
                  to={`/solicitudes-operacion/editar/${report.solicitud_id}`} 
                  className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs flex items-center"
                >
                  <ClipboardList className="h-3 w-3 mr-1.5" />
                  {report.solicitud_id.substring(0, 8)}...
                </Link>
              ) : (
                <span className="text-gray-500 text-xs">N/A</span>
              )}
            </TableCell>
            <TableCell>{getStatusBadge(report.status)}</TableCell>
            <TableCell className="text-gray-400 text-sm">
              {report.updated_at ? new Date(report.updated_at).toLocaleDateString('es-ES') : '-'}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectReport(report.id)}
                >
                  <Edit className="h-4 w-4 text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteReport(report.id)}
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

export default RibReporteTributarioList;