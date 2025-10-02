import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { Rib, RibStatus } from '@/types/rib';
import { useSession } from '@/contexts/SessionContext';

interface RibWithDetails extends Rib {
  nombre_empresa?: string;
  profiles?: { full_name: string | null } | null;
}

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
        {ribs.map(rib => (
          <TableRow key={rib.id} className="border-gray-800">
            <TableCell className="font-mono">{rib.ruc}</TableCell>
            <TableCell>{rib.nombre_empresa}</TableCell>
            <TableCell>
              <div>{rib.profiles?.full_name || 'Desconocido'}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1.5" />
                <span>{new Date(rib.created_at).toLocaleDateString()}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rib.status)}`}>
                {rib.status || 'Borrador'}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEdit(rib)} className="text-gray-400 hover:text-white"><Edit className="h-4 w-4" /></Button>
              {isAdmin && <Button variant="ghost" size="icon" onClick={() => onDelete(rib.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RibTable;