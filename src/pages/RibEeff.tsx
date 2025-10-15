import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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
                  <TableHead className="text-gray-400">Empresa (RUC)</TableHead>
                  <TableHead className="text-gray-400">Creador</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                  <TableHead className="text-gray-400">Última Actualización</TableHead>
                  <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      No se encontraron reportes
                    </TableCell>
                  </TableRow>
                ) : (
                  summaries.map((item) => (
                    <TableRow key={item.id} className="border-gray-800">
                      <TableCell className="text-white font-medium">
                        {item.nombre_empresa} ({item.ruc})
                      </TableCell>
                      <TableCell className="text-white">{item.creator_name || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-gray-400">
                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString('es-ES') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/rib-eeff/edit/${item.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-300"
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