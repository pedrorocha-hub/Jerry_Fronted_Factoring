import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, FileText, Brain, Zap, RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import DocumentUploadForm from '@/components/upload/DocumentUploadForm';
import DocumentTable from '@/components/upload/DocumentTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Documento } from '@/types/documento';
import { DocumentoService } from '@/services/documentoService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const UploadPage = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    procesados: 0,
    pendientes: 0,
    errores: 0,
    thisMonth: 0,
    typeDistribution: {} as { [key: string]: number },
    statusDistribution: {} as { [key: string]: number }
  });

  useEffect(() => {
    loadDocumentos();
    loadStats();
  }, []);

  const loadDocumentos = async () => {
    try {
      setError(null);
      const data = await DocumentoService.getAll();
      setDocumentos(data);
    } catch (error) {
      console.error('Error loading documentos:', error);
      setError('Error cargando los documentos');
      showError('Error cargando los documentos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await DocumentoService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUploadComplete = async () => {
    // Recargar datos después de subir archivos
    await loadDocumentos();
    await loadStats();
  };

  const handleDeleteDocumento = async (documento: Documento) => {
    if (window.confirm(`¿Está seguro de eliminar el documento ${documento.nombre_archivo}?`)) {
      try {
        await DocumentoService.delete(documento.id);
        await loadDocumentos();
        await loadStats();
        showSuccess('Documento eliminado exitosamente');
      } catch (error) {
        showError('Error eliminando el documento');
      }
    }
  };

  const handleReprocessDocumento = async (documento: Documento) => {
    const loadingToast = showLoading('Reprocesando documento...');
    
    try {
      await DocumentoService.reprocess(documento.id);
      dismissToast(loadingToast);
      showSuccess('Documento enviado para reprocesamiento');
      await loadDocumentos();
      await loadStats();
    } catch (error) {
      dismissToast(loadingToast);
      showError('Error reprocesando el documento');
    }
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    setLoading(true);
    await loadDocumentos();
    await loadStats();
    dismissToast(loadingToast);
    showSuccess('Datos actualizados');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Brain className="h-8 w-8 mr-3 text-[#00FF80]" />
                Subir PDFs para Análisis IA
              </h1>
              <p className="text-gray-400">
                Sube documentos PDF y nuestro agente de IA extraerá automáticamente los datos relevantes
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={loading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* AI Info Banner */}
          <Card className="bg-gradient-to-r from-[#00FF80]/10 to-[#00FF80]/5 border border-[#00FF80]/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#00FF80]/10 rounded-full border border-[#00FF80]/20">
                  <Zap className="h-8 w-8 text-[#00FF80]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Análisis Inteligente de Documentos</h3>
                  <p className="text-gray-300">
                    Nuestro agente de IA puede procesar automáticamente: Fichas RUC, Documentos de Representantes Legales, 
                    Información de Cuentas Bancarias, Vigencia de Poderes, Facturas a Negociar y Reportes Tributarios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Documentos
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <FileText className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                <p className="text-xs text-gray-500">Documentos subidos</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Procesados
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <CheckCircle className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">{stats.procesados}</div>
                <p className="text-xs text-gray-500">Análisis completado</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-yellow-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Pendientes
                </CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400 font-mono">{stats.pendientes}</div>
                <p className="text-xs text-gray-500">En proceso de análisis</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-red-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Con Errores
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 font-mono">{stats.errores}</div>
                <p className="text-xs text-gray-500">Requieren atención</p>
              </CardContent>
            </Card>
          </div>

          {/* Upload Form */}
          <DocumentUploadForm onUploadComplete={handleUploadComplete} />

          {/* Documentos Table */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
                Documentos Subidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentTable
                documentos={documentos}
                onDeleteDocumento={handleDeleteDocumento}
                onReprocessDocumento={handleReprocessDocumento}
              />
            </CardContent>
          </Card>

          {/* Empty State Instructions */}
          {documentos.length === 0 && !loading && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardContent className="text-center py-12">
                <UploadIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay documentos subidos</h3>
                <p className="text-gray-400 mb-6">
                  Comienza subiendo tus primeros documentos PDF para que nuestro agente de IA los procese.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Tipos de documentos soportados:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-400">
                    <div>📋 Ficha RUC</div>
                    <div>👤 Representante Legal</div>
                    <div>🏦 Cuenta Bancaria</div>
                    <div>⚖️ Vigencia de Poderes</div>
                    <div>💰 Factura a Negociar</div>
                    <div>📊 Reporte Tributario</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Processing Info */}
          {stats.pendientes > 0 && (
            <Card className="bg-[#00FF80]/10 border border-[#00FF80]/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-[#00FF80] animate-pulse" />
                  <div>
                    <p className="text-[#00FF80] font-medium">
                      {stats.pendientes} documento(s) siendo procesado(s) por IA
                    </p>
                    <p className="text-sm text-gray-300">
                      Los resultados aparecerán automáticamente en las secciones correspondientes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;