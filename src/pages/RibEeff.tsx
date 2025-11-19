import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Loader2, Building, User, ClipboardList } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RibEeffService } from '@/services/ribEeffService';
import { toast } from 'sonner';

const RibEeffPage = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const summariesData = await RibEeffService.getAllSummaries();
      setSummaries(summariesData);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los resúmenes de RIB EEFF');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este reporte de RIB EEFF?')) return;

    try {
      await RibEeffService.delete(id);
      toast.success('Reporte eliminado correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el reporte');
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'Completado':
        return <Badge className="bg-green-600 hover:bg-green-700 text-white border-transparent">Completado</Badge>;
      case 'En revision':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black border-transparent">En Revisión</Badge>;
      case 'Borrador':
      default:
        return <Badge variant="outline">Borrador</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FileText className="h-8 w-8 mr-3 text-[#00FF80]" />
              RIB Estados Financieros (EEFF)
            </h1>
            <p className="text-gray-400 mt-2">
              Gestión de Estados Financieros para el Reporte de Inicio de Búsqueda.
            </p>
          </div>
          <Button 
            className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
            onClick={() => navigate('/rib-eeff/nuevo')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo RIB EEFF
          </Button>
        </div>

        <Card className="bg-[#121212] border border-gray-800">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Proveedor</TableHead>
                  <TableHead className="text-gray-400">Deudor</TableHead>
                  <TableHead className="text-gray-400">Solicitud Asociada</TableHead>
                  <TableHead className="text-gray-400">Años</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                  <TableHead className="text-gray-400">Creador</TableHead>
                  <TableHead className="text-gray-400">Actualización</TableHead>
                  <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                      No se encontraron reportes
                    </TableCell>
                  </TableRow>
                ) : (
                  summaries.map((item) => (
                    <TableRow key={item.id} className="border-gray-800 hover:bg-gray-900/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-white font-medium truncate">
                              {item.proveedor_nombre}
                            </div>
                            <div className="text-gray-500 text-xs font-mono">
                              {item.proveedor_ruc}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.deudor_ruc !== 'N/A' ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-white font-medium truncate">
                                {item.deudor_nombre}
                              </div>
                              <div className="text-gray-500 text-xs font-mono">
                                {item.deudor_ruc}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">Sin deudor</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.solicitud_id ? (
                          <Link 
                            to={`/solicitudes-operacion/editar/${item.solicitud_id}`} 
                            className="text-blue-400 hover:text-blue-300 hover:underline font-mono text-xs flex items-center"
                          >
                            <ClipboardList className="h-3 w-3 mr-1" />
                            Solicitud: {item.solicitud_id.substring(0, 8)}...
                          </Link>
                        ) : (
                          <span className="text-gray-500 text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-300 text-xs font-mono">
                          {item.años_reportados || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {item.creator_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">
                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString('es-ES') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/rib-eeff/edit/${item.id}`)}
                            className="hover:bg-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-gray-800"
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RibEeffPage;