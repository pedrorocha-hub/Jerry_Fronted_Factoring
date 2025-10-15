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

  const handleDownload = async () => {
    if (!dossier) {
      showError('No hay dossier cargado para descargar.');
      return;
    }

    const toastId = showLoading('Generando PDF de alta calidad...');
    
    // Render the template off-screen to be captured
    setPdfData(dossier);

    // Use a timeout to ensure the template is rendered in the DOM before capturing
    setTimeout(async () => {
      const element = pdfTemplateRef.current;
      if (!element) {
        dismissToast(toastId);
        showError('No se pudo encontrar la plantilla del PDF para generar el documento.');
        setPdfData(null);
        return;
      }

      try {
        // Configuración optimizada de html2canvas
        const canvas = await html2canvas(element, {
          scale: 2, // Alta calidad (2x)
          useCORS: true,
          logging: false,
          backgroundColor: '#f8f9fa',
          windowWidth: 794, // 210mm en pixels (A4 width)
          windowHeight: element.scrollHeight,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.body.querySelector('[data-pdf-template]');
            if (clonedElement) {
              (clonedElement as HTMLElement).style.display = 'block';
            }
          },
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;

        // Primera página
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pdfHeight;

        // Páginas adicionales
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
          heightLeft -= pdfHeight;
        }

        const fileName = `Dossier_RIB_${dossier.solicitudOperacion.ruc}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        dismissToast(toastId);
        showSuccess('PDF generado exitosamente.');
      } catch (error) {
        console.error('Error generando PDF:', error);
        dismissToast(toastId);
        showError('Error al generar el PDF. Por favor, intenta nuevamente.');
      } finally {
        setPdfData(null);
      }
    }, 500);
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