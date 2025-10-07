import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ReporteTributarioDeudorSummary } from '@/services/reporteTributarioDeudorService';

interface ReporteTributarioDeudorListProps {
  reports: ReporteTributarioDeudorSummary[];
  onSelectReport: (ruc: string) => void;
}

const ReporteTributarioDeudorList: React.FC<ReporteTributarioDeudorListProps> = ({ reports, onSelectReport }) => {
  if (reports.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay reportes guardados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-transparent">
            <TableHead className="text-gray-300">RUC</TableHead>
            <TableHead className="text-gray-300">Razón Social</TableHead>
            <TableHead className="text-gray-300">Última Modificación</TableHead>
            <TableHead className="text-gray-300 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.ruc} className="border-gray-800">
              <TableCell className="font-medium text-white">{report.ruc}</TableCell>
              <TableCell className="text-gray-300">{report.nombre_empresa}</TableCell>
              <TableCell className="text-gray-400">{new Date(report.updated_at).toLocaleString()}</TableCell>
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