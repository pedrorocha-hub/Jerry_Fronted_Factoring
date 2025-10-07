import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Calendar } from 'lucide-react';
import { ReporteTributarioDeudorSummary } from '@/services/reporteTributarioDeudorService';

interface ReporteTributarioDeudorListProps {
  reports: ReporteTributarioDeudorSummary[];
  onSelectReport: (ruc: string) => void;
}

const getStatusColor = (status: string | null | undefined) => {
  switch (status) {
    case 'Completado':
      return 'bg-green-500/20 text-green-400';
    case 'En revisión':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'Borrador':
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const ReporteTributarioDeudorList: React.FC<ReporteTributarioDeudorListProps> = ({ reports, onSelectReport }) => {
  if (reports.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay reportes guardados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-transparent">
            <TableHead className="text-gray-300">Empresa</TableHead>
            <TableHead className="text-gray-300">Ejecutivo</TableHead>
            <TableHead className="text-gray-300">Estado</TableHead>
            <TableHead className="text-gray-300 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.ruc} className="border-gray-800">
              <TableCell>
                <div className="font-medium text-white">{report.nombre_empresa}</div>
                <div className="text-sm text-gray-400 font-mono">{report.ruc}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-300">{report.creator_name || 'Sistema'}</div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {new Date(report.updated_at).toLocaleDateString('es-ES')}
                </div>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                  {report.status || 'Borrador'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onSelectReport(report.ruc)} className="text-gray-400 hover:text-white">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver/Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReporteTributarioDeudorList;