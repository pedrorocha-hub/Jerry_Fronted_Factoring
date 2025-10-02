import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import { Rib } from '@/types/rib';

interface RibWithDetails extends Rib {
  nombre_empresa?: string;
}

interface RibTableProps {
  ribs: RibWithDetails[];
  onEdit: (rib: RibWithDetails) => void;
  onDelete: (id: string) => void;
}

const RibTable: React.FC<RibTableProps> = ({ ribs, onEdit, onDelete }) => {
  const { isAdmin } = useSession();

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-800 hover:bg-gray-900/50">
          <TableHead className="text-gray-300">RUC</TableHead>
          <TableHead className="text-gray-300">Razón Social</TableHead>
          <TableHead className="text-gray-300">Ejecutivo</TableHead>
          <TableHead className="text-right text-gray-300">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ribs.map((rib) => (
          <TableRow key={rib.id} className="border-gray-800 hover:bg-gray-900/50">
            <TableCell className="font-mono">{rib.ruc}</TableCell>
            <TableCell>
              <div>{rib.nombre_empresa || 'No disponible'}</div>
              <div className="text-xs text-gray-500">
                Editado: {new Date(rib.updated_at).toLocaleDateString()}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{rib.profiles?.full_name || 'N/A'}</span>
              </div>
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
  );
};

export default RibTable;