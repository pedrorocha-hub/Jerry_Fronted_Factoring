import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  User,
  Building2,
  Eye,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SentinelService, type Sentinel } from '@/services/sentinelService';
import SentinelModal from '@/components/sentinel/SentinelModal';
import { toast } from 'sonner';

const SentinelPage = () => {
  const navigate = useNavigate();
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSentinel, setSelectedSentinel] = useState<Sentinel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    loadSentinels();
  }, []);

  const loadSentinels = async () => {
    try {
      setLoading(true);
      const data = await SentinelService.getAll();
      setSentinels(data);
    } catch (error) {
      console.error('Error loading sentinels:', error);
      toast.error('Error al cargar los documentos Sentinel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento Sentinel?')) {
      return;
    }

    try {
      await SentinelService.delete(id);
      toast.success('Documento Sentinel eliminado correctamente');
      loadSentinels();
    } catch (error) {
      console.error('Error deleting sentinel:', error);
      toast.error('Error al eliminar el documento Sentinel');
    }
  };

  const handleView = (sentinel: Sentinel) => {
    setSelectedSentinel(sentinel);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (sentinel: Sentinel) => {
    setSelectedSentinel(sentinel);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSentinel(null);
  };

  const handleModalSave = () => {
    loadSentinels();
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

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredSentinels = sentinels.filter(sentinel => {
    const matchesSearch = sentinel.ruc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sentinel.status === statusFilter;
    return matchesSearch && matchesStatus;
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
                <Shield className="h-8 w-8 mr-3 text-[#00FF80]" />
                Documentos Sentinel
              </h1>
              <p className="text-gray-400 mt-2">
                Gestión de documentos Sentinel procesados por IA
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
                onClick={() => navigate('/upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate('/sentinel/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Sentinel
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total</CardTitle>
                <Shield className="h-4 w-4 text-[#00FF80]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{sentinels.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Procesados</CardTitle>
                <CheckCircle className="h-4 w-4 text-[#00FF80]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">
                  {sentinels.filter(s => s.status === 'Procesado').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Borradores</CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400 font-mono">
                  {sentinels.filter(s => s.status === 'Borrador').length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Con Errores</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 font-mono">
                  {sentinels.filter(s => s.status === 'Error').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por RUC..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Borrador">Borrador</SelectItem>
                    <SelectItem value="Procesado">Procesado</SelectItem>
                    <SelectItem value="Error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
                Lista de Documentos Sentinel
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSentinels.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No hay documentos Sentinel
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No se encontraron documentos con los filtros aplicados'
                      : 'Comienza subiendo tu primer documento Sentinel'
                    }
                  </p>
                  <Button 
                    onClick={() => navigate('/sentinel/create')}
                    className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Sentinel
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">RUC</TableHead>
                      <TableHead className="text-gray-400">Score</TableHead>
                      <TableHead className="text-gray-400">Deuda Directa</TableHead>
                      <TableHead className="text-gray-400">Estado</TableHead>
                      <TableHead className="text-gray-400">Fecha Creación</TableHead>
                      <TableHead className="text-gray-400">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSentinels.map((sentinel) => (
                      <TableRow key={sentinel.id} className="border-gray-800 hover:bg-gray-900/50">
                        <TableCell className="text-white font-mono">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                            {sentinel.ruc}
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-mono">{sentinel.score || '-'}</TableCell>
                        <TableCell className="text-white font-mono">{formatCurrency(sentinel.deuda_directa)}</TableCell>
                        <TableCell>
                          {getStatusBadge(sentinel.status)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(sentinel.created_at).toLocaleDateString('es-ES')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(sentinel)}
                              className="text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sentinel)}
                              className="text-gray-400 hover:text-white hover:bg-gray-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(sentinel.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <SentinelModal
          sentinel={selectedSentinel}
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
          mode={modalMode}
        />
      </div>
    </Layout>
  );
};

export default SentinelPage;