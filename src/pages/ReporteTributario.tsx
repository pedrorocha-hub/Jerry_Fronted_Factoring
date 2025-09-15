import React, { useState, useEffect } from 'react';
import { Plus, FileText, TrendingUp, TrendingDown, Calendar, RefreshCw, Building2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ReporteTributarioTable from '@/components/reporte-tributario/ReporteTributarioTable';
import ReporteTributarioModal from '@/components/reporte-tributario/ReporteTributarioModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReporteTributarioWithFicha } from '@/types/reporte-tributario';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const ReporteTributarioPage = () => {
  const [reportes, setReportes] = useState<ReporteTributarioWithFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReporte, setSelectedReporte] = useState<ReporteTributarioWithFicha | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
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
    console.log('ReporteTributario: Component mounted, loading data...');
    loadReportes();
  }, []);

  // Cargar estadísticas después de cargar reportes
  useEffect(() => {
    if (reportes.length > 0) {
      loadStats();
    }
  }, [reportes]);

  const loadReportes = async () => {
    try {
      console.log('ReporteTributario: Loading reportes tributarios...');
      setError(null);
      setLoading(true);
      
      const data = await ReporteTributarioService.getAll();
      console.log('ReporteTributario: Data loaded successfully:', data);
      
      setReportes(data || []);
      
      if (!data || data.length === 0) {
        console.log('ReporteTributario: No data found');
      }
      
    } catch (error) {
      console.error('ReporteTributario: Error loading reportes tributarios:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error cargando los reportes tributarios: ${errorMessage}`);
      showError(`Error cargando los reportes tributarios: ${errorMessage}`);
      setReportes([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('ReporteTributario: Loading stats...');
      const statsData = await ReporteTributarioService.getStats();
      console.log('ReporteTributario: Stats loaded:', statsData);
      
      // Calcular empresas con reportes
      const empresasConReportes = new Set(reportes.map(r => r.ficha_ruc_id)).size;
      
      setStats({
        ...statsData,
        empresasConReportes
      });
    } catch (error) {
      console.error('ReporteTributario: Error loading stats:', error);
      // No mostrar error para stats, usar valores por defecto
    }
  };

  const handleViewReporte = (reporte: ReporteTributarioWithFicha) => {
    console.log('ReporteTributario: Viewing reporte:', reporte);
    setSelectedReporte(reporte);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditReporte = (reporte: ReporteTributarioWithFicha) => {
    console.log('ReporteTributario: Editing reporte:', reporte);
    setSelectedReporte(reporte);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteReporte = async (reporte: ReporteTributarioWithFicha) => {
    if (window.confirm(`¿Está seguro de eliminar el reporte tributario del año ${reporte.anio_reporte}?`)) {
      try {
        await ReporteTributarioService.delete(reporte.id);
        await loadReportes();
        showSuccess(`Reporte del año ${reporte.anio_reporte} eliminado exitosamente`);
      } catch (error) {
        console.error('ReporteTributario: Error deleting:', error);
        showError('Error eliminando el reporte tributario');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedReporte(null);
  };

  const handleModalSave = async () => {
    // Recargar datos después de guardar
    await loadReportes();
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    await loadReportes();
    dismissToast(loadingToast);
    showSuccess('Datos actualizados');
  };

  const handleCreateTestData = async () => {
    const loadingToast = showLoading('Creando datos de prueba...');
    
    try {
      await ReporteTributarioService.createTestData();
      dismissToast(loadingToast);
      showSuccess('Datos de prueba creados exitosamente');
      await loadReportes();
    } catch (error) {
      dismissToast(loadingToast);
      console.error('ReporteTributario: Error creating test data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showError(`Error creando datos de prueba: ${errorMessage}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  console.log('ReporteTributario: Rendering with state:', { 
    loading, 
    error, 
    reportesCount: reportes.length,
    stats,
    reportes: reportes.slice(0, 2) // Solo mostrar los primeros 2 para debugging
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
              <h1 className="text-2xl font-bold text-white">Reportes Tributarios</h1>
              <p className="text-gray-400">
                Análisis financiero y tributario de las empresas
              </p>
              {/* Debug info */}
              <p className="text-xs text-gray-600 mt-1">
                Debug: {reportes.length} reportes cargados, Loading: {loading.toString()}, Error: {error ? 'Sí' : 'No'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCreateTestData}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Datos de Prueba
              </Button>
              <Button className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Reportes
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <FileText className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                <p className="text-xs text-gray-500">Reportes registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Utilidad Positiva
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <TrendingUp className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">{stats.positiveUtilidad}</div>
                <p className="text-xs text-gray-500">Reportes con ganancias</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-red-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Utilidad Negativa
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 font-mono">{stats.negativeUtilidad}</div>
                <p className="text-xs text-gray-500">Reportes con pérdidas</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-purple-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Años Cubiertos
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 font-mono">{stats.uniqueYears}</div>
                <p className="text-xs text-gray-500">Años diferentes</p>
              </CardContent>
            </Card>
          </div>

          {/* Utilidad promedio */}
          {stats.avgUtilidadNeta > 0 && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Utilidad Neta Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#00FF80]">{formatCurrency(stats.avgUtilidadNeta)}</div>
                <p className="text-sm text-gray-400">Promedio de utilidad neta entre todos los reportes</p>
              </CardContent>
            </Card>
          )}

          {/* Reportes Tributarios Table */}
          <div className="bg-[#121212] border border-gray-800 rounded-lg">
            <ReporteTributarioTable
              reportes={reportes}
              onViewReporte={handleViewReporte}
              onEditReporte={handleEditReporte}
              onDeleteReporte={handleDeleteReporte}
            />
          </div>

          {/* Empty State Instructions */}
          {reportes.length === 0 && !loading && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay Reportes Tributarios</h3>
                <p className="text-gray-400 mb-6">
                  Los reportes tributarios procesados por tu agente de IA aparecerán aquí automáticamente.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Para empezar:</p>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. Ve a la página "Subir PDFs"</li>
                    <li>2. Sube documentos tipo "Reporte Tributario"</li>
                    <li>3. El agente procesará automáticamente los datos</li>
                    <li>4. Los resultados aparecerán en esta tabla</li>
                  </ol>
                </div>
                <div className="mt-6 space-x-3">
                  <Button onClick={handleCreateTestData} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Datos de Prueba
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/upload'}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Ir a Subir PDFs
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modal */}
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