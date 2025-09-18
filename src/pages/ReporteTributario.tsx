import React, { useState, useEffect } from 'react';
import { Plus, FileText, TrendingUp, TrendingDown, Calendar, RefreshCw, Building2, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ReporteTributarioTable from '@/components/reporte-tributario/ReporteTributarioTable';
import ReportePorEmpresaTable from '@/components/reporte-tributario/ReportePorEmpresaTable';
import ReporteTributarioModal from '@/components/reporte-tributario/ReporteTributarioModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReporteTributarioWithFicha } from '@/types/reporte-tributario';
import { ReporteTributarioService, ReporteTributarioPorEmpresa } from '@/services/reporteTributarioService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const ReporteTributarioPage = () => {
  const [reportes, setReportes] = useState<ReporteTributarioWithFicha[]>([]);
  const [reportesPorEmpresa, setReportesPorEmpresa] = useState<ReporteTributarioPorEmpresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReporte, setSelectedReporte] = useState<ReporteTributarioWithFicha | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedRuc, setSelectedRuc] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    thisYear: 0,
    uniqueYears: 0,
    avgUtilidadNeta: 0,
    positiveUtilidad: 0,
    negativeUtilidad: 0,
    empresasConReportes: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const [allReportes, groupedData] = await Promise.all([
        ReporteTributarioService.getAll(),
        ReporteTributarioService.getAllGroupedByEmpresa()
      ]);
      
      setReportes(allReportes || []);
      setReportesPorEmpresa(groupedData || []);
      
      // Cargar estadísticas
      const statsData = await ReporteTributarioService.getStats();
      setStats({
        ...statsData,
        empresasConReportes: groupedData.length
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error cargando los reportes: ${errorMessage}`);
      showError(`Error cargando los reportes: ${errorMessage}`);
      setReportes([]);
      setReportesPorEmpresa([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReporte = (reporte: ReporteTributarioWithFicha) => {
    setSelectedReporte(reporte);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditReporte = (reporte: ReporteTributarioWithFicha) => {
    setSelectedReporte(reporte);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteReporte = async (reporte: ReporteTributarioWithFicha) => {
    if (window.confirm(`¿Está seguro de eliminar el reporte tributario del año ${reporte.anio_reporte}?`)) {
      try {
        await ReporteTributarioService.delete(reporte.id);
        await loadData();
        showSuccess(`Reporte del año ${reporte.anio_reporte} eliminado exitosamente`);
      } catch (error) {
        showError('Error eliminando el reporte tributario');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedReporte(null);
  };

  const handleModalSave = async () => {
    await loadData();
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    await loadData();
    dismissToast(loadingToast);
    showSuccess('Datos actualizados');
  };

  const selectedEmpresa = reportesPorEmpresa.find(e => e.ruc === selectedRuc);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
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
              <h1 className="text-2xl font-bold text-white">Reportes Tributarios</h1>
              <p className="text-gray-400">
                {selectedRuc ? `Desglose para ${selectedEmpresa?.nombre_empresa}` : 'Análisis financiero y tributario por empresa'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              {selectedRuc && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRuc(null)}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Empresas
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {error && <Alert className="border-red-500/20 bg-red-500/10"><AlertDescription className="text-red-400">{error}</AlertDescription></Alert>}

          {!selectedRuc ? (
            <>
              {/* Vista de Empresas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Empresas</CardTitle>
                    <Building2 className="h-4 w-4 text-[#00FF80]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white font-mono">{stats.empresasConReportes}</div>
                    <p className="text-xs text-gray-500">Empresas con reportes</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">Total Reportes</CardTitle>
                    <FileText className="h-4 w-4 text-[#00FF80]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                    <p className="text-xs text-gray-500">Reportes anuales registrados</p>
                  </CardContent>
                </Card>
              </div>
              <ReportePorEmpresaTable data={reportesPorEmpresa} onSelectEmpresa={setSelectedRuc} />
            </>
          ) : (
            <>
              {/* Vista de Desglose por Año */}
              <ReporteTributarioTable
                reportes={reportes.filter(r => r.ruc === selectedRuc)}
                onViewReporte={handleViewReporte}
                onEditReporte={handleEditReporte}
                onDeleteReporte={handleDeleteReporte}
              />
            </>
          )}

          <ReporteTributarioModal
            reporte={selectedReporte}
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

export default ReporteTributarioPage;