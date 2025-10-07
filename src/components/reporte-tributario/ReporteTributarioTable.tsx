import React, { useState } from 'react';
import { 
  Search, 
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

  const safeReportes = Array.isArray(reportes) ? reportes : [];

  const filteredReportes = safeReportes.filter(reporte => {
    const matchesSearch = 
      (reporte.anio_reporte && reporte.anio_reporte.toString().includes(searchTerm)) ||
      (reporte.ficha_ruc?.nombre_empresa && reporte.ficha_ruc.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reporte.ficha_ruc?.ruc && reporte.ficha_ruc.ruc.includes(searchTerm));
    
    return matchesSearch;
  });

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
      return <Badge className="bg-gray-800 text-gray-300 border border-gray-700">N/A</Badge>;
    }
    if (utilidad > 0) {
      return <Badge className="bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20"><TrendingUp className="h-3 w-3 mr-1" />Positiva</Badge>;
    } else if (utilidad < 0) {
      return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20"><TrendingDown className="h-3 w-3 mr-1" />Negativa</Badge>;
    } else {
      return <Badge className="bg-gray-800 text-gray-300 border border-gray-700">Neutral</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por año, empresa o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
          />
        </div>
      </div>

      <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">Año</TableHead>
              <TableHead className="text-gray-300">Empresa</TableHead>
              <TableHead className="text-gray-300">Ingresos Netos</TableHead>
              <TableHead className="text-gray-300">Utilidad Neta</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReportes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p>No se encontraron reportes tributarios</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedReportes.map((reporte) => (
                <TableRow key={reporte.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-[#00FF80] text-lg">{reporte.anio_reporte || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm text-white">{reporte.ficha_ruc?.nombre_empresa || 'N/A'}</div>
                        <div className="text-xs text-gray-500 font-mono">RUC: {reporte.ficha_ruc?.ruc || 'N/A'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm text-white">{formatCurrency(reporte.renta_ingresos_netos)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-sm text-white">{formatCurrency(reporte.renta_resultado_antes_participaciones)}</div>
                  </TableCell>
                  <TableCell>
                    {getUtilidadBadge(reporte.renta_resultado_antes_participaciones)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewReporte(reporte)} title="Ver detalles" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"><Eye className="h-4 w-4" /></Button>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => onEditReporte(reporte)} title="Editar" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => onDeleteReporte(reporte)} title="Eliminar" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredReportes.length)} de {filteredReportes.length} reportes
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-gray-400">Página {currentPage} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteTributarioTable;