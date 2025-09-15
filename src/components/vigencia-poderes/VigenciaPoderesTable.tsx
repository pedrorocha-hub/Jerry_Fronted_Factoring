import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Scale,
  Building2,
  Calendar,
  AlertTriangle
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
import { VigenciaPoderesWithRepresentante } from '@/types/vigencia-poderes';

interface VigenciaPoderesTableProps {
  vigencias: VigenciaPoderesWithRepresentante[];
  onViewVigencia: (vigencia: VigenciaPoderesWithRepresentante) => void;
  onEditVigencia: (vigencia: VigenciaPoderesWithRepresentante) => void;
  onDeleteVigencia: (vigencia: VigenciaPoderesWithRepresentante) => void;
}

const VigenciaPoderesTable: React.FC<VigenciaPoderesTableProps> = ({
  vigencias,
  onViewVigencia,
  onEditVigencia,
  onDeleteVigencia,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener estados únicos para el filtro
  const uniqueEstados = Array.from(new Set(
    vigencias
      .map(vigencia => vigencia.estado)
      .filter(estado => estado && estado.trim() !== '')
  )).sort();

  // Obtener tipos únicos para el filtro
  const uniqueTipos = Array.from(new Set(
    vigencias
      .map(vigencia => vigencia.tipo_poder)
      .filter(tipo => tipo && tipo.trim() !== '')
  )).sort();

  // Filtrar vigencias
  const filteredVigencias = vigencias.filter(vigencia => {
    const matchesSearch = 
      (vigencia.tipo_poder && vigencia.tipo_poder.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vigencia.alcance_poderes && vigencia.alcance_poderes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vigencia.representante_legal?.nombre_completo && vigencia.representante_legal.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vigencia.representante_legal?.ficha_ruc?.nombre_empresa && vigencia.representante_legal.ficha_ruc.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vigencia.representante_legal?.ficha_ruc?.ruc && vigencia.representante_legal.ficha_ruc.ruc.includes(searchTerm));
    
    const matchesEstado = estadoFilter === 'all' || vigencia.estado === estadoFilter;
    const matchesTipo = tipoFilter === 'all' || vigencia.tipo_poder === tipoFilter;
    
    return matchesSearch && matchesEstado && matchesTipo;
  });

  // Paginación
  const totalPages = Math.ceil(filteredVigencias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVigencias = filteredVigencias.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getEstadoBadge = (estado: string, fechaFin?: string) => {
    let variant = '';
    let icon = null;

    // Verificar si está próximo a vencer (30 días)
    const isProximoAVencer = fechaFin && estado === 'Vigente' && 
      new Date(fechaFin) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    switch (estado) {
      case 'Vigente':
        variant = isProximoAVencer 
          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
          : 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20';
        if (isProximoAVencer) {
          icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        }
        break;
      case 'Vencido':
        variant = 'bg-red-500/10 text-red-400 border border-red-500/20';
        break;
      case 'Revocado':
        variant = 'bg-gray-800 text-gray-300 border border-gray-700';
        break;
      default:
        variant = 'bg-gray-800 text-gray-300 border border-gray-700';
    }

    return (
      <Badge className={variant}>
        <div className="flex items-center">
          {icon}
          <span>{isProximoAVencer ? 'Próximo a vencer' : estado}</span>
        </div>
      </Badge>
    );
  };

  const getTipoPowerBadge = (tipo?: string) => {
    if (!tipo) return null;
    
    const variants = {
      'General': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'Especial': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      'Administrativo': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'Judicial': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      'Otros': 'bg-gray-800 text-gray-300 border border-gray-700',
    };

    return (
      <Badge className={variants[tipo as keyof typeof variants] || variants.Otros}>
        {tipo}
      </Badge>
    );
  };

  const formatDateRange = (fechaInicio?: string, fechaFin?: string) => {
    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');
    
    if (fechaInicio && fechaFin) {
      return `${formatDate(fechaInicio)} - ${formatDate(fechaFin)}`;
    } else if (fechaInicio) {
      return `Desde ${formatDate(fechaInicio)}`;
    } else if (fechaFin) {
      return `Hasta ${formatDate(fechaFin)}`;
    }
    return 'No especificado';
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por tipo, alcance, representante o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
          />
        </div>
        
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-[#121212] border-gray-800">
            <SelectItem value="all" className="text-white hover:bg-gray-800">Todos los estados</SelectItem>
            {uniqueEstados.map((estado) => (
              <SelectItem key={estado} value={estado} className="text-white hover:bg-gray-800">
                {estado}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent className="bg-[#121212] border-gray-800">
            <SelectItem value="all" className="text-white hover:bg-gray-800">Todos los tipos</SelectItem>
            {uniqueTipos.map((tipo) => (
              <SelectItem key={tipo} value={tipo} className="text-white hover:bg-gray-800">
                {tipo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">Representante Legal</TableHead>
              <TableHead className="text-gray-300">Tipo de Poder</TableHead>
              <TableHead className="text-gray-300">Vigencia</TableHead>
              <TableHead className="text-gray-300">Alcance</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-gray-300">Empresa</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVigencias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  <Scale className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p>No se encontraron vigencias de poderes</p>
                  <p className="text-sm">Las vigencias procesadas aparecerán aquí</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedVigencias.map((vigencia) => (
                <TableRow key={vigencia.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell>
                    <div className="font-medium text-white">{vigencia.representante_legal?.nombre_completo || 'N/A'}</div>
                    <div className="text-sm text-gray-400">
                      {vigencia.representante_legal?.numero_documento_identidad || 'N/A'}
                    </div>
                    {vigencia.representante_legal?.cargo && (
                      <div className="text-xs text-gray-500">
                        {vigencia.representante_legal.cargo}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getTipoPowerBadge(vigencia.tipo_poder)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-gray-300">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{formatDateRange(vigencia.fecha_inicio_vigencia, vigencia.fecha_fin_vigencia)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs truncate text-gray-300">
                      {vigencia.alcance_poderes || 'No especificado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getEstadoBadge(vigencia.estado, vigencia.fecha_fin_vigencia)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm text-white">
                          {vigencia.representante_legal?.ficha_ruc?.nombre_empresa || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          RUC: {vigencia.representante_legal?.ficha_ruc?.ruc || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewVigencia(vigencia)}
                        title="Ver detalles"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditVigencia(vigencia)}
                        title="Editar"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteVigencia(vigencia)}
                        title="Eliminar"
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
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
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredVigencias.length)} de {filteredVigencias.length} vigencias de poderes
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

export default VigenciaPoderesTable;