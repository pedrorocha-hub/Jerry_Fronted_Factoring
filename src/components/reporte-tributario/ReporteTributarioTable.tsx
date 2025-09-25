import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Building2,
  TrendingUp,
  TrendingDown
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
import { ReporteTributarioWithFicha } from '@/types/reporte-tributario';
import { useSession } from '@/contexts/SessionContext';

interface ReporteTributarioTableProps {
  reportes: ReporteTributarioWithFicha[];
  onViewReporte: (reporte: ReporteTributarioWithFicha) => void;
  onEditReporte: (reporte: ReporteTributarioWithFicha) => void;
  onDeleteReporte: (reporte: ReporteTributarioWithFicha) => void;
}

const ReporteTributarioTable: React.FC<ReporteTributarioTableProps> = ({
  reportes,
  onViewReporte,
  onEditReporte,
  onDeleteReporte,
}) => {
  const { isAdmin } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Validar que reportes sea un array
  const safeReportes = Array.isArray(reportes) ? reportes : [];
  console.log('ReporteTributarioTable: Rendering with', safeReportes.length, 'reportes');
  console.log('Sample reporte structure:', safeReportes[0]);

  // Función helper para obtener el año del reporte
  const getYear = (reporte: ReporteTributarioWithFicha) => {
    return reporte.año_reporte || reporte.anio_reporte || reporte.ano_reporte || reporte.year || null;
  };

  // Función helper para obtener ingresos
  const getIngresos = (reporte: ReporteTributarioWithFicha) => {
    return reporte.ingresos_netos || reporte.ingresos || null;
  };

  // Función helper para obtener utilidad neta
  const getUtilidadNeta = (reporte: ReporteTributarioWithFicha) => {
    return reporte.utilidad_neta || reporte.utilidad || null;
  };

  // Función helper para obtener utilidad bruta
  const getUtilidadBruta = (reporte: ReporteTributarioWithFicha) => {
    return reporte.utilidad_bruta || null;
  };

  // Función helper para obtener utilidad operativa
  const getUtilidadOperativa = (reporte: ReporteTributarioWithFicha) => {
    return reporte.utilidad_operativa || null;
  };

  // Filtrar reportes
  const filteredReportes = safeReportes.filter(reporte => {
    const year = getYear(reporte);
    const matchesSearch = 
      (year && year.toString().includes(searchTerm)) ||
      (reporte.ficha_ruc?.nombre_empresa && reporte.ficha_ruc.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reporte.ficha_ruc?.ruc && reporte.ficha_ruc.ruc.includes(searchTerm)) ||
      (reporte.id && reporte.id.toString().includes(searchTerm));
    
    return matchesSearch;
  });

  // Paginación
  const totalPages = Math.ceil(filteredReportes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReportes = filteredReportes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUtilidadBadge = (utilidad?: number | null) => {
    if (utilidad === null || utilidad === undefined) {
      return (
        <Badge className="bg-gray-800 text-gray-300 border border-gray-700">
          N/A
        </Badge>
      );
    }

    if (utilidad > 0) {
      return (
        <Badge className="bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20">
          <TrendingUp className="h-3 w-3 mr-1" />
          Positiva
        </Badge>
      );
    } else if (utilidad < 0) {
      return (
        <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">
          <TrendingDown className="h-3 w-3 mr-1" />
          Negativa
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-800 text-gray-300 border border-gray-700">
          Neutral
        </Badge>
      );
    }
  };

  const getRatioColor = (ratio?: number | null, type: 'endeudamiento' | 'liquidez') => {
    if (ratio === null || ratio === undefined) return 'text-gray-400';
    
    if (type === 'endeudamiento') {
      if (ratio < 0.3) return 'text-[#00FF80]'; // Bajo endeudamiento (bueno)
      if (ratio < 0.6) return 'text-yellow-400'; // Medio
      return 'text-red-400'; // Alto endeudamiento (malo)
    } else { // liquidez
      if (ratio > 1.5) return 'text-[#00FF80]'; // Buena liquidez
      if (ratio > 1.0) return 'text-yellow-400'; // Aceptable
      return 'text-red-400'; // Baja liquidez
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por año, empresa, RUC o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
          />
        </div>
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray-600 p-2 bg-gray-900/30 rounded">
        Debug: {safeReportes.length} reportes total, {filteredReportes.length} filtrados
        {safeReportes.length > 0 && (
          <div className="mt-1">
            Estructura del primer reporte: {JSON.stringify(Object.keys(safeReportes[0]), null, 2)}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">ID</TableHead>
              <TableHead className="text-gray-300">Año</TableHead>
              <TableHead className="text-gray-300">Empresa</TableHead>
              <TableHead className="text-gray-300">Ingresos</TableHead>
              <TableHead className="text-gray-300">Utilidad</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReportes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p>No se encontraron reportes tributarios</p>
                  <p className="text-sm">Los reportes procesados aparecerán aquí</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedReportes.map((reporte) => {
                const year = getYear(reporte);
                const ingresos = getIngresos(reporte);
                const utilidadNeta = getUtilidadNeta(reporte);
                const utilidadBruta = getUtilidadBruta(reporte);
                const utilidadOperativa = getUtilidadOperativa(reporte);

                return (
                  <TableRow key={reporte.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <TableCell>
                      <div className="font-mono text-sm text-[#00FF80]">#{reporte.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-[#00FF80] text-lg">{year || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm text-white">
                            {reporte.ficha_ruc?.nombre_empresa || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            RUC: {reporte.ficha_ruc?.ruc || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-white">
                        {formatCurrency(ingresos)}
                      </div>
                      {utilidadBruta !== null && utilidadBruta !== undefined && (
                        <div className="text-xs text-gray-400">
                          Bruta: {formatCurrency(utilidadBruta)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm text-white">
                        {formatCurrency(utilidadNeta)}
                      </div>
                      {utilidadOperativa !== null && utilidadOperativa !== undefined && (
                        <div className="text-xs text-gray-400">
                          Operativa: {formatCurrency(utilidadOperativa)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getUtilidadBadge(utilidadNeta)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewReporte(reporte)}
                          title="Ver detalles"
                          className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditReporte(reporte)}
                              title="Editar"
                              className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteReporte(reporte)}
                              title="Eliminar"
                              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReportes.length)} de {filteredReportes.length} reportes tributarios
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

export default ReporteTributarioTable;