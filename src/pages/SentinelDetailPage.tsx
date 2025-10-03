import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  User,
  Building2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SentinelService, type Sentinel } from '@/services/sentinelService';
import { toast } from 'sonner';

const SentinelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sentinel, setSentinel] = useState<Sentinel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSentinel();
    }
  }, [id]);

  const loadSentinel = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await SentinelService.getById(id);
      setSentinel(data);
    } catch (error) {
      console.error('Error loading sentinel:', error);
      toast.error('Error al cargar el documento Sentinel');
      navigate('/sentinel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sentinel || !confirm('¿Estás seguro de que deseas eliminar este documento Sentinel?')) {
      return;
    }

    try {
      await SentinelService.delete(sentinel.id);
      toast.success('Documento Sentinel eliminado correctamente');
      navigate('/sentinel');
    } catch (error) {
      console.error('Error deleting sentinel:', error);
      toast.error('Error al eliminar el documento Sentinel');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Borrador':
        return <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 border-gray-500/20"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case 'Procesado':
        return <Badge variant="secondary" className="bg-[#00FF80]/10 text-[#00FF80] border-[#00FF80]/20"><CheckCircle className="h-3 w-3 mr-1" />Procesado</Badge>;
      case 'Error':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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

  if (!sentinel) {
    return (
      <Layout>
        <div className="min-h-screen bg-black">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Documento no encontrado
              </h3>
              <Button onClick={() => navigate('/sentinel')}>
                Volver a la lista
              </Button>
            </div>
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/sentinel')}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Shield className="h-8 w-8 mr-3 text-[#00FF80]" />
                  Documento Sentinel
                </h1>
                <p className="text-gray-400 mt-2">
                  Detalles del documento RUC: {sentinel.ruc}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/sentinel/${sentinel.id}/edit`)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-700 text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Información Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-400">RUC</label>
                      <div className="mt-1 text-lg font-mono text-white">{sentinel.ruc}</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-400">Estado</label>
                      <div className="mt-1">
                        {getStatusBadge(sentinel.status)}
                      </div>
                    </div>
                  </div>

                  {sentinel.file_url && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Archivo</label>
                      <div className="mt-1">
                        <a
                          href={sentinel.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#00FF80] hover:text-[#00FF80]/80 transition-colors"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver documento
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Información del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">ID del Documento</label>
                    <div className="mt-1 text-sm font-mono text-gray-300 break-all">{sentinel.id}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Fecha de Creación</label>
                    <div className="mt-1 text-sm text-gray-300">
                      {new Date(sentinel.created_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400">Última Actualización</label>
                    <div className="mt-1 text-sm text-gray-300">
                      {new Date(sentinel.updated_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {sentinel.user_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Usuario</label>
                      <div className="mt-1 flex items-center text-sm text-gray-300">
                        <User className="h-4 w-4 mr-2" />
                        {sentinel.user_id}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SentinelDetailPage;