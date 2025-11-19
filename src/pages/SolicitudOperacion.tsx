import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FilePlus, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import SolicitudOperacionTable from '@/components/solicitud-operacion/SolicitudOperacionTable';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

interface SolicitudOperacionWithDetails extends SolicitudOperacion {
  nombre_empresa?: string;
  creator_name?: string;
  deudor_nombre?: string;
}

const SolicitudesOperacionPage = () => {
  const { isAdmin } = useSession();
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<SolicitudOperacionWithDetails[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`
          *,
          riesgos:solicitud_operacion_riesgos(*),
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (solicitudError) throw solicitudError;
      
      if (solicitudData && solicitudData.length > 0) {
        const proveedorRucs = [...new Set(solicitudData.map(r => r.ruc))];
        const deudorRucs = [...new Set(solicitudData.map(r => r.deudor_ruc).filter((r): r is string => !!r))];
        const allRucs = [...new Set([...proveedorRucs, ...deudorRucs])];

        const { data: top10kData, error: top10kError } = await supabase
          .from('top_10k')
          .select('ruc, razon_social')
          .in('ruc', allRucs);

        if (top10kError) throw top10kError;

        const rucToNameMap = new Map(top10kData.map(f => [f.ruc.toString(), f.razon_social]));

        const enrichedSolicitudes = solicitudData.map(solicitud => ({
          ...solicitud,
          nombre_empresa: rucToNameMap.get(solicitud.ruc) || solicitud.ruc,
          deudor_nombre: solicitud.deudor_ruc ? (rucToNameMap.get(solicitud.deudor_ruc) || solicitud.deudor_ruc) : (solicitud.deudor || 'N/A'),
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