import React from 'react';
import { Building2, Calendar, Trash2, Eye } from 'lucide-react';
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
import { Rib } from '@/types/rib';

interface RibTableProps {
  ribs: Rib[];
  onDelete: (id: string) => void;
}

const RibTable: React.FC<RibTableProps> = ({ ribs, onDelete }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">Borrador</Badge>;
      case 'completed':
        return <Badge className="bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20">Completado</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="border-blue-500/30 text-blue-300">En Revisión</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">Empresa</TableHead>
            <TableHead className="text-gray-300">RUC</TableHead>
            <TableHead className="text-gray-300">Estado</TableHead>
            <TableHead className="text-gray-300">Fecha de Creación</TableHead>
            <TableHead className="text-right text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ribs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                No hay fichas Rib creadas.
              </TableCell>
            </TableRow>
          ) : (
            ribs.map((rib) => (
              <TableRow key={rib.id} className="border-gray-800">
                <TableCell className="font-medium text-white">{rib.ficha_ruc?.nombre_empresa || 'N/A'}</TableCell>
                <TableCell className="font-mono text-gray-300">{rib.ruc}</TableCell>
                <TableCell>{getStatusBadge(rib.status)}</TableCell>
                <TableCell className="text-gray-400">{new Date(rib.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(rib.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RibTable;