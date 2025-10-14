import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { FichaRucService } from '@/services/fichaRucService';
import { RibEeff } from '@/types/rib-eeff';
import { FichaRuc } from '@/types/ficha-ruc';
import { toast } from 'sonner';

const RibEeffPage = () => {
  const [ribEeffs, setRibEeffs] = useState<RibEeff[]>([]);
  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ribEeffsData, fichasData] = await Promise.all([
        RibEeffService.getAll(),
        FichaRucService.getAll()
      ]);
      setRibEeffs(ribEeffsData);
      setFichas(fichasData);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos de RIB EEFF');
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaNombre = (ruc: string) => {
    const ficha = fichas.find(f => f.ruc === ruc);
    return ficha?.nombre_empresa || ruc;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro de RIB EEFF?')) return;

    try {
      await RibEeffService.delete(id);
      toast.success('Registro de RIB EEFF eliminado correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el registro de RIB EEFF');
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

  const filteredRibEeffs = ribEeffs.filter(item => {
    const empresaNombre = getEmpresaNombre(item.ruc);
    return empresaNombre.toLowerCase().includes(searchTerm.toLowerCase()) || item.ruc.includes(searchTerm);
  });

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
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa o RUC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <Button variant="outline" className="border-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212] border border-gray-800">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Empresa (RUC)</TableHead>
                  <TableHead className="text-gray-400">Tipo</TableHead>
                  <TableHead className="text-gray-400">Año</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                  <TableHead className="text-gray-400">Fecha Creación</TableHead>
                  <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRibEeffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRibEeffs.map((item) => (
                    <TableRow key={item.id} className="border-gray-800">
                      <TableCell className="text-white font-medium">
                        {getEmpresaNombre(item.ruc)}
                      </TableCell>
                      <TableCell className="text-white capitalize">{item.tipo_entidad}</TableCell>
                      <TableCell className="text-white">{item.anio_reporte || '-'}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-gray-400">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES') : '-'}
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