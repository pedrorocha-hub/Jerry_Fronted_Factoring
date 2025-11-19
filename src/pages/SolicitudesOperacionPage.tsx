import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FilePlus, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import SolicitudOperacionTable from '@/components/solicitud-operacion/SolicitudOperacionTable';

import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSession } from '@/contexts/SessionContext';

interface Top10kData {
  descripcion_ciiu_rev3: string | null;
  sector: string | null;
  ranking_2024: number | null;
}

interface SolicitudOperacionWithDetails extends SolicitudOperacion {
  nombre_empresa?: string;
  creator_name?: string;
}

const SolicitudesOperacionPage = () => {
  const { isAdmin } = useSession();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<SolicitudOperacionWithDetails[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);
  const [pdfData, setPdfData] = useState<{ solicitudOperacion: SolicitudOperacion; ficha: FichaRuc; top10k: Top10kData | null } | null>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const [generatingPdfToastId, setGeneratingPdfToastId] = useState<string | number | null>(null);

  useEffect(() => {
    loadSolicitudes();
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
        const imgWidth = pdfWidth - 20;
        const imgHeight = imgWidth / ratio;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`Solicitud_Operacion_${pdfData.solicitudOperacion.ruc}.pdf`);

        if (generatingPdfToastId) dismissToast(generatingPdfToastId);
        showSuccess('PDF generado exitosamente.');
        setPdfData(null);
        setGeneratingPdfToastId(null);
      });
    }
  }, [pdfData, generatingPdfToastId]);

  const loadSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (solicitudError) throw solicitudError;

      if (solicitudData && solicitudData.length > 0) {
        const rucs = [...new Set(solicitudData.map(r => r.ruc))];

        const { data: fichasData, error: fichasError } = await supabase
          .from('ficha_ruc')
          .select('ruc, nombre_empresa')
          .in('ruc', rucs);

        if (fichasError) throw fichasError;

        const rucToNameMap = new Map(fichasData.map(f => [f.ruc, f.nombre_empresa]));

        const enrichedSolicitudes = solicitudData.map(solicitud => ({
          ...solicitud,
          nombre_empresa: rucToNameMap.get(solicitud.ruc) || 'Razón Social no encontrada',
          creator_name: (solicitud.profiles as any)?.full_name || 'Sistema'
        }));

        setSolicitudes(enrichedSolicitudes);
      } else {
        setSolicitudes([]);
      }

    } catch (err) {
      showError('No se pudieron cargar las solicitudes de operación.');
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  const handleEdit = (solicitud: SolicitudOperacion) => {
    navigate(`/solicitudes-operacion/edit/${solicitud.id}`);
  };

  const handleDelete = async (solicitud: SolicitudOperacion) => {
    if (window.confirm(`¿Está seguro de eliminar la solicitud para el RUC ${solicitud.ruc}?`)) {
      const toastId = showLoading('Eliminando solicitud...');
      try {
        const { error } = await supabase.from('solicitudes_operacion').delete().eq('id', solicitud.id);
        if (error) throw error;

        dismissToast(toastId);
        showSuccess('Solicitud eliminada.');
        await loadSolicitudes();
      } catch (err) {
        dismissToast(toastId);
        showError('No se pudo eliminar la solicitud.');
      }
    }
  };

  const handleDownload = async (solicitud: SolicitudOperacion) => {
    const toastId = showLoading('Generando PDF...');
    setGeneratingPdfToastId(toastId);
    try {
      const [fichaData, top10kDataResult] = await Promise.all([
        FichaRucService.getByRuc(solicitud.ruc),
        supabase.from('top_10k').select('descripcion_ciiu_rev3, sector, ranking_2024').eq('ruc', solicitud.ruc).single()
      ]);

      if (!fichaData) {
        dismissToast(toastId);
        showError('No se pudo encontrar la Ficha RUC para generar el PDF.');
        return;
      }

      setPdfData({
        solicitudOperacion: solicitud,
        ficha: fichaData,
        top10k: top10kDataResult.data
      });
    } catch (err) {
      dismissToast(toastId);
      showError('Error al preparar los datos para el PDF.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-[#00FF80]" />
                Solicitudes de Operación
              </h1>
              <p className="text-gray-400">Reportes de Inicio Básico de empresa</p>
            </div>
            {isAdmin && (
              <Button onClick={() => navigate('/solicitudes-operacion/new')} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                <FilePlus className="h-4 w-4 mr-2" />
                Crear Solicitud
              </Button>
            )}
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Solicitudes Creadas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSolicitudes ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : (
                <SolicitudOperacionTable solicitudes={solicitudes} onEdit={handleEdit} onDelete={handleDelete} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudesOperacionPage;