import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Sentinel } from '@/types/sentinel';
import { useSession } from '@/contexts/SessionContext';

interface SentinelTableProps {
  sentinels: Sentinel[];
  onEdit: (sentinel: Sentinel) => void;
  onDelete: (sentinel: Sentinel) => void;
}

const getStatusColor = (status: string | null | undefined) => {
  switch (status) {
    case 'Procesado': return 'bg-green-500/20 text-green-400';
    case 'Error': return 'bg-red-500/20 text-red-400';
    case 'Borrador':
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

const SentinelTable: React.FC<SentinelTableProps> = ({ sentinels, onEdit, onDelete }) => {
  const { isAdmin } = useSession();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">RUC</TableHead>
            <TableHead className="text-gray-300">Estado</TableHead>
            <TableHead className="text-gray-300">Fecha de Creación</TableHead>
            <TableHead className="text-gray-300">Documento</TableHead>
            {isAdmin && <TableHead className="text-right text-gray-300">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sentinels.map((sentinel) => (
            <TableRow key={sentinel.id} className="border-gray-800 hover:bg-gray-900/50">
              <TableCell className="font-mono text-white">{sentinel.ruc}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sentinel.status)}`}>
                  {sentinel.status || 'Borrador'}
                </span>
              </TableCell>
              <TableCell className="text-gray-400">
                {new Date(sentinel.created_at).toLocaleString('es-ES')}
              </TableCell>
              <TableCell>
                {sentinel.file_url ? (
                  <a href={sentinel.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center">
                    <FileText className="h-4 w-4 mr-2" /> Ver PDF
                  </a>
                ) : (
                  <span className="text-gray-500">No disponible</span>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(sentinel)} className="text-gray-400 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(sentinel)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SentinelTable;