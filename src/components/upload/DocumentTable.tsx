import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Download
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
import { Documento } from '@/types/documento';
import DocumentDetailView from './DocumentDetailView';
import { useSession } from '@/contexts/SessionContext';
import { DocumentoService } from '@/services/documentoService';
import { showSuccess, showError } from '@/utils/toast';

interface DocumentTableProps {
  documentos: Documento[];
  onDeleteDocumento: (documento: Documento) => void;
  onReprocessDocumento: (documento: Documento) => void;
  onRefresh: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  'ficha_ruc': { label: 'Ficha RUC', icon: '📋' },
  'representante_legal': { label: 'Representante Legal', icon: '👤' },
  'cuenta_bancaria': { label: 'Cuenta Bancaria', icon: '🏦' },
  'eeff': { label: 'EEFF (Declaración Jurada)', icon: '🧾' },
  'factura_negociar': { label: 'Factura a Negociar', icon: '💰' },
  'reporte_tributario': { label: 'Reporte Tributario', icon: '📊' },
  'sentinel': { label: 'Sentinel', icon: '🛡️' },
  'sustentos': { label: 'Sustentos / Evidencia', icon: '📎' },
  'evidencia_visita': { label: 'Evidencia Visita', icon: '📸' },
  'vigencia_poder': { label: 'Vigencia Poder', icon: '📜' },
};

const DocumentTable: React.FC<DocumentTableProps> = ({
  documentos,
  onDeleteDocumento,
  onReprocessDocumento,
  onRefresh
}) => {
  const { isAdmin } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);
  const itemsPerPage = 10;

  // Filtrar documentos para la vista general
  const visibleDocumentos = documentos.filter(doc => {
    // 1. Ocultar documentos vinculados a una solicitud específica
    if (doc.solicitud_id) return false;

    // 2. Ocultar tipos de documentos que son puramente operativos/evidencias
    // Estos solo deberían verse en el detalle de la solicitud
    const hiddenTypes = ['sustentos', 'evidencia_visita', 'vigencia_poder', 'factura_negociar'];
    if (hiddenTypes.includes(doc.tipo)) return false;

    return true;
  });

  // Obtener estados únicos para el filtro (solo de los visibles)
  const uniqueStatuses = Array.from(new Set(
    visibleDocumentos.map(doc => doc.estado).filter(estado => estado)
  )).sort();

  // Obtener tipos únicos para el filtro (solo de los visibles)
  const uniqueTypes = Array.from(new Set(
    visibleDocumentos.map(doc => doc.tipo).filter(tipo => tipo)
  )).sort();

  // Filtrar documentos visibles según criterios del usuario
  const filteredDocumentos = visibleDocumentos.filter(documento => {
    const matchesSearch = 
      (documento.nombre_archivo && documento.nombre_archivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      documento.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.storage_path.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || documento.estado === statusFilter;
    const matchesType = typeFilter === 'all' || documento.tipo === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Paginación
  const totalPages = Math.ceil(filteredDocumentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocumentos = filteredDocumentos.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDownload = async (documento: Documento) => {
    try {
      const url = await DocumentoService.getSignedUrl(documento.storage_path);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nombre_archivo || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      showError('Error al descargar el archivo');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'pending': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      'processing': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'completed': 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20',
      'error': 'bg-red-500/10 text-red-400 border border-red-500/20',
    };

    const labels = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'completed': 'Completado',
      'error': 'Error',
    };

    const icons = {
      'pending': <Clock className="h-3 w-3 mr-1" />,
      'processing': <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
      'completed': <CheckCircle className="h-3 w-3 mr-1" />,
      'error': <AlertCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge className={variants[estado as keyof typeof variants] || variants.pending}>
        <div className="flex items-center">
          {icons[estado as keyof typeof icons]}
          <span>{labels[estado as keyof typeof labels] || estado}</span>
        </div>
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre de archivo o ID..."
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
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status} className="text-white hover:bg-gray-800">
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent className="bg-[#121212] border-gray-800">
              <SelectItem value="all" className="text-white hover:bg-gray-800">Todos los tipos</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-white hover:bg-gray-800">
                  {DOCUMENT_TYPE_LABELS[type]?.label || type}
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
                <TableHead className="text-gray-300">ID</TableHead>
                <TableHead className="text-gray-300">Archivo</TableHead>
                <TableHead className="text-gray-300">Tipo</TableHead>
                <TableHead className="text-gray-300">Estado</TableHead>
                <TableHead className="text-gray-300">Tamaño</TableHead>
                <TableHead className="text-gray-300">Fecha</TableHead>
                <TableHead className="text-right text-gray-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDocumentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p>No se encontraron documentos</p>
                    <p className="text-sm">Los documentos subidos aparecerán aquí</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocumentos.map((documento) => (
                  <TableRow key={documento.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                    <TableCell>
                      <div className="font-mono text-xs text-gray-400 truncate max-w-[100px]">
                        {documento.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-[#00FF80] flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-white" title={documento.nombre_archivo || 'Sin nombre'}>
                            {documento.nombre_archivo || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-gray-500 truncate" title={documento.storage_path}>
                            {documento.storage_path}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {DOCUMENT_TYPE_LABELS[documento.tipo]?.icon || '📄'}
                        </span>
                        <span className="text-sm text-white">
                          {DOCUMENT_TYPE_LABELS[documento.tipo]?.label || documento.tipo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(documento.estado)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-300">
                        {formatFileSize(documento.tamaño_archivo)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {new Date(documento.created_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocument(documento)}
                          title="Ver detalles"
                          className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(documento)}
                          title="Descargar"
                          className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {isAdmin && documento.estado === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReprocessDocumento(documento)}
                            title="Reprocesar"
                            className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteDocumento(documento)}
                            title="Eliminar"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredDocumentos.length)} de {filteredDocumentos.length} documentos
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

        {/* Error messages */}
        {filteredDocumentos.some(doc => doc.estado === 'error') && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Algunos documentos tienen errores de procesamiento
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Usa el botón de reprocesar para intentar nuevamente
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedDocument && (
        <DocumentDetailView
          documento={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onUpdate={() => {
            onRefresh();
            setSelectedDocument(null);
          }}
        />
      )}
    </>
  );
};

export default DocumentTable;