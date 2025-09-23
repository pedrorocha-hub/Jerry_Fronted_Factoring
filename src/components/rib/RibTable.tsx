import React from 'react';
import { FileText, Calendar, Edit, Trash2, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rib } from '@/types/rib';

interface RibTableProps {
  ribs: Rib[];
  onEdit: (rib: Rib) => void;
  onDelete: (rib: Rib) => void;
  onDownload: (rib: Rib) => void;
}

const RibTable: React.FC<RibTableProps> = ({ ribs, onEdit, onDelete, onDownload }) => {
  const getStatusBadge = (status: Rib['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-400">Borrador</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-400">En Revisión</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400">Completado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">RUC</TableHead>
            <TableHead className="text-gray-300">Estado</TableHead>
            <TableHead className="text-gray-300">Fecha de Creación</TableHead>
            <TableHead className="text-right text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ribs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p>No hay Fichas Rib creadas todavía.</p>
              </TableCell>
            </TableRow>
          ) : (
            ribs.map((rib) => (
              <TableRow key={rib.id} className="border-gray-800">
                <TableCell className="font-mono text-white">{rib.ruc}</TableCell>
                <TableCell>{getStatusBadge(rib.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(rib.created_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(rib)} className="text-gray-400 hover:text-white" title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDownload(rib)} className="text-gray-400 hover:text-white" title="Descargar PDF">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(rib)} className="text-gray-400 hover:text-red-500" title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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