import React, { useState, useEffect } from 'react';
import { Plus, Building2, FileText, Users, Calendar, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import FichaRucTable from '@/components/ficha-ruc/FichaRucTable';
import FichaRucModal from '@/components/ficha-ruc/FichaRucModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const FichasRuc = () => {
  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFicha, setSelectedFicha] = useState<FichaRuc | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    thisMonth: 0
  });

  useEffect(() => {
    loadFichas();
    loadStats();
  }, []);

  const loadFichas = async () => {
    try {
      setError(null);
      const data = await FichaRucService.getAll();
      setFichas(data);
    } catch (error) {
      console.error('Error loading fichas RUC:', error);
      setError('Error cargando las fichas RUC');
      showError('Error cargando las fichas RUC');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await FichaRucService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleViewFicha = (ficha: FichaRuc) => {
    setSelectedFicha(ficha);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditFicha = (ficha: FichaRuc) => {
    setSelectedFicha(ficha);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleExportFicha = (ficha: FichaRuc) => {
    showSuccess(`Exportando datos de ${ficha.nombre_empresa}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFicha(null);
  };

  const handleModalSave = async () => {
    // Recargar datos después de guardar
    await loadFichas();
    await loadStats();
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    setLoading(true);
    await loadFichas();
    await loadStats();
    dismissToast(loadingToast);
    showSuccess('Datos actualizados');
  };

  const handleCreateTestData = async () => {
    const loadingToast = showLoading('Creando datos de prueba...');
    
    try {
      // Crear algunas fichas RUC de prueba
      const testFichas = [
        {
          nombre_empresa: 'COMERCIAL EJEMPLO S.A.C.',
          ruc: '20123456789',
          actividad_empresa: 'Venta al por menor de productos diversos',
          fecha_inicio_actividades: '2020-01-15',
          estado_contribuyente: 'Activo',
          domicilio_fiscal: 'AV. EJEMPLO 123, LIMA, LIMA, PERU',
          nombre_representante_legal: 'JUAN CARLOS EJEMPLO LOPEZ'
        },
        {
          nombre_empresa: 'SERVICIOS INTEGRALES DEL PERU S.R.L.',
          ruc: '20987654321',
          actividad_empresa: 'Servicios de consultoría empresarial',
          fecha_inicio_actividades: '2019-05-20',
          estado_contribuyente: 'Activo',
          domicilio_fiscal: 'JR. COMERCIO 456, AREQUIPA, AREQUIPA, PERU',
          nombre_representante_legal: 'MARIA ELENA SERVICIOS GARCIA'
        },
        {
          nombre_empresa: 'CONSTRUCTORA NORTE E.I.R.L.',
          ruc: '20555666777',
          actividad_empresa: 'Construcción de edificios residenciales',
          fecha_inicio_actividades: '2018-03-10',
          estado_contribuyente: 'Suspendido',
          domicilio_fiscal: 'AV. CONSTRUCCION 789, TRUJILLO, LA LIBERTAD, PERU',
          nombre_representante_legal: 'CARLOS ALBERTO CONSTRUCTOR RUIZ'
        }
      ];

      for (const fichaData of testFichas) {
        await FichaRucService.create(fichaData);
      }

      dismissToast(loadingToast);
      showSuccess('Datos de prueba creados exitosamente');
      await loadFichas();
      await loadStats();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error creando datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
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
              <h1 className="text-2xl font-bold text-white">Fichas RUC</h1>
              <p className="text-gray-400">
                Gestión de datos extraídos de documentos Ficha RUC
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                disabled={loading}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              {fichas.length === 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleCreateTestData}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Datos de Prueba
                </Button>
              )}
              <Button className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Ficha RUC
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
                  Total de Fichas RUC
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <Building2 className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                <p className="text-xs text-gray-500">Documentos procesados</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Contribuyentes Activos
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <Users className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">{stats.active}</div>
                <p className="text-xs text-gray-500">Estado activo</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-gray-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Contribuyentes Inactivos
                </CardTitle>
                <div className="p-2 bg-gray-500/10 rounded-lg border border-gray-500/20">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400 font-mono">{stats.inactive}</div>
                <p className="text-xs text-gray-500">Estado inactivo</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-purple-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Nuevas Este Mes
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 font-mono">{stats.thisMonth}</div>
                <p className="text-xs text-gray-500">Procesadas este mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Fichas RUC Table */}
          <FichaRucTable
            fichas={fichas}
            onViewFicha={handleViewFicha}
            onEditFicha={handleEditFicha}
            onExportFicha={handleExportFicha}
          />

          {/* Empty State Instructions */}
          {fichas.length === 0 && !loading && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardContent className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay Fichas RUC</h3>
                <p className="text-gray-400 mb-6">
                  Las fichas RUC procesadas por tu agente de IA aparecerán aquí automáticamente.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Para empezar:</p>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. Ve a la página "Subir PDFs"</li>
                    <li>2. Sube documentos tipo "Ficha RUC"</li>
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
          <FichaRucModal
            ficha={selectedFicha}
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

export default FichasRuc;