import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Building2,
  Calendar,
  DollarSign,
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
import { FacturaNegociarWithFicha } from '@/types/factura-negociar';
import { useSession } from '@/contexts/SessionContext';

interface FacturaNegociarTableProps {
  facturas: FacturaNegociarWithFicha[];
  onViewFactura: (factura: FacturaNegociarWithFicha) => void;
  onEditFactura: (factura: FacturaNegociarWithFicha) => void;
  onDeleteFactura: (factura: FacturaNegociarWithFicha) => void;
  onNegociarFactura: (factura: FacturaNegociarWithFicha) => void;
}

const FacturaNegociarTable: React.FC<FacturaNegociarTableProps> = ({
  facturas,
  onViewFactura,
  onEditFactura,
  onDeleteFactura,
  onNegociarFactura,
}) => {
  const { isAdmin } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Obtener estados únicos para el filtro
  const uniqueEstados = Array.from(new Set(
    facturas
      .map(factura => factura.estado_negociacion)
      .filter(estado => estado && estado.trim() !== '')
  )).sort();

  // Filtrar facturas
  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = 
      factura.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (factura.ficha_ruc?.nombre_empresa && factura.ficha_ruc.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (factura.ficha_ruc?.ruc && factura.ficha_ruc.ruc.includes(searchTerm));
    
    const matchesEstado = estadoFilter === 'all' || factura.estado_negociacion === estadoFilter;
    
    return matchesSearch && matchesEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredFacturas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFacturas = filteredFacturas.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getEstadoBadge = (estado: string, fechaVencimiento?: string) => {
    let variant = '';
    let icon = null;

    // Verificar si está próximo a vencer (30 días)
    const isProximoAVencer = fechaVencimiento && estado === 'Pendiente' && 
      new Date(fechaVencimiento) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    switch (estado) {
      case 'Pendiente':
        variant = isProximoAVencer 
          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
        if (isProximoAVencer) {
          icon = <AlertTriangle className="h-3 w-3 mr-1" />;
        }
        break;
      case 'Negociada':
        variant = 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20';
        break;
      case 'Vencida':
        variant = 'bg-red-500/10 text-red-400 border border-red-500/20';
        break;
      default:
        variant = 'bg-gray-800 text-gray-300 border border-gray-700';
    }

    return (
      <Badge className={variant}>
        <div className="flex items-center">
          {icon}
          <span>{isProximoAVencer ? 'Próxima a vencer' : estado}</span>
        </div>
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="space-y-4 bg-[#121212] p-6 rounded-lg border border-gray-800">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por número de factura, empresa o RUC..."
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
      </div>

      {/* Tabla */}
      <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">Número Factura</TableHead>
              <TableHead className="text-gray-300">Empresa</TableHead>
              <TableHead className="text-gray-300">Fechas</TableHead>
              <TableHead className="text-gray-300">Monto Total</TableHead>
              <TableHead className="text-gray-300">Estado</TableHead>
              <TableHead className="text-gray-300">Negociación</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFacturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  <Receipt className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p>No se encontraron facturas a negociar</p>
                  <p className="text-sm">Las facturas procesadas aparecerán aquí</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedFacturas.map((factura) => (
                <TableRow key={factura.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell>
                    <div className="font-mono font-medium text-white">{factura.numero_factura}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm text-white">
                          {factura.ficha_ruc?.nombre_empresa || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          RUC: {factura.ficha_ruc?.ruc || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-300">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>Emisión: {formatDate(factura.fecha_emision)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-300">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>Vencimiento: {formatDate(factura.fecha_vencimiento)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-white">
                        {formatCurrency(factura.monto_total)}
                      </div>
                      {factura.monto_igv && (
                        <div className="text-xs text-gray-400">
                          IGV: {formatCurrency(factura.monto_igv)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getEstadoBadge(factura.estado_negociacion, factura.fecha_vencimiento)}
                  </TableCell>
                  <TableCell>
                    {factura.estado_negociacion === 'Negociada' && factura.monto_negociado ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#00FF80]">
                          {formatCurrency(factura.monto_negociado)}
                        </div>
                        {factura.fecha_negociacion && (
                          <div className="text-xs text-gray-400">
                            {formatDate(factura.fecha_negociacion)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewFactura(factura)}
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
                            onClick={() => onEditFactura(factura)}
                            title="Editar"
                            className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {factura.estado_negociacion === 'Pendiente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onNegociarFactura(factura)}
                              title="Negociar"
                              className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteFactura(factura)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredFacturas.length)} de {filteredFacturas.length} facturas
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

export default FacturaNegociarTable;