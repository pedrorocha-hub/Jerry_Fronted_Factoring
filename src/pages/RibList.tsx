import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FilePlus, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rib } from '@/types/rib';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import RibTable from '@/components/rib/RibTable';
import RibPdfTemplate from '@/components/rib/RibPdfTemplate';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSession } from '@/contexts/SessionContext';

interface Top10kData {
  descripcion_ciiu_rev3: string | null;
  sector: string | null;
  ranking_2024: number | null;
}

// Define an extended type for Ribs that includes company name and creator name
interface RibWithDetails extends Rib {
  nombre_empresa?: string;
  creator_name?: string;
}

const RibListPage = () => {
  const { isAdmin } = useSession();
  const navigate = useNavigate();
  // Use the new extended type for the state
  const [ribs, setRibs] = useState<RibWithDetails[]>([]);
  const [loadingRibs, setLoadingRibs] = useState(true);
  const [pdfData, setPdfData] = useState<{ rib: Rib; ficha: FichaRuc; top10k: Top10kData | null } | null>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRibs();
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
        pdf.save(`RIB_${pdfData.rib.ruc}.pdf`);
        
        dismissToast();
        showSuccess('PDF generado exitosamente.');
        setPdfData(null);
      });
    }
  }, [pdfData]);

  const loadRibs = async () => {
    setLoadingRibs(true);
    try {
      // Fetch RIBs and join with profiles to get creator's name
      const { data: ribData, error: ribError } = await supabase
        .from('ribs')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (ribError) throw ribError;
      
      if (ribData && ribData.length > 0) {
        // Get unique RUCs to fetch company names
        const rucs = [...new Set(ribData.map(r => r.ruc))];
        
        // Fetch corresponding FichaRuc data
        const { data: fichasData, error: fichasError } = await supabase
          .from('ficha_ruc')
          .select('ruc, nombre_empresa')
          .in('ruc', rucs);

        if (fichasError) throw fichasError;

        // Create a map for easy lookup
        const rucToNameMap = new Map(fichasData.map(f => [f.ruc, f.nombre_empresa]));

        // Enrich the Rib data with the company name and creator name
        const enrichedRibs = ribData.map(rib => ({
          ...rib,
          nombre_empresa: rucToNameMap.get(rib.ruc) || 'Razón Social no encontrada',
          creator_name: rib.profiles?.full_name || 'Sistema'
        }));
        
        setRibs(enrichedRibs);
      } else {
        setRibs([]);
      }

    } catch (err) {
      showError('No se pudieron cargar las fichas Rib existentes.');
    } finally {
      setLoadingRibs(false);
    }
  };

  const handleEditRib = (rib: Rib) => {
    navigate(`/rib/edit/${rib.id}`);
  };

  const handleDeleteRib = async (rib: Rib) => {
    if (window.confirm(`¿Está seguro de eliminar la ficha Rib para el RUC ${rib.ruc}?`)) {
      const toastId = showLoading('Eliminando ficha Rib...');
      try {
        // This should be adapted to use RibService if it handles deletion logic
        const { error } = await supabase.from('ribs').delete().eq('id', rib.id);
        if (error) throw error;
        
        dismissToast(toastId);
        showSuccess('Ficha Rib eliminada.');
        await loadRibs();
      } catch (err) {
        dismissToast(toastId);
        showError('No se pudo eliminar la ficha Rib.');
      }
    }
  };

  const handleDownloadRib = async (rib: Rib) => {
    showLoading('Generando PDF...');
    try {
      const [fichaData, top10kDataResult] = await Promise.all([
        FichaRucService.getByRuc(rib.ruc),
        supabase.from('top_10k').select('descripcion_ciiu_rev3, sector, ranking_2024').eq('ruc', rib.ruc).single()
      ]);

      if (!fichaData) {
        dismissToast();
        showError('No se pudo encontrar la Ficha RUC para generar el PDF.');
        return;
      }

      setPdfData({
        rib,
        ficha: fichaData,
        top10k: top10kDataResult.data
      });
    } catch (err) {
      dismissToast();
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
                FICHAS RIB
              </h1>
              <p className="text-gray-400">Reportes de Inicio Básico de empresa</p>
            </div>
            {isAdmin && (
              <Button onClick={() => navigate('/rib/new')} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                <FilePlus className="h-4 w-4 mr-2" />
                Crear Ficha Rib
              </Button>
            )}
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Fichas Rib Creadas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRibs ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : (
                <RibTable ribs={ribs} onEdit={handleEditRib} onDelete={handleDeleteRib} onDownload={handleDownloadRib} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {pdfData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }}>
          <RibPdfTemplate ref={pdfTemplateRef} data={pdfData} />
        </div>
      )}
    </Layout>
  );
};

export default RibListPage;