import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, Copy, FileSearch } from 'lucide-react';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { useSession } from '@/contexts/SessionContext';
import { showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

interface SolicitudOperacionWithDetails extends SolicitudOperacion {
  nombre_empresa?: string;
  creator_name?: string;
  deudor_nombre?: string;
  deudor_ruc?: string;
  tipo_operacion?: string;
  tipo_producto?: string;
}

interface SolicitudOperacionTableProps {
  solicitudes: SolicitudOperacionWithDetails[];
  onEdit: (solicitud: SolicitudOperacion) => void;
  onDelete: (solicitud: SolicitudOperacion) => void;
}

const getStatusColor = (status: string | null | undefined) => {
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

const getProductBadgeColor = (tipo: string | undefined) => {
  switch (tipo) {
    case 'CONFIRMING':
      return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
    case 'LINEA':
      return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    case 'FACTORING':
    default:
      return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
  }
};

const SolicitudOperacionTable: React.FC<SolicitudOperacionTableProps> = ({ solicitudes, onEdit, onDelete }) => {
  const { isAdmin } = useSession();
  const navigate = useNavigate();

  const handleEdit = (solicitud: SolicitudOperacion) => {
    navigate(`/solicitudes-operacion/edit/${solicitud.id}`);
  };

  const handleGoToRib = (solicitud: SolicitudOperacion) => {
    // Navegar a la página de RIB pasando el ID de solicitud y el RUC como parámetros
    navigate(`/rib?solicitud_id=${solicitud.id}&ruc=${solicitud.ruc}`);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">ID Solicitud</TableHead>
            <TableHead className="text-gray-300">Tipo</TableHead>
            <TableHead className="text-gray-300">RUC</TableHead>
            <TableHead className="text-gray-300">Proveedor</TableHead>
            <TableHead className="text-gray-300">Deudor</TableHead>
            <TableHead className="text-gray-300">Estado</TableHead>
            <TableHead className="text-gray-300">Fecha</TableHead>
            <TableHead className="text-right text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitudes.map((solicitud) => (
            <TableRow key={solicitud.id} className="border-gray-800 hover:bg-gray-900/50">
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(solicitud.id);
                    showSuccess('ID de solicitud copiado al portapapeles');
                  }}
                  className="font-mono text-white text-xs hover:bg-[#00FF80]/10 hover:text-[#00FF80] flex items-center gap-2"
                  title="Copiar ID completo"
                >
                  {solicitud.id.substring(0, 8)}...
                  <Copy className="h-3 w-3" />
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1.5 items-start">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider border px-2 py-0.5 rounded-md w-fit ${getProductBadgeColor(solicitud.tipo_producto)}`}>
                    {solicitud.tipo_producto || 'FACTORING'}
                  </span>
                  <span className="text-xs text-gray-400 pl-0.5">
                    {solicitud.tipo_operacion || 'PUNTUAL'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-white">{solicitud.ruc}</TableCell>
              <TableCell className="text-white">{solicitud.nombre_empresa}</TableCell>
              <TableCell>
                <div className="font-medium text-white">{solicitud.deudor_nombre}</div>
                {solicitud.deudor_ruc && (
                  <div className="text-sm text-gray-400 font-mono">{solicitud.deudor_ruc}</div>
                )}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(solicitud.status)}`}>
                  {solicitud.status || 'Borrador'}
                </span>
              </TableCell>
              <TableCell className="text-gray-400">
                <div className="flex items-center text-xs">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {new Date(solicitud.created_at).toLocaleDateString('es-ES')}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleGoToRib(solicitud)} 
                    className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10" 
                    title="Generar/Ver RIB"
                  >
                    <FileSearch className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(solicitud)} className="text-gray-400 hover:text-white" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(solicitud)} className="text-gray-400 hover:text-red-500" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SolicitudOperacionTable;