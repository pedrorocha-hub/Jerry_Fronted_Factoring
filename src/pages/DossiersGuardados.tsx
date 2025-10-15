import React, { useEffect, useState, useRef } from 'react';
import { FolderCheck, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useDossierData } from '@/hooks/useDossierData';
import DossierSearch from '@/components/dossier/DossierSearch';
import DossierTable from '@/components/dossier/DossierTable';
import DossierViewer from '@/components/dossier/DossierViewer';
import DossierPdfTemplate from '@/components/dossier/DossierPdfTemplate';
import { showLoading, dismissToast, showSuccess } from '@/utils/toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  const [generatingPdfToastId, setGeneratingPdfToastId] = useState<string | number | null>(null);

  useEffect(() => {
    loadSavedDossiers();
  }, []);

  useEffect(() => {
    if (pdfData && pdfTemplateRef.current) {
      const element = pdfTemplateRef.current;
      html2canvas(element, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth - 20; // with margin
        const imgHeight = imgWidth / ratio;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`Dossier_RIB_${pdfData.solicitudOperacion.ruc}.pdf`);
        
        if (generatingPdfToastId) dismissToast(generatingPdfToastId);
        showSuccess('PDF generado exitosamente.');
        setPdfData(null);
        setGeneratingPdfToastId(null);
      });
    }
  }, [pdfData, generatingPdfToastId]);

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
    setGeneratingPdfToastId(toastId);
    setPdfData(dossier);
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