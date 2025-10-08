import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Loader2, FileSearch } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import SolicitudOperacionTable from '@/components/solicitud-operacion/SolicitudOperacionTable';

interface SolicitudOperacionWithDetails extends SolicitudOperacion {
  nombre_empresa?: string;
  creator_name?: string;
}

const RibProcessListPage = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<SolicitudOperacionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    setLoading(true);
    try {
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`*, profiles (full_name)`)
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
          creator_name: solicitud.profiles?.full_name || 'Sistema'
        }));
        setSolicitudes(enrichedSolicitudes);
      } else {
        setSolicitudes([]);
      }
    } catch (err) {
      showError('No se pudieron cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDossier = (solicitud: SolicitudOperacion) => {
    navigate(`/proceso-rib/${solicitud.id}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FolderKanban className="h-6 w-6 mr-3 text-[#00FF80]" />
            Proceso RIB - Dossiers de Operación
          </h1>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Lista de Análisis Iniciados</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay procesos RIB iniciados.</p>
                  <p className="text-sm mt-2">Cree una nueva Solicitud de Operación para iniciar un proceso.</p>
                </div>
              ) : (
                <SolicitudOperacionTable 
                  solicitudes={solicitudes} 
                  onEdit={handleViewDossier} // Reutilizamos onEdit para ver dossier
                  onDelete={() => {}} // No se elimina desde aquí
                  onDownload={() => {}} // No se descarga desde aquí
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RibProcessListPage;