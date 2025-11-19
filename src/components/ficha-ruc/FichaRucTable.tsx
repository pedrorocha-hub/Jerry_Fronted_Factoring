import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Download,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FichaRuc } from '@/types/ficha-ruc';
import FichaRucAuditLogViewer from '@/components/audit/FichaRucAuditLogViewer';

interface FichaRucTableProps {
  fichas: FichaRuc[];
  onViewFicha: (ficha: FichaRuc) => void;
  onEditFicha: (ficha: FichaRuc) => void;
  onExportFicha: (ficha: FichaRuc) => void;
  onRefresh?: () => void;
}

const FichaRucTable: React.FC<FichaRucTableProps> = ({
  fichas,
  onViewFicha,
  onEditFicha,
  onExportFicha,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFichas = fichas.filter(ficha => {
    const matchesSearch = 
      ficha.ruc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ficha.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ficha.actividad_empresa && ficha.actividad_empresa.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ficha.estado_contribuyente === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredFichas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFichas = filteredFichas.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (estado?: string) => {
    if (!estado) return null;
    
    const isActive = estado.toLowerCase().includes('activo');
    return (
      <Badge 
        className={
          isActive 
            ? 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20' 
            : 'bg-gray-800 text-gray-300 border border-gray-700'
        }
      >
        {estado}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por RUC, nombre de empresa o actividad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#121212] border-gray-800">
            <SelectItem value="all" className="text-white hover:bg-gray-800">Todos los estados</SelectItem>
            <SelectItem value="Activo" className="text-white hover:bg-gray-800">Activo</SelectItem>
            <SelectItem value="Inactivo" className="text-white hover:bg-gray-800">Inactivo</SelectItem>
            <SelectItem value="Suspendido" className="text-white hover:bg-gray-800">Suspendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">RUC</TableHead>
              <TableHead className="text-gray-300">Nombre de Empresa</TableHead>
              <TableHead className="text-gray-300">Actividad</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-gray-300">Representante Legal</TableHead>
              <TableHead className="text-gray-300">Fecha de Registro</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFichas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p>No se encontraron fichas RUC</p>
                  <p className="text-sm">Los documentos procesados aparecerán aquí</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedFichas.map((ficha) => (
                <TableRow key={ficha.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell className="font-mono font-medium text-white">{ficha.ruc}</TableCell>
                  <TableCell>
                    <div className="font-medium text-white">{ficha.nombre_empresa}</div>
                    {ficha.domicilio_fiscal && (
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {ficha.domicilio_fiscal}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs truncate text-gray-300">
                      {ficha.actividad_empresa || 'No especificada'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ficha.estado_contribuyente)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-300">
                      {ficha.nombre_representante_legal || 'No especificado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-300">
                      {new Date(ficha.created_at).toLocaleDateString('es-ES')}
                    </div>
                    {ficha.fecha_inicio_actividades && (
                      <div className="text-xs text-gray-500">
                        Inicio: {new Date(ficha.fecha_inicio_actividades).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewFicha(ficha)}
                        title="Ver detalles"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditFicha(ficha)}
                        title="Editar"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <FichaRucAuditLogViewer ruc={ficha.ruc} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExportFicha(ficha)}
                        title="Exportar"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredFichas.length)} de {filteredFichas.length} fichas RUC
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={currentPage === page 
                  ? "bg-[#00FF80] text-black hover:bg-[#00FF80]/90" 
                  : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
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

export default FichaRucTable;