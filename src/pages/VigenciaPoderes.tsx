import React, { useState, useEffect } from 'react';
import { Plus, Scale, Calendar, AlertTriangle, Users, Building2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import VigenciaPoderesTable from '@/components/vigencia-poderes/VigenciaPoderesTable';
import VigenciaPoderesModal from '@/components/vigencia-poderes/VigenciaPoderesModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VigenciaPoderesWithRepresentante } from '@/types/vigencia-poderes';
import { VigenciaPoderesService } from '@/services/vigenciaPoderesService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const VigenciaPoderesPage = () => {
  const [vigencias, setVigencias] = useState<VigenciaPoderesWithRepresentante[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVigencia, setSelectedVigencia] = useState<VigenciaPoderesWithRepresentante | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    vigentes: 0,
    vencidos: 0,
    revocados: 0,
    vencenProonto: 0,
    mostCommonTipo: '',
    estadoDistribution: {} as { [key: string]: number },
    tipoDistribution: {} as { [key: string]: number }
  });

  useEffect(() => {
    loadVigencias();
    loadStats();
  }, []);

  const loadVigencias = async () => {
    try {
      const data = await VigenciaPoderesService.getAll();
      setVigencias(data);
    } catch (error) {
      console.error('Error loading vigencias de poderes:', error);
      showError('Error cargando las vigencias de poderes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await VigenciaPoderesService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleViewVigencia = (vigencia: VigenciaPoderesWithRepresentante) => {
    setSelectedVigencia(vigencia);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditVigencia = (vigencia: VigenciaPoderesWithRepresentante) => {
    setSelectedVigencia(vigencia);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteVigencia = async (vigencia: VigenciaPoderesWithRepresentante) => {
    if (window.confirm(`¿Está seguro de eliminar la vigencia de poderes de ${vigencia.representante_legal?.nombre_completo}?`)) {
      try {
        await VigenciaPoderesService.delete(vigencia.id);
        await loadVigencias();
        await loadStats();
        showSuccess('Vigencia de poderes eliminada exitosamente');
      } catch (error) {
        showError('Error eliminando la vigencia de poderes');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedVigencia(null);
  };

  const handleModalSave = async () => {
    // Recargar datos después de guardar
    await loadVigencias();
    await loadStats();
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    await loadVigencias();
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
              <h1 className="text-2xl font-bold text-white">Vigencia de Poderes</h1>
              <p className="text-gray-400">
                Gestión de vigencias de poderes asociadas a representantes legales
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Actualizar
              </Button>
              <Button className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Vigencia
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Vigencias
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <Scale className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                <p className="text-xs text-gray-500">Vigencias registradas</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Vigentes
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <Users className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">{stats.vigentes}</div>
                <p className="text-xs text-gray-500">Estado vigente</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-red-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Vencidos
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <Calendar className="h-4 w-4 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 font-mono">{stats.vencidos}</div>
                <p className="text-xs text-gray-500">Estado vencido</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-yellow-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Próximos a Vencer
                </CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400 font-mono">{stats.vencenProonto}</div>
                <p className="text-xs text-gray-500">En 30 días</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-purple-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Tipo Más Común
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Building2 className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-400 truncate">
                  {stats.mostCommonTipo || 'N/A'}
                </div>
                <p className="text-xs text-gray-500">Tipo predominante</p>
              </CardContent>
            </Card>
          </div>

          {/* Vigencias de Poderes Table */}
          <VigenciaPoderesTable
            vigencias={vigencias}
            onViewVigencia={handleViewVigencia}
            onEditVigencia={handleEditVigencia}
            onDeleteVigencia={handleDeleteVigencia}
          />

          {/* Modal */}
          <VigenciaPoderesModal
            vigencia={selectedVigencia}
            isOpen={modalOpen}
            onClose={handleModalClose}
            onSave={handleModalSave}
            mode={modalMode}
          />
        </div>
      </div>
    </Layout>
  );
};

export default VigenciaPoderesPage;