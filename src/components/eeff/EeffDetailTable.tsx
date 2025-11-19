import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eeff } from '@/types/eeff';

interface EeffDetailTableProps {
  eeffs: Eeff[];
  onDelete: (id: string) => void;
}

const EeffDetailTable: React.FC<EeffDetailTableProps> = ({ eeffs, onDelete }) => {
  const navigate = useNavigate();

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  };

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-400">Año</TableHead>
            <TableHead className="text-gray-400">Total Activo</TableHead>
            <TableHead className="text-gray-400">Total Pasivo</TableHead>
            <TableHead className="text-gray-400">Total Patrimonio</TableHead>
            <TableHead className="text-gray-400">Creado Por</TableHead>
            <TableHead className="text-gray-400">Fecha Creación</TableHead>
            <TableHead className="text-gray-400 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eeffs.map((eeff) => (
            <TableRow key={eeff.id} className="border-gray-800">
              <TableCell className="text-white font-semibold">{eeff.anio_reporte || '-'}</TableCell>
              <TableCell className="text-white">{formatCurrency(eeff.activo_total_activo_neto)}</TableCell>
              <TableCell className="text-white">{formatCurrency(eeff.pasivo_total_pasivo)}</TableCell>
              <TableCell className="text-white">{formatCurrency(eeff.patrimonio_total_patrimonio)}</TableCell>
              <TableCell className="text-gray-400">{eeff.created_by || '-'}</TableCell>
              <TableCell className="text-gray-400">{eeff.created_at ? new Date(eeff.created_at).toLocaleDateString('es-ES') : '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/eeff/edit/${eeff.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(eeff.id)}
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
    </div>
  );
};

export default EeffDetailTable;