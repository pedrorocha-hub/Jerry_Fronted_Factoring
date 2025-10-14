import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Plus, Edit, Trash2, Search } from 'lucide-react';
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
import { RibEeff } from '@/types/ribEeff';
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
      toast.error('Error al cargar los datos de Rib EEFF');
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaNombre = (ruc: string) => {
    const ficha = fichas.find(f => f.ruc === ruc);
    return ficha?.nombre_empresa || ruc;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro de Rib EEFF?')) return;

    try {
      await RibEeffService.delete(id);
      toast.success('Registro de Rib EEFF eliminado correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el registro de Rib EEFF');
    }
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'Completado':
        return <Badge className="bg-green-500 text-white">Completado</Badge>;
      case 'En revision':
        return <Badge className="bg-yellow-500 text-black">En Revisión</Badge>;
      case 'Borrador':
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-300">Borrador</Badge>;
    }
  };

  const filteredRibEeffs = ribEeffs.filter(eeff => {
    const empresaNombre = getEmpresaNombre(eeff.ruc);
    return empresaNombre.toLowerCase().includes(searchTerm.toLowerCase()) || eeff.ruc.includes(searchTerm);
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
      <div className="min-h-screen bg-black text-white p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FileSpreadsheet className="h-8 w-8 mr-3 text-[#00FF80]" />
                RIB Estados Financieros
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
              Nuevo Rib EEFF
            </Button>
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa o RUC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Empresa (RUC)</TableHead>
                    <TableHead className="text-gray-400">Año</TableHead>
                    <TableHead className="text-gray-400">Tipo</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRibEeffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        No se encontraron registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRibEeffs.map((eeff) => (
                      <TableRow key={eeff.id} className="border-gray-800">
                        <TableCell className="font-medium">{getEmpresaNombre(eeff.ruc)}</TableCell>
                        <TableCell>{eeff.anio_reporte || '-'}</TableCell>
                        <TableCell className="capitalize">{eeff.tipo_entidad || '-'}</TableCell>
                        <TableCell>{getStatusBadge(eeff.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/rib-eeff/edit/${eeff.id}`)}
                              className="hover:bg-gray-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(eeff.id)}
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
      </div>
    </Layout>
  );
};

export default RibEeffPage;