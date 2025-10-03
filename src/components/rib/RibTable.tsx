import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { RibWithDetails, RibStatus } from '@/types/rib';
import { useSession } from '@/contexts/SessionContext';

interface RibTableProps {
  ribs: RibWithDetails[];
  onEdit: (rib: RibWithDetails) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: RibStatus | null | undefined) => {
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

const RibTable: React.FC<RibTableProps> = ({ ribs, onEdit, onDelete }) => {
  const { isAdmin } = useSession();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">Empresa</TableHead>
            <TableHead className="text-gray-300">Ejecutivo</TableHead>
            <TableHead className="text-gray-300">Fecha Creación</TableHead>
            <TableHead className="text-gray-300">Estado</TableHead>
            <TableHead className="text-right text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ribs.map((rib) => (
            <TableRow key={rib.id} className="border-gray-800 hover:bg-gray-900/50">
              <TableCell>
                <div className="font-medium text-white">{rib.nombre_empresa}</div>
                <div className="text-sm text-gray-400 font-mono">{rib.ruc}</div>
              </TableCell>
              <TableCell className="text-gray-300">{rib.profiles?.full_name || 'No asignado'}</TableCell>
              <TableCell className="text-gray-300">{new Date(rib.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rib.status)}`}>
                  {rib.status || 'Borrador'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(rib)} className="text-gray-400 hover:text-white">
                  <Edit className="h-4 w-4" />
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" onClick={() => onDelete(rib.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RibTable;