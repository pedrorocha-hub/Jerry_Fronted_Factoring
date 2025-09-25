import React, { useState } from 'react';
import { Edit, Trash2, Download, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { useSession } from '@/contexts/SessionContext';

interface SolicitudOperacionWithDetails extends SolicitudOperacion {
  nombre_empresa?: string;
  creator_name?: string;
}

interface SolicitudOperacionTableProps {
  solicitudes: SolicitudOperacionWithDetails[];
  onEdit: (solicitud: SolicitudOperacion) => void;
  onDelete: (solicitud: SolicitudOperacion) => void;
  onDownload: (solicitud: SolicitudOperacion) => void;
}

const SolicitudOperacionTable: React.FC<SolicitudOperacionTableProps> = ({ solicitudes, onEdit, onDelete, onDownload }) => {
  const { isAdmin } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [solicitudToDownload, setSolicitudToDownload] = useState<SolicitudOperacion | null>(null);
  const itemsPerPage = 10;

  const filteredSolicitudes = (solicitudes || []).filter(solicitud =>
    solicitud.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitud.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSolicitudes.length / itemsPerPage);
  const paginatedSolicitudes = filteredSolicitudes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-400 border border-green-500/20">Completado</Badge>;
      case 'in_review':
        return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">En Revisión</Badge>;
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
              <TableHead className="text-gray-300">Empresa</TableHead>
              <TableHead className="text-gray-300">Ejecutivo</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSolicitudes.length > 0 ? (
              paginatedSolicitudes.map((solicitud) => (
                <TableRow key={solicitud.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <code className="font-mono text-sm text-white bg-gray-900/50 px-2 py-1 rounded w-fit">{solicitud.ruc}</code>
                      <span className="text-xs text-gray-400 mt-1 max-w-[250px] truncate" title={solicitud.nombre_empresa}>
                        {solicitud.nombre_empresa}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300">{solicitud.creator_name}</span>
                      <span className="text-xs text-gray-400">
                        {solicitud.created_at ? new Date(solicitud.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(solicitud.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setSolicitudToDownload(solicitud)} title="Descargar PDF" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        <Download className="h-4 w-4" />
                      </Button>
                      {isAdmin ? (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(solicitud)} title="Editar" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => onEdit(solicitud)} title="Ver Detalles" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => onDelete(solicitud)} title="Eliminar" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                  No se encontraron solicitudes de operación.
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

      <AlertDialog open={!!solicitudToDownload} onOpenChange={(open) => !open && setSolicitudToDownload(null)}>
        <AlertDialogContent className="bg-[#121212] border border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar Descarga</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              ¿Está seguro de que desea generar y descargar el PDF para la solicitud de la empresa con RUC {solicitudToDownload?.ruc}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (solicitudToDownload) {
                  onDownload(solicitudToDownload);
                }
              }} 
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
            >
              Descargar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SolicitudOperacionTable;