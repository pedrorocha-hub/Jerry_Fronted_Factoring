import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderKanban, Loader2, ArrowLeft, Download, Building2, User } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { Rib } from '@/types/rib';
import { ComportamientoCrediticio } from '@/types/comportamientoCrediticio';
import { ReporteTributarioDeudor } from '@/services/reporteTributarioDeudorService';
import { VentasMensualesProveedor } from '@/types/ventasMensualesProveedor';
import { FichaRuc } from '@/types/ficha-ruc';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { RibService } from '@/services/ribService';
import { ComportamientoCrediticioService } from '@/services/comportamientoCrediticioService';
import { ReporteTributarioDeudorService } from '@/services/reporteTributarioDeudorService';
import { VentasMensualesProveedorService } from '@/services/ventasMensualesProveedorService';
import { FichaRucService } from '@/services/fichaRucService';
import { showError, showLoading, dismissToast, showSuccess } from '@/utils/toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importar los nuevos componentes de visualización
import SolicitudView from '@/components/rib-process/SolicitudView';
import AnalisisRibView from '@/components/rib-process/AnalisisRibView';
import ComportamientoCrediticioView from '@/components/rib-process/ComportamientoCrediticioView';
import ReporteDeudorView from '@/components/rib-process/ReporteDeudorView';
import VentasProveedorView from '@/components/rib-process/VentasProveedorView';
import RibDossierPdfTemplate from '@/components/rib-process/RibDossierPdfTemplate';

const RibProcessDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    solicitud: SolicitudOperacion | null;
    rib: Rib | null;
    comportamiento: ComportamientoCrediticio | null;
    reporteDeudor: ReporteTributarioDeudor | null;
    ventasProveedor: VentasMensualesProveedor | null;
    fichaProveedor: FichaRuc | null;
    fichaDeudor: FichaRuc | null;
  } | null>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      showError("ID de solicitud no encontrado.");
      navigate('/proceso-rib');
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      try {
        const solicitud = await SolicitudOperacionService.getById(id);
        if (!solicitud) throw new Error("Solicitud no encontrada");

        const rucProveedor = solicitud.ruc;
        const rucDeudor = solicitud.deudor; // Asumiendo que el RUC del deudor está en el campo 'deudor'

        const [
          ribData,
          comportamientoData,
          reporteDeudorData,
          ventasProveedorData,
          fichaProveedorData,
          fichaDeudorData
        ] = await Promise.all([
          RibService.getByRuc(rucProveedor).then(res => res[0] || null),
          ComportamientoCrediticioService.getByRuc(rucProveedor).then(res => res[0] || null),
          rucDeudor ? ReporteTributarioDeudorService.getByRuc(rucDeudor) : Promise.resolve(null),
          VentasMensualesProveedorService.getByRuc(rucProveedor),
          FichaRucService.getByRuc(rucProveedor),
          rucDeudor ? FichaRucService.getByRuc(rucDeudor) : Promise.resolve(null),
        ]);

        setData({
          solicitud,
          rib: ribData,
          comportamiento: comportamientoData,
          reporteDeudor: reporteDeudorData,
          ventasProveedor: ventasProveedorData,
          fichaProveedor: fichaProveedorData,
          fichaDeudor: fichaDeudorData,
        });

      } catch (err) {
        showError("Error al cargar los datos del dossier.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id, navigate]);

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
        const imgHeight = (pdfWidth - 20) / ratio;
        
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, imgHeight);
        pdf.save(`Dossier_RIB_${data?.solicitud?.ruc}.pdf`);
        
        dismissToast();
        showSuccess('PDF generado exitosamente.');
        setPdfData(null);
      });
    }
  }, [pdfData, data]);

  const handleDownload = () => {
    if (data) {
      showLoading('Generando PDF...');
      setPdfData(data);
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-screen bg-black"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div></Layout>;
  }

  if (!data) {
    return <Layout><div className="text-center py-12 text-gray-400">No se encontraron datos para esta solicitud.</div></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="p-6 space-y-6">
          <div className="sticky top-0 bg-black/80 backdrop-blur-sm py-4 z-10 -mx-6 px-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/proceso-rib')} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center">
                    <FolderKanban className="h-6 w-6 mr-3 text-[#00FF80]" />
                    Dossier de Operación
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <div className="flex items-center gap-2"><Building2 className="h-4 w-4" /><span>Proveedor: {data.fichaProveedor?.nombre_empresa || data.solicitud?.ruc}</span></div>
                    <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>Deudor: {data.fichaDeudor?.nombre_empresa || data.solicitud?.deudor || 'N/A'}</span></div>
                  </div>
                </div>
              </div>
              <Button onClick={handleDownload} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                <Download className="h-4 w-4 mr-2" />
                Descargar Dossier en PDF
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <SolicitudView data={data.solicitud} />
            <AnalisisRibView data={data.rib} />
            <ComportamientoCrediticioView data={data.comportamiento} />
            <ReporteDeudorView data={data.reporteDeudor} />
            <VentasProveedorView data={data.ventasProveedor} />
          </div>
        </div>
      </div>
      {pdfData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }}>
          <RibDossierPdfTemplate ref={pdfTemplateRef} data={pdfData} />
        </div>
      )}
    </Layout>
  );
};

export default RibProcessDetailPage;