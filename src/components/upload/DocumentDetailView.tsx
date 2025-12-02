import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Tag, 
  Download, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Documento } from '@/types/documento';
import { DocumentoService } from '@/services/documentoService';
import { showSuccess, showError } from '@/utils/toast';

interface DocumentDetailViewProps {
  documento: Documento;
  onClose: () => void;
  onUpdate: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  'ficha_ruc': { label: 'Ficha RUC', icon: '📋' },
  'representante_legal': { label: 'Representante Legal', icon: '👤' },
  'cuenta_bancaria': { label: 'Cuenta Bancaria', icon: '🏦' },
  'vigencia_poderes': { label: 'Vigencia de Poderes', icon: '⚖️' },
  'factura_negociar': { label: 'Factura a Negociar', icon: '💰' },
  'reporte_tributario': { label: 'Reporte Tributario', icon: '📊' },
  'sentinel': { label: 'Sentinel', icon: '🛡️' },
};

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  documento,
  onClose,
  onUpdate
}) => {
  const [downloading, setDownloading] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const url = await DocumentoService.getSignedUrl(documento.storage_path);
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nombre_archivo || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Descarga iniciada');
    } catch (error) {
      console.error('Error descargando archivo:', error);
      showError('Error descargando archivo');
    } finally {
      setDownloading(false);
    }
  };

  const handleReprocess = async () => {
    try {
      setReprocessing(true);
      await DocumentoService.reprocess(documento.id);
      showSuccess('Documento enviado para reprocesamiento');
      onUpdate();
    } catch (error) {
      console.error('Error reprocesando:', error);
      showError('Error reprocesando documento');
    } finally {
      setReprocessing(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121212] border border-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-[#00FF80]" />
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {documento.nombre_archivo || 'Documento sin nombre'}
                </h2>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {DOCUMENT_TYPE_LABELS[documento.tipo]?.icon || '📄'}
                    </span>
                    <span className="text-sm text-gray-400">
                      {DOCUMENT_TYPE_LABELS[documento.tipo]?.label || documento.tipo}
                    </span>
                  </div>
                  {getEstadoBadge(documento.estado)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={downloading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Descargando...' : 'Descargar'}
              </Button>
              
              {documento.estado === 'error' && (
                <Button
                  variant="outline"
                  onClick={handleReprocess}
                  disabled={reprocessing}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${reprocessing ? 'animate-spin' : ''}`} />
                  {reprocessing ? 'Reprocesando...' : 'Reprocesar'}
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
              <TabsTrigger value="info" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
                Información
              </TabsTrigger>
              <TabsTrigger value="procesamiento" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
                Procesamiento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card className="bg-gray-900/30 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Información del Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">ID del Documento:</span>
                      <p className="font-mono text-xs text-[#00FF80] bg-gray-900/50 p-2 rounded mt-1">
                        {documento.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Ruta de Almacenamiento:</span>
                      <p className="font-mono text-xs text-gray-300 bg-gray-900/50 p-2 rounded mt-1">
                        {documento.storage_path}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Tamaño del Archivo:</span>
                      <p className="text-white mt-1">{formatFileSize(documento.tamaño_archivo)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Estado:</span>
                      <div className="mt-1">{getEstadoBadge(documento.estado)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Fecha de Creación:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-white">
                          {new Date(documento.created_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Última Actualización:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-white">
                          {new Date(documento.updated_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {documento.error_msg && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Error de Procesamiento</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-2 bg-gray-900/50 p-2 rounded">
                        {documento.error_msg}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="procesamiento" className="space-y-4">
              <Card className="bg-gray-900/30 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Estado del Procesamiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getEstadoBadge(documento.estado)}
                      <span className="text-white">
                        {documento.estado === 'pending' && 'Documento en cola para procesamiento'}
                        {documento.estado === 'processing' && 'Documento siendo procesado por el webhook'}
                        {documento.estado === 'completed' && 'Documento procesado exitosamente'}
                        {documento.estado === 'error' && 'Error durante el procesamiento'}
                      </span>
                    </div>
                    
                    {documento.estado === 'error' && (
                      <Button
                        onClick={handleReprocess}
                        disabled={reprocessing}
                        className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${reprocessing ? 'animate-spin' : ''}`} />
                        Reprocesar
                      </Button>
                    )}
                  </div>

                  {documento.estado === 'completed' && documento.tipo === 'cuenta_bancaria' && (
                    <div className="bg-[#00FF80]/10 border border-[#00FF80]/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-[#00FF80]">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Procesamiento completado - Los datos han sido extraídos
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 bg-gray-900/30 p-3 rounded">
                    <p><strong>Flujo de procesamiento:</strong></p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Documento subido al storage</li>
                      <li>Registro creado en base de datos</li>
                      <li>Enviado al webhook para procesamiento</li>
                      <li>Webhook extrae información y actualiza estado</li>
                      <li>Datos estructurados disponibles en la aplicación</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailView;