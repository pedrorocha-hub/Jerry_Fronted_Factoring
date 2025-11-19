import React from 'react';
import { FileText, Calendar, Tag, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Documento } from '@/types/documento';

interface RecentDocumentsTableProps {
  documents: Documento[];
  loading?: boolean;
  onRefresh?: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  'ficha_ruc': { label: 'Ficha RUC', icon: '📋' },
  'representante_legal': { label: 'Documento Representante Legal', icon: '👤' },
  'cuenta_bancaria': { label: 'Información Cuenta Bancaria', icon: '🏦' },
  'vigencia_poderes': { label: 'Vigencia de Poderes', icon: '⚖️' },
  'factura_negociar': { label: 'Factura a Negociar', icon: '💰' },
  'reporte_tributario': { label: 'Reporte Tributario', icon: '📊' },
  'sentinel': { label: 'Sentinel', icon: '🛡️' },
};

const RecentDocumentsTable: React.FC<RecentDocumentsTableProps> = ({ 
  documents, 
  loading = false,
  onRefresh
}) => {
  const getEstadoBadge = (estado: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'error': 'bg-red-100 text-red-800 border-red-200',
    };

    const labels = {
      'pending': 'Pendiente',
      'processing': 'Analizando IA',
      'completed': 'Completado',
      'error': 'Error',
    };

    return (
      <Badge className={variants[estado as keyof typeof variants] || variants.pending}>
        {labels[estado as keyof typeof labels] || estado}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documentos Recientes
            </div>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled>
                <RefreshCw className="h-4 w-4 animate-spin" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Documentos Recientes ({documents.length})
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay documentos subidos</p>
            <p className="text-sm text-gray-400">Los documentos que subas aparecerán aquí</p>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-mono text-xs text-gray-500 truncate max-w-[100px]">
                        {doc.id.substring(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.nombre_archivo || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {doc.storage_path}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {DOCUMENT_TYPE_LABELS[doc.tipo]?.icon || '📄'}
                        </span>
                        <span className="text-sm">
                          {DOCUMENT_TYPE_LABELS[doc.tipo]?.label || doc.tipo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getEstadoBadge(doc.estado)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatFileSize(doc.tamaño_archivo)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(doc.created_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentDocumentsTable;