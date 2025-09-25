import React, { useState } from 'react';
import { Edit, Trash2, Download, Search, User, Building, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Rib } from '@/types/rib';
import { useSession } from '@/contexts/SessionContext';

// This interface must match the one in RibListPage.tsx
interface RibWithDetails extends Rib {
  nombre_empresa?: string;
  creator_name?: string;
}

interface RibTableProps {
  ribs: RibWithDetails[];
  onEdit: (rib: Rib) => void;
  onDelete: (rib: Rib) => void;
  onDownload: (rib: Rib) => void;
}

const RibTable: React.FC<RibTableProps> = ({ ribs, onEdit, onDelete, onDownload }) => {
  const { isAdmin } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRibs = (ribs || []).filter(rib =>
    rib.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rib.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRibs.length / itemsPerPage);
  const paginatedRibs = filteredRibs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Pendiente</Badge>;
      case 'draft':
      default:
        return <Badge variant="outline" className="border-gray-700 text-gray-400">Borrador</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por RUC o Razón Social..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
        />
      </div>

      <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">RUC</TableHead>
              <TableHead className="text-gray-300">Razón Social</TableHead>
              <TableHead className="text-gray-300">Creado por</TableHead>
              <TableHead className="text-gray-300">Fecha Creación</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRibs.length > 0 ? (
              paginatedRibs.map((rib) => (
                <TableRow key={rib.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell>
                    <code className="font-mono text-sm text-white bg-gray-900/50 px-2 py-1 rounded">{rib.ruc}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-white">{rib.nombre_empresa}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{rib.creator_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {rib.created_at ? new Date(rib.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(rib.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => onDownload(rib)} title="Descargar PDF" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        <Download className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => onEdit(rib)} title="Editar" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDelete(rib)} title="Eliminar" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  No se encontraron fichas RIB.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Página {currentPage} de {totalPages}</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RibTable;