import React, { useEffect } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useDossierData } from '@/hooks/useDossierData';
import DossierSearch from '@/components/dossier/DossierSearch';
import DossierTable from '@/components/dossier/DossierTable';
import DossierViewer from '@/components/dossier/DossierViewer';

const PlanillaRibPage = () => {
  const {
    searching,
    loading,
    error,
    dossier,
    dossierList,
    searchDossierByRuc,
    loadCompletedDossiers,
    setError
  } = useDossierData();

  // Cargar dossiers completados al montar el componente
  useEffect(() => {
    loadCompletedDossiers();
  }, []);

  const handleViewDossier = (ruc: string) => {
    searchDossierByRuc(ruc);
  };

  const handleRefreshList = () => {
    loadCompletedDossiers();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-[#00FF80]" />
                Dossier Completo RIB
              </h1>
              <p className="text-gray-400">Visualizar y descargar el dossier completo de análisis RIB</p>
            </div>
            <Button 
              onClick={handleRefreshList}
              disabled={loading}
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Lista
            </Button>
          </div>

          {/* Búsqueda */}
          <DossierSearch 
            onSearch={searchDossierByRuc}
            searching={searching}
            error={error}
          />

          {/* Tabla de Dossiers Completados */}
          <DossierTable 
            dossiers={dossierList}
            loading={loading}
            onViewDossier={handleViewDossier}
          />

          {/* Visualizador del Dossier */}
          {dossier && (
            <DossierViewer dossier={dossier} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlanillaRibPage;