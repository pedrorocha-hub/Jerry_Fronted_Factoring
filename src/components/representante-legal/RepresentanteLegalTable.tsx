import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
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
import { RepresentanteLegalWithFicha } from '@/types/representante-legal';

interface RepresentanteLegalTableProps {
  representantes: RepresentanteLegalWithFicha[];
  onViewRepresentante: (representante: RepresentanteLegalWithFicha) => void;
  onEditRepresentante: (representante: RepresentanteLegalWithFicha) => void;
  onDeleteRepresentante: (representante: RepresentanteLegalWithFicha) => void;
}

const RepresentanteLegalTable: React.FC<RepresentanteLegalTableProps> = ({
  representantes,
  onViewRepresentante,
  onEditRepresentante,
  onDeleteRepresentante,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Validar que representantes sea un array
  const safeRepresentantes = Array.isArray(representantes) ? representantes : [];

  // Obtener cargos únicos para el filtro
  const uniqueCargos = Array.from(new Set(
    safeRepresentantes
      .map(rep => rep.cargo)
      .filter(cargo => cargo && cargo.trim() !== '')
  )).sort();

  // Filtrar representantes
  const filteredRepresentantes = safeRepresentantes.filter(representante => {
    const matchesSearch = 
      representante.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      representante.numero_documento_identidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (representante.cargo && representante.cargo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (representante.ficha_ruc?.nombre_empresa && representante.ficha_ruc.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (representante.ficha_ruc?.ruc && representante.ficha_ruc.ruc.includes(searchTerm));
    
    const matchesCargo = cargoFilter === 'all' || representante.cargo === cargoFilter;
    
    return matchesSearch && matchesCargo;
  });

  // Paginación
  const totalPages = Math.ceil(filteredRepresentantes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRepresentantes = filteredRepresentantes.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getDocumentTypeBadge = (documento: string) => {
    if (!documento) return null;
    
    const isDNI = documento.length === 8 && /^\d+$/.test(documento);
    const isCE = documento.length > 8;
    
    return (
      <Badge 
        className={
          isDNI 
            ? 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20' 
            : isCE 
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            : 'bg-gray-800 text-gray-300 border border-gray-700'
        }
      >
        {isDNI ? 'DNI' : isCE ? 'CE' : 'DOC'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 p-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, documento, cargo o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
          />
        </div>
        
        <Select value={cargoFilter} onValueChange={setCargoFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por cargo" />
          </SelectTrigger>
          <SelectContent className="bg-[#121212] border-gray-800">
            <SelectItem value="all" className="text-white hover:bg-gray-800">Todos los cargos</SelectItem>
            {uniqueCargos.map((cargo) => (
              <SelectItem key={cargo} value={cargo} className="text-white hover:bg-gray-800">
                {cargo}
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
              <TableHead className="text-gray-300">Nombre Completo</TableHead>
              <TableHead className="text-gray-300">Documento</TableHead>
              <TableHead className="text-gray-300">Cargo</TableHead>
              <TableHead className="text-gray-300">Empresa</TableHead>
              <TableHead className="text-gray-300">Estado Civil</TableHead>
              <TableHead className="text-gray-300">Vigencia</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRepresentantes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p>No se encontraron representantes legales</p>
                  <p className="text-sm">Los representantes procesados aparecerán aquí</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRepresentantes.map((representante) => (
                <TableRow key={representante.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell>
                    <div className="font-medium text-white">{representante.nombre_completo || 'N/A'}</div>
                    {representante.domicilio && (
                      <div className="text-sm text-gray-400 truncate max-w-xs">
                        {representante.domicilio}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-white">{representante.numero_documento_identidad || 'N/A'}</span>
                      {getDocumentTypeBadge(representante.numero_documento_identidad)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-white">
                      {representante.cargo || 'No especificado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm text-white">
                          {representante.ficha_ruc?.nombre_empresa || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          RUC: {representante.ficha_ruc?.ruc || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-white">
                      {representante.estado_civil || 'No especificado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-white">
                      {representante.vigencia_poderes || 'No especificada'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewRepresentante(representante)}
                        title="Ver detalles"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditRepresentante(representante)}
                        title="Editar"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRepresentante(representante)}
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
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredRepresentantes.length)} de {filteredRepresentantes.length} representantes legales
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

export default RepresentanteLegalTable;