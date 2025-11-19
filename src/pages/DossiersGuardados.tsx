import React, { useEffect, useState, useRef } from 'react';
import { FolderCheck, RefreshCw, Download, X } from 'lucide-react';
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
    deleteDossier,
    loadSavedDossiers,
    loadDossierFromSaved,
    setError
  } = useDossierData();

  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'multipage' | 'continuous'>('multipage');
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

  // Ver preview del PDF en pantalla
  const handleShowPreview = () => {
    setShowPdfPreview(true);
  };

  // Descargar PDF con formato seleccionado
  const handleDownloadPDF = async () => {
    if (!dossier) return;
    
    const formatLabel = downloadFormat === 'continuous' ? 'continuo' : 'multipágina';
    const toastId = showLoading(`Generando PDF ${formatLabel}...`);

    setTimeout(async () => {
      const element = pdfTemplateRef.current;
      if (!element) {
        dismissToast(toastId);
        showError('No se pudo encontrar la plantilla del PDF.');
        return;
      }

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#f8f9fa',
          windowWidth: 794,
          windowHeight: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let pdf;

        if (downloadFormat === 'continuous') {
          // FORMATO CONTINUO - UNA SOLA PÁGINA LARGA
          pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [imgWidth, imgHeight], // Página con altura dinámica
            compress: true,
          });
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        } else {
          // FORMATO MULTIPÁGINA - A4 ESTÁNDAR
          pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
          });

          const pdfHeight = pdf.internal.pageSize.getHeight();
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
            heightLeft -= pdfHeight;
          }
        }

        const formatSuffix = downloadFormat === 'continuous' ? 'continuo' : 'multipage';
        const fileName = `Dossier_RIB_${dossier.solicitudOperacion.ruc}_${formatSuffix}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        dismissToast(toastId);
        showSuccess(`PDF ${formatLabel} generado exitosamente.`);
      } catch (error) {
        console.error('Error generando PDF:', error);
        dismissToast(toastId);
        showError('Error al generar el PDF.');
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
                Reportes finales RIB guardados
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
            onDeleteDossier={deleteDossier}
          />

          {dossier && !showPdfPreview && (
            <DossierViewer 
              dossier={dossier} 
              onSave={handleSaveDossier}
              saving={saving}
              onDownload={handleShowPreview}
            />
          )}

          {/* PREVIEW DEL PDF EN PANTALLA CON SCROLL */}
          {dossier && showPdfPreview && (
            <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
              <div className="min-h-screen py-8">
                {/* Botones de acción flotantes */}
                <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
                  {/* Selector de Formato */}
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2 font-medium">Formato de descarga:</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setDownloadFormat('multipage')}
                        variant={downloadFormat === 'multipage' ? 'default' : 'outline'}
                        size="sm"
                        className={downloadFormat === 'multipage' 
                          ? 'bg-[#00FF80] hover:bg-[#00FF80]/90 text-black' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                        }
                      >
                        📄 Multipágina
                      </Button>
                      <Button
                        onClick={() => setDownloadFormat('continuous')}
                        variant={downloadFormat === 'continuous' ? 'default' : 'outline'}
                        size="sm"
                        className={downloadFormat === 'continuous' 
                          ? 'bg-[#00FF80] hover:bg-[#00FF80]/90 text-black' 
                          : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                        }
                      >
                        📜 Continuo
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {downloadFormat === 'multipage' 
                        ? '✓ Ideal para imprimir (páginas A4)' 
                        : '✓ Ideal para lectura digital (scroll continuo)'
                      }
                    </p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadPDF}
                      className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button
                      onClick={() => setShowPdfPreview(false)}
                      variant="outline"
                      className="border-gray-600 text-white hover:bg-gray-800"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cerrar
                    </Button>
                  </div>
                </div>

                {/* Contenedor del PDF con scroll */}
                <div className="max-w-[210mm] mx-auto shadow-2xl">
                  <DossierPdfTemplate ref={pdfTemplateRef} dossier={dossier} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DossiersGuardadosPage;