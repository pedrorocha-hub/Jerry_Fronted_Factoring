import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardEdit, Plus, Edit, Trash2, Eye, Loader2, Copy } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { SolicitudOperacionWithRiesgos } from '@/types/solicitudOperacion';
import { showSuccess, showError } from '@/utils/toast';

const SolicitudOperacion = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<SolicitudOperacionWithRiesgos[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await SolicitudOperacionService.getAll();
      setSolicitudes(data);
    } catch (err) {
      showError('No se pudieron cargar las solicitudes de operación.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta solicitud?')) {
      try {
        await SolicitudOperacionService.delete(id);
        showSuccess('Solicitud eliminada exitosamente.');
        await loadSolicitudes();
      } catch (err) {
        showError('No se pudo eliminar la solicitud.');
        console.error(err);
      }
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      showSuccess('ID de solicitud copiado al portapapeles');
    } catch (err) {
      showError('No se pudo copiar el ID');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Borrador': { className: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Borrador' },
      'En Revisión': { className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'En Revisión' },
      'Completado': { className: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'Completado' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Borrador'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <ClipboardEdit className="h-6 w-6 mr-3 text-[#00FF80]" />
                Solicitudes de Operación
              </h1>
              <p className="text-gray-400">
                Gestiona las solicitudes de operación y análisis de riesgo
              </p>
            </div>
            <Button
              onClick={() => navigate('/solicitudes-operacion/crear')}
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Solicitud
            </Button>
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Solicitudes Registradas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay solicitudes registradas.</p>
                  <p className="text-sm mt-2">Crea una nueva solicitud para empezar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800 hover:bg-gray-900/50">
                        <TableHead className="text-gray-300">ID Solicitud</TableHead>
                        <TableHead className="text-gray-300">RUC</TableHead>
                        <TableHead className="text-gray-300">Empresa</TableHead>
                        <TableHead className="text-gray-300">Proveedor</TableHead>
                        <TableHead className="text-gray-300">Deudor</TableHead>
                        <TableHead className="text-gray-300">Producto</TableHead>
                        <TableHead className="text-gray-300">L/P Vigente</TableHead>
                        <TableHead className="text-gray-300">Estado</TableHead>
                        <TableHead className="text-gray-300">Fecha</TableHead>
                        <TableHead className="text-right text-gray-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitudes.map((solicitud) => {
                        const primerRiesgo = solicitud.riesgos?.[0];
                        return (
                          <TableRow key={solicitud.id} className="border-gray-800 hover:bg-gray-900/30">
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyId(solicitud.id)}
                                className="font-mono text-white text-xs hover:bg-[#00FF80]/10 hover:text-[#00FF80] flex items-center gap-2"
                                title="Copiar ID completo"
                              >
                                {solicitud.id.substring(0, 8)}...
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TableCell>
                            <TableCell className="font-mono text-white">{solicitud.ruc}</TableCell>
                            <TableCell className="text-white">{solicitud.empresa_nombre}</TableCell>
                            <TableCell className="text-white">{solicitud.proveedor || primerRiesgo?.deudor || '-'}</TableCell>
                            <TableCell className="text-white">{solicitud.deudor || primerRiesgo?.deudor || '-'}</TableCell>
                            <TableCell className="text-white">{solicitud.producto || primerRiesgo?.producto || '-'}</TableCell>
                            <TableCell className="text-white">{solicitud.lp_vigente_gve || primerRiesgo?.lp_vigente_gve || '-'}</TableCell>
                            <TableCell>{getStatusBadge(solicitud.status)}</TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(solicitud.created_at).toLocaleDateString('es-PE')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/solicitudes-operacion/${solicitud.id}`)}
                                  className="text-gray-400 hover:text-white"
                                  title="Ver detalles"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/solicitudes-operacion/editar/${solicitud.id}`)}
                                  className="text-gray-400 hover:text-white"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(solicitud.id)}
                                  className="text-gray-400 hover:text-red-500"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudOperacion;