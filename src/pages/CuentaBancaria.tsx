import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Building2, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import CuentaBancariaTable from '@/components/cuenta-bancaria/CuentaBancariaTable';
import CuentaBancariaModal from '@/components/cuenta-bancaria/CuentaBancariaModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CuentaBancariaWithFicha } from '@/types/cuenta-bancaria';
import { CuentaBancariaService } from '@/services/cuentaBancariaService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const CuentaBancariaPage = () => {
  const [cuentas, setCuentas] = useState<CuentaBancariaWithFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaBancariaWithFicha | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    mostCommonEstado: '',
    estadoDistribution: {} as { [key: string]: number },
    monedaDistribution: {} as { [key: string]: number },
    activeCounts: 0,
    inactiveCounts: 0
  });

  useEffect(() => {
    console.log('CuentaBancaria: Component mounted, loading data...');
    loadCuentas();
    loadStats();
  }, []);

  const loadCuentas = async () => {
    try {
      console.log('CuentaBancaria: Loading cuentas bancarias...');
      setError(null);
      const data = await CuentaBancariaService.getAll();
      console.log('CuentaBancaria: Data loaded:', data);
      setCuentas(data || []);
    } catch (error) {
      console.error('CuentaBancaria: Error loading cuentas bancarias:', error);
      setError(`Error cargando las cuentas bancarias: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      showError('Error cargando las cuentas bancarias');
      setCuentas([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('CuentaBancaria: Loading stats...');
      const statsData = await CuentaBancariaService.getStats();
      console.log('CuentaBancaria: Stats loaded:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('CuentaBancaria: Error loading stats:', error);
      // No mostrar error para stats, usar valores por defecto
    }
  };

  const handleViewCuenta = (cuenta: CuentaBancariaWithFicha) => {
    console.log('CuentaBancaria: Viewing cuenta:', cuenta);
    setSelectedCuenta(cuenta);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditCuenta = (cuenta: CuentaBancariaWithFicha) => {
    console.log('CuentaBancaria: Editing cuenta:', cuenta);
    setSelectedCuenta(cuenta);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteCuenta = async (cuenta: CuentaBancariaWithFicha) => {
    if (window.confirm(`¿Está seguro de eliminar la cuenta ${cuenta.numero_cuenta}?`)) {
      try {
        await CuentaBancariaService.delete(cuenta.id);
        await loadCuentas();
        await loadStats();
        showSuccess(`Cuenta ${cuenta.numero_cuenta} eliminada exitosamente`);
      } catch (error) {
        console.error('CuentaBancaria: Error deleting:', error);
        showError('Error eliminando la cuenta bancaria');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCuenta(null);
  };

  const handleModalSave = async () => {
    // Recargar datos después de guardar
    await loadCuentas();
    await loadStats();
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    setLoading(true);
    await loadCuentas();
    await loadStats();
    dismissToast(loadingToast);
    showSuccess('Datos actualizados');
  };

  const handleCreateTestData = async () => {
    const loadingToast = showLoading('Creando datos de prueba...');
    
    try {
      await CuentaBancariaService.createTestData();
      dismissToast(loadingToast);
      showSuccess('Datos de prueba creados exitosamente');
      await loadCuentas();
      await loadStats();
    } catch (error) {
      dismissToast(loadingToast);
      console.error('CuentaBancaria: Error creating test data:', error);
      showError(`Error creando datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  console.log('CuentaBancaria: Rendering with state:', { 
    loading, 
    error, 
    cuentasCount: cuentas.length,
    stats 
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
              <h1 className="text-2xl font-bold text-white">Cuentas Bancarias</h1>
              <p className="text-gray-400">
                Gestión de información bancaria asociada a las Fichas RUC
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
              {cuentas.length === 0 && (
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
                Nueva Cuenta Bancaria
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
                  Total Cuentas
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <CreditCard className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                <p className="text-xs text-gray-500">Cuentas registradas</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Cuentas Activas
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <DollarSign className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">{stats.activeCounts}</div>
                <p className="text-xs text-gray-500">Estado activo</p>
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
                <p className="text-xs text-gray-500">Registradas este mes</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-orange-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Empresas Vinculadas
                </CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Building2 className="h-4 w-4 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400 font-mono">
                  {new Set(cuentas.map(c => c.ficha_ruc_id)).size}
                </div>
                <p className="text-xs text-gray-500">Fichas RUC asociadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Cuentas Bancarias Table */}
          <div className="bg-[#121212] border border-gray-800 rounded-lg">
            <CuentaBancariaTable
              cuentas={cuentas}
              onViewCuenta={handleViewCuenta}
              onEditCuenta={handleEditCuenta}
              onDeleteCuenta={handleDeleteCuenta}
            />
          </div>

          {/* Empty State Instructions */}
          {cuentas.length === 0 && !loading && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardContent className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay Cuentas Bancarias</h3>
                <p className="text-gray-400 mb-6">
                  Las cuentas bancarias procesadas por tu agente de IA aparecerán aquí automáticamente.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Para empezar:</p>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. Ve a la página "Subir PDFs"</li>
                    <li>2. Sube documentos tipo "Información Cuenta Bancaria"</li>
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
          <CuentaBancariaModal
            cuenta={selectedCuenta}
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

export default CuentaBancariaPage;