import React, { useState, useEffect } from 'react';
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
import { EeffService } from '@/services/eeffService';
import { FichaRucService } from '@/services/fichaRucService';
import { Eeff } from '@/types/eeff';
import { FichaRuc } from '@/types/ficha-ruc';
import { toast } from 'sonner';

const EeffPage = () => {
  const [eeffs, setEeffs] = useState<Eeff[]>([]);
  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eeffsData, fichasData] = await Promise.all([
        EeffService.getAll(),
        FichaRucService.getAll()
      ]);
      setEeffs(eeffsData);
      setFichas(fichasData);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos de EEFF');
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaNombre = (ruc: string) => {
    const ficha = fichas.find(f => f.ruc === ruc);
    return ficha?.nombre_empresa || ruc;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro de EEFF?')) return;

    try {
      await EeffService.delete(id);
      toast.success('Registro de EEFF eliminado correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el registro de EEFF');
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  };

  const filteredEeffs = eeffs.filter(eeff => {
    const empresaNombre = getEmpresaNombre(eeff.ruc);
    return empresaNombre.toLowerCase().includes(searchTerm.toLowerCase()) || eeff.ruc.includes(searchTerm);
  });

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
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FileText className="h-8 w-8 mr-3 text-[#00FF80]" />
                Estados Financieros (EEFF)
              </h1>
              <p className="text-gray-400 mt-2">
                Gestión de Declaraciones Juradas y Estados Financieros
              </p>
            </div>
            <Button 
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
              onClick={() => window.location.href = '/eeff/nuevo'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo EEFF
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total EEFF
                </CardTitle>
                <FileText className="h-4 w-4 text-[#00FF80]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{eeffs.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
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

          {/* Table */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Empresa (RUC)</TableHead>
                    <TableHead className="text-gray-400">Total Activo</TableHead>
                    <TableHead className="text-gray-400">Total Pasivo</TableHead>
                    <TableHead className="text-gray-400">Total Patrimonio</TableHead>
                    <TableHead className="text-gray-400">Fecha Creación</TableHead>
                    <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEeffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No se encontraron registros de EEFF
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEeffs.map((eeff) => (
                      <TableRow key={eeff.id} className="border-gray-800">
                        <TableCell className="text-white">
                          {getEmpresaNombre(eeff.ruc)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatCurrency(eeff.activo_total_activo_neto)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatCurrency(eeff.pasivo_total_pasivo)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatCurrency(eeff.patrimonio_total_patrimonio)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {eeff.created_at ? new Date(eeff.created_at).toLocaleDateString('es-ES') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.location.href = `/eeff/${eeff.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(eeff.id)}
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
      </div>
    </Layout>
  );
};

export default EeffPage;