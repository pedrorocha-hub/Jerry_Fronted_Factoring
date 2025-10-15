import React, { useEffect, useState, useRef } from 'react';
import { FolderCheck, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useDossierData } from '@/hooks/useDossierData';
import DossierSearch from '@/components/dossier/DossierSearch';
import DossierTable from '@/components/dossier/DossierTable';
import DossierViewer from '@/components/dossier/DossierViewer';
import DossierPdfTemplate from '@/components/dossier/DossierPdfTemplate';
import { showLoading, dismissToast, showSuccess, showError } from '@/utils/toast';
import jsPDF from 'jspdf';
import { DossierRib } from '@/types/dossier';

const DossiersGuardadosPage = () => {
  const {
    searching,
    loading,
    saving,
    error,
    dossier,
    dossierList,
    searchDossierById,
    saveDossier,
    loadSavedDossiers,
    loadDossierFromSaved,
    setError
  } = useDossierData();

  const [pdfData, setPdfData] = useState<DossierRib | null>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSavedDossiers();
  }, []);

  const handleViewDossier = (solicitudId: string) => {
    loadDossierFromSaved(solicitudId);
  };

  const handleRefreshList = () => {
    loadSavedDossiers();
  };

  const handleSaveDossier = () => {
    saveDossier();
  };

  const handleDownload = () => {
    if (!dossier) return;
    const toastId = showLoading('Generando PDF...');
    
    // Render the template off-screen to be captured
    setPdfData(dossier);

    // Use a timeout to ensure the template is rendered in the DOM before capturing
    setTimeout(() => {
      const element = pdfTemplateRef.current;
      if (!element) {
        dismissToast(toastId);
        showError('No se pudo encontrar la plantilla del PDF para generar el documento.');
        setPdfData(null);
        return;
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.html(element, {
        callback: function (doc) {
          doc.save(`Dossier_RIB_${dossier.solicitudOperacion.ruc}.pdf`);
          dismissToast(toastId);
          showSuccess('PDF generado exitosamente.');
          setPdfData(null); // Clean up the rendered template from the DOM
        },
        x: 0,
        y: 0,
        width: 210, // A4 width in mm
        windowWidth: element.scrollWidth,
        autoPaging: 'text',
        margin: [15, 15, 15, 15]
      });
    }, 500); // A small delay to ensure the component has rendered
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FolderCheck className="h-6 w-6 mr-3 text-[#00FF80]" />
                Dossiers Guardados
              </h1>
              <p className="text-gray-400">Busca, visualiza y gestiona los dossiers de empresas</p>
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

          <DossierSearch 
            onSearch={searchDossierById}
            searching={searching}
            error={error}
          />

          <DossierTable 
            dossiers={dossierList}
            loading={loading}
            onViewDossier={handleViewDossier}
          />

          {dossier && (
            <DossierViewer 
              dossier={dossier} 
              onSave={handleSaveDossier}
              saving={saving}
              onDownload={handleDownload}
            />
          )}
        </div>
      </div>
      {pdfData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <DossierPdfTemplate ref={pdfTemplateRef} dossier={pdfData} />
        </div>
      )}
    </Layout>
  );
};

export default DossiersGuardadosPage;