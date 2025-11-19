import React, { useState, useEffect } from 'react';
import { Plus, Receipt, DollarSign, Calendar, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import FacturaNegociarTable from '@/components/factura-negociar/FacturaNegociarTable';
import FacturaNegociarModal from '@/components/factura-negociar/FacturaNegociarModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FacturaNegociarWithFicha, FacturaNegociarInsert } from '@/types/factura-negociar';
import { FacturaNegociarService } from '@/services/facturaNegociarService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

const FacturaNegociarPage = () => {
  const { isAdmin } = useSession();
  const [facturas, setFacturas] = useState<FacturaNegociarWithFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<FacturaNegociarWithFicha | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    pendientes: 0,
    negociadas: 0,
    vencidas: 0,
    proximasVencer: 0,
    montoTotalPendiente: 0,
    montoTotalNegociado: 0,
    montoTotalVencido: 0,
    estadoDistribution: {} as { [key: string]: number }
  });

  useEffect(() => {
    loadFacturas();
    loadStats();
  }, []);

  const loadFacturas = async () => {
    try {
      setError(null);
      const data = await FacturaNegociarService.getAll();
      setFacturas(data);
    } catch (error) {
      console.error('Error loading facturas a negociar:', error);
      setError('Error cargando las facturas a negociar');
      showError('Error cargando las facturas a negociar');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await FacturaNegociarService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleViewFactura = (factura: FacturaNegociarWithFicha) => {
    setSelectedFactura(factura);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditFactura = (factura: FacturaNegociarWithFicha) => {
    setSelectedFactura(factura);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteFactura = async (factura: FacturaNegociarWithFicha) => {
    if (window.confirm(`¿Está seguro de eliminar la factura ${factura.numero_factura}?`)) {
      try {
        await FacturaNegociarService.delete(factura.id);
        await loadFacturas();
        await loadStats();
        showSuccess('Factura eliminada exitosamente');
      } catch (error) {
        showError('Error eliminando la factura');
      }
    }
  };

  const handleNegociarFactura = async (factura: FacturaNegociarWithFicha) => {
    // TODO: Implementar lógica de negociación
    showSuccess(`Iniciando negociación de factura ${factura.numero_factura}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedFactura(null);
  };

  const handleModalSave = async () => {
    // Recargar datos después de guardar
    await loadFacturas();
    await loadStats();
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    setLoading(true);
    await loadFacturas();
    await loadStats();
    dismissToast(loadingToast);
    showSuccess('Datos actualizados');
  };

  const handleCreateTestData = async () => {
    const loadingToast = showLoading('Creando datos de prueba...');
    
    try {
      const testRuc = '20123456789';
      // Crear algunas facturas de prueba
      const testFacturas: FacturaNegociarInsert[] = [
        {
          ruc: testRuc,
          numero_factura: 'F001-00000123',
          fecha_emision: '2024-01-15',
          fecha_vencimiento: '2024-02-15',
          monto_total: 15000.00,
          monto_igv: 2700.00,
          monto_neto: 12300.00,
          estado_negociacion: 'Pendiente'
        },
        {
          ruc: testRuc,
          numero_factura: 'F001-00000124',
          fecha_emision: '2024-01-20',
          fecha_vencimiento: '2024-02-20',
          monto_total: 8500.50,
          monto_igv: 1530.09,
          monto_neto: 6970.41,
          estado_negociacion: 'Negociada',
          fecha_negociacion: '2024-02-18',
          monto_negociado: 8000.00
        },
        {
          ruc: testRuc,
          numero_factura: 'F001-00000125',
          fecha_emision: '2023-12-10',
          fecha_vencimiento: '2024-01-10',
          monto_total: 25000.00,
          monto_igv: 4500.00,
          monto_neto: 20500.00,
          estado_negociacion: 'Vencida'
        }
      ];

      for (const facturaData of testFacturas) {
        await FacturaNegociarService.create(facturaData);
      }

      dismissToast(loadingToast);
      showSuccess('Datos de prueba creados exitosamente');
      await loadFacturas();
      await loadStats();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error creando datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'S/ 0.00';
    }
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
              <h1 className="text-2xl font-bold text-white">Facturas a Negociar</h1>
              <p className="text-gray-400">
                Gestión de facturas extraídas de documentos para negociación
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
              {isAdmin && facturas.length === 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleCreateTestData}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Datos de Prueba
                </Button>
              )}
              {isAdmin && (
                <Button className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Total Facturas
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <Receipt className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                <p className="text-xs text-gray-500">Facturas registradas</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Monto Total Pendiente
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <DollarSign className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">
                  {formatCurrency(stats.montoTotalPendiente)}
                </div>
                <p className="text-xs text-gray-500">Valor pendiente</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-yellow-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Pendientes
                </CardTitle>
                <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400 font-mono">{stats.pendientes}</div>
                <p className="text-xs text-gray-500">Facturas pendientes</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-red-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Vencidas
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <Calendar className="h-4 w-4 text-red-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400 font-mono">{stats.vencidas}</div>
                <p className="text-xs text-gray-500">Facturas vencidas</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Monto Negociado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#00FF80]">
                  {formatCurrency(stats.montoTotalNegociado)}
                </div>
                <p className="text-sm text-gray-400">Total negociado exitosamente</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                  Nuevas Este Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-400">{stats.thisMonth}</div>
                <p className="text-sm text-gray-400">Facturas registradas este mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Facturas a Negociar Table */}
          <FacturaNegociarTable
            facturas={facturas}
            onViewFactura={handleViewFactura}
            onEditFactura={handleEditFactura}
            onDeleteFactura={handleDeleteFactura}
            onNegociarFactura={handleNegociarFactura}
          />

          {/* Empty State Instructions */}
          {facturas.length === 0 && !loading && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardContent className="text-center py-12">
                <Receipt className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay Facturas a Negociar</h3>
                <p className="text-gray-400 mb-6">
                  Las facturas procesadas por tu agente de IA aparecerán aquí automáticamente.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Para empezar:</p>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. Ve a la página "Subir PDFs"</li>
                    <li>2. Sube documentos tipo "Factura a Negociar"</li>
                    <li>3. El agente procesará automáticamente los datos</li>
                    <li>4. Los resultados aparecerán en esta tabla</li>
                  </ol>
                </div>
                <div className="mt-6 space-x-3">
                  {isAdmin && (
                    <Button onClick={handleCreateTestData} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Datos de Prueba
                    </Button>
                  )}
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
          <FacturaNegociarModal
            factura={selectedFactura}
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

export default FacturaNegociarPage;