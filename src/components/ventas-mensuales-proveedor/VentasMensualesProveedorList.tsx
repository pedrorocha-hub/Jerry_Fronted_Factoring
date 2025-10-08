import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { VentasMensualesProveedorSummary } from '@/services/ventasMensualesProveedorService';
import { FilePenLine } from 'lucide-react';

interface VentasMensualesProveedorListProps {
  reports: VentasMensualesProveedorSummary[];
  onSelectReport: (ruc: string) => void;
}

const VentasMensualesProveedorList: React.FC<VentasMensualesProveedorListProps> = ({ reports, onSelectReport }) => {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900/50 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">RUC</TableHead>
            <TableHead className="text-gray-300">Nombre Empresa</TableHead>
            <TableHead className="text-gray-300">Última Actualización</TableHead>
            <TableHead className="text-right text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.ruc} className="border-gray-800">
              <TableCell className="font-mono text-gray-400">{report.ruc}</TableCell>
              <TableCell className="font-medium text-white">{report.nombre_empresa || 'N/A'}</TableCell>
              <TableCell className="text-gray-400">{new Date(report.last_updated_at).toLocaleString('es-PE')}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onSelectReport(report.ruc)}>
                  <FilePenLine className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VentasMensualesProveedorList;