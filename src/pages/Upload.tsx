import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, RefreshCw } from 'lucide-react';
import DocumentUploadForm from '@/components/upload/DocumentUploadForm';
import DocumentTable from '@/components/upload/DocumentTable';
import { DocumentoService } from '@/services/documentoService';
import { showSuccess, showError } from '@/utils/toast';
import { Documento } from '@/types/documento';

const Upload = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocumentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DocumentoService.getAll();
      setDocumentos(data);
    } catch (error) {
      console.error('Error loading documents:', error);
      showError('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocumentos();
  }, [loadDocumentos]);

  const handleUploadComplete = () => {
    showSuccess('Subida completada, actualizando lista...');
    loadDocumentos();
  };

  const handleDelete = async (documento: Documento) => {
    if (window.confirm(`¿Está seguro de eliminar el archivo ${documento.nombre_archivo}?`)) {
      try {
        await DocumentoService.delete(documento.id);
        showSuccess('Documento eliminado exitosamente');
        loadDocumentos();
      } catch (error) {
        console.error('Error deleting document:', error);
        showError('Error al eliminar el documento');
      }
    }
  };

  const handleReprocess = async (documento: Documento) => {
    try {
      await DocumentoService.reprocess(documento.id);
      showSuccess('Documento enviado para reprocesamiento');
      loadDocumentos();
    } catch (error) {
      console.error('Error reprocessing document:', error);
      showError('Error al reprocesar el documento');
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <UploadCloud className="h-6 w-6 mr-3 text-[#00FF80]" />
          Subir y Gestionar Documentos
        </h1>

        <DocumentUploadForm onUploadComplete={handleUploadComplete} />

        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Documentos Subidos</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDocumentos} 
              disabled={loading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Cargando documentos...</div>
            ) : (
              <DocumentTable 
                documentos={documentos}
                onDeleteDocumento={handleDelete}
                onReprocessDocumento={handleReprocess}
                onRefresh={loadDocumentos}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Upload;