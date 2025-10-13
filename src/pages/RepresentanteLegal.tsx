import React, { useState, useEffect } from 'react';
import { Plus, Users, Building2, Calendar, RefreshCw, UserCheck, UserX } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import RepresentanteLegalTable from '@/components/representante-legal/RepresentanteLegalTable';
import RepresentanteLegalModal from '@/components/representante-legal/RepresentanteLegalModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RepresentanteLegalWithFicha, RepresentanteLegalInsert } from '@/types/representante-legal';
import { RepresentanteLegalService } from '@/services/representanteLegalService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const RepresentanteLegalPage = () => {
  const [representantes, setRepresentantes] = useState<RepresentanteLegalWithFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRepresentante, setSelectedRepresentante] = useState<RepresentanteLegalWithFicha | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    withCargo: 0,
    withoutCargo: 0,
    mostCommonCargo: '',
    documentTypeDistribution: {} as { [key: string]: number }
  });

  useEffect(() => {
    console.log('RepresentanteLegal: Component mounted, loading data...');
    loadRepresentantes();
    loadStats();
  }, []);

  const loadRepresentantes = async () => {
    try {
      console.log('RepresentanteLegal: Loading representantes...');
      setError(null);
      const data = await RepresentanteLegalService.getAll();
      console.log('RepresentanteLegal: Data loaded:', data);
      setRepresentantes(data || []);
    } catch (error) {
      console.error('RepresentanteLegal: Error loading representantes legales:', error);
      setError(`Error cargando los representantes legales: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      showError('Error cargando los representantes legales');
      setRepresentantes([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('RepresentanteLegal: Loading stats...');
      const statsData = await RepresentanteLegalService.getStats();
      console.log('RepresentanteLegal: Stats loaded:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('RepresentanteLegal: Error loading stats:', error);
      // No mostrar error para stats, usar valores por defecto
      setStats({
        total: 0,
        thisMonth: 0,
        withCargo: 0,
        withoutCargo: 0,
        mostCommonCargo: '',
        documentTypeDistribution: {}
      });
    }
  };

  const handleViewRepresentante = (representante: RepresentanteLegalWithFicha) => {
    console.log('RepresentanteLegal: Viewing representante:', representante);
    setSelectedRepresentante(representante);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEditRepresentante = (representante: RepresentanteLegalWithFicha) => {
    console.log('RepresentanteLegal: Editing representante:', representante);
    setSelectedRepresentante(representante);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteRepresentante = async (representante: RepresentanteLegalWithFicha) => {
    if (window.confirm(`¿Está seguro de eliminar el representante legal ${representante.nombre_completo}?`)) {
      try {
        await RepresentanteLegalService.delete(representante.id);
        await loadRepresentantes();
        await loadStats();
        showSuccess('Representante legal eliminado exitosamente');
      } catch (error) {
        console.error('RepresentanteLegal: Error deleting:', error);
        showError('Error eliminando el representante legal');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRepresentante(null);
  };

  const handleModalSave = async () => {
    // Recargar datos después de guardar
    await loadRepresentantes();
    await loadStats();
  };

  const handleRefresh = async () => {
    const loadingToast = showLoading('Actualizando datos...');
    setLoading(true);
    await loadRepresentantes();
    await loadStats();
    dismissToast(loadingToast);
    showSuccess('Datos actualizados');
  };

  const handleCreateTestData = async () => {
    const loadingToast = showLoading('Creando datos de prueba...');
    
    try {
      // Primero verificar si existe al menos una ficha RUC
      const fichasRuc = await FichaRucService.getAll();
      let testRuc = '20123456789';

      if (fichasRuc.length > 0) {
        testRuc = fichasRuc[0].ruc;
      } else {
        // Crear una ficha RUC de prueba primero
        await FichaRucService.create({
          nombre_empresa: 'EMPRESA DE PRUEBA S.A.C.',
          ruc: testRuc,
          actividad_empresa: 'Actividad de prueba',
          estado_contribuyente: 'Activo'
        });
      }

      // Crear representantes legales de prueba
      const testRepresentantes: RepresentanteLegalInsert[] = [
        {
          ruc: testRuc,
          nombre_completo: 'JUAN CARLOS EJEMPLO LOPEZ',
          numero_documento_identidad: '12345678',
          cargo: 'Gerente General',
          vigencia_poderes: 'Vigente hasta 2025',
          estado_civil: 'Casado',
          domicilio: 'AV. EJEMPLO 123, LIMA, LIMA, PERU',
        },
        {
          ruc: testRuc,
          nombre_completo: 'MARIA ELENA SERVICIOS GARCIA',
          numero_documento_identidad: '87654321',
          cargo: 'Administradora',
          vigencia_poderes: 'Vigente hasta 2024',
          estado_civil: 'Soltera',
          domicilio: 'JR. COMERCIO 456, AREQUIPA, AREQUIPA, PERU',
        },
        {
          ruc: testRuc,
          nombre_completo: 'CARLOS ALBERTO CONSTRUCTOR RUIZ',
          numero_documento_identidad: '11223344',
          cargo: 'Representante Legal',
          vigencia_poderes: 'Vigente hasta 2026',
          estado_civil: 'Divorciado',
          domicilio: 'AV. CONSTRUCCION 789, TRUJILLO, LA LIBERTAD, PERU',
        }
      ];

      for (const representanteData of testRepresentantes) {
        await RepresentanteLegalService.create(representanteData);
      }

      dismissToast(loadingToast);
      showSuccess('Datos de prueba creados exitosamente');
      await loadRepresentantes();
      await loadStats();
    } catch (error) {
      dismissToast(loadingToast);
      console.error('RepresentanteLegal: Error creating test data:', error);
      showError(`Error creando datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  console.log('RepresentanteLegal: Rendering with state:', { 
    loading, 
    error, 
    representantesCount: representantes.length,
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
              <h1 className="text-2xl font-bold text-white">Representantes Legales</h1>
              <p className="text-gray-400">
                Gestión de representantes legales extraídos de documentos
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
              {representantes.length === 0 && (
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
                Nuevo Representante
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
                  Total Representantes
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <Users className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
                <p className="text-xs text-gray-500">Representantes registrados</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Con Cargo Definido
                </CardTitle>
                <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                  <UserCheck className="h-4 w-4 text-[#00FF80]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#00FF80] font-mono">{stats.withCargo}</div>
                <p className="text-xs text-gray-500">Tienen cargo especificado</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-gray-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Sin Cargo Definido
                </CardTitle>
                <div className="p-2 bg-gray-500/10 rounded-lg border border-gray-500/20">
                  <UserX className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400 font-mono">{stats.withoutCargo}</div>
                <p className="text-xs text-gray-500">Sin cargo especificado</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800 hover:border-purple-500/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Nuevos Este Mes
                </CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400 font-mono">{stats.thisMonth}</div>
                <p className="text-xs text-gray-500">Registrados este mes</p>
              </CardContent>
            </Card>
          </div>

          {/* Cargo más común */}
          {stats.mostCommonCargo && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Cargo Más Común
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-[#00FF80]">{stats.mostCommonCargo}</div>
                <p className="text-sm text-gray-400">Cargo más frecuente entre los representantes</p>
              </CardContent>
            </Card>
          )}

          {/* Representantes Legales Table */}
          <RepresentanteLegalTable
            representantes={representantes}
            onViewRepresentante={handleViewRepresentante}
            onEditRepresentante={handleEditRepresentante}
            onDeleteRepresentante={handleDeleteRepresentante}
          />

          {/* Empty State Instructions */}
          {representantes.length === 0 && !loading && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay Representantes Legales</h3>
                <p className="text-gray-400 mb-6">
                  Los representantes legales procesados por tu agente de IA aparecerán aquí automáticamente.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Para empezar:</p>
                  <ol className="text-sm text-gray-400 space-y-1">
                    <li>1. Ve a la página "Subir PDFs"</li>
                    <li>2. Sube documentos tipo "Documento Representante Legal"</li>
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
          <RepresentanteLegalModal
            representante={selectedRepresentante}
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

export default RepresentanteLegalPage;