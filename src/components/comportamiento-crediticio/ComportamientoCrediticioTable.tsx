import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { ComportamientoCrediticio, CrediticioStatus } from '@/types/comportamientoCrediticio';
import { useSession } from '@/contexts/SessionContext';

interface ReporteWithDetails extends ComportamientoCrediticio {
  nombre_empresa?: string;
  creator_name?: string;
}

interface ComportamientoCrediticioTableProps {
  reports: ReporteWithDetails[];
  onEdit: (report: ReporteWithDetails) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: CrediticioStatus | null | undefined) => {
  switch (status) {
    case 'Aprobado':
      return 'bg-green-500/20 text-green-400';
    case 'En revisión':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'Rechazado':
      return 'bg-red-500/20 text-red-400';
    case 'Borrador':
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const ComportamientoCrediticioTable: React.FC<ComportamientoCrediticioTableProps> = ({ reports, onEdit, onDelete }) => {
  const { isAdmin } = useSession();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800">
          <TableHead className="text-gray-300">RUC</TableHead>
          <TableHead className="text-gray-300">Razón Social</TableHead>
          <TableHead className="text-gray-300">Ejecutivo</TableHead>
          <TableHead className="text-gray-300">Estado</TableHead>
          <TableHead className="text-right text-gray-300">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map(report => (
          <TableRow key={report.id} className="border-gray-800">
            <TableCell className="font-mono">{report.ruc}</TableCell>
            <TableCell>{report.nombre_empresa}</TableCell>
            <TableCell>
              <div>{report.creator_name || 'Desconocido'}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1.5" />
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                {report.status || 'Borrador'}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(report)} className="text-gray-400 hover:text-white"><Edit className="h-4 w-4" /></Button>
              {isAdmin && <Button variant="ghost" size="icon" onClick={() => onDelete(report.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ComportamientoCrediticioTable;