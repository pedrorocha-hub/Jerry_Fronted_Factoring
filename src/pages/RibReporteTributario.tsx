import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RibReporteTributarioService, RibReporteTributarioSummary } from '@/services/ribReporteTributarioService';
import RibReporteTributarioList from '@/components/rib-reporte-tributario/RibReporteTributarioList';
import { showError, showSuccess } from '@/utils/toast';

const RibReporteTributarioPage = () => {
  const navigate = useNavigate();
  const [reportSummaries, setReportSummaries] = useState<RibReporteTributarioSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const summaries = await RibReporteTributarioService.getAllSummaries();
      setReportSummaries(summaries);
    } catch (err) {
      showError('Error al cargar la lista de reportes.');
    } finally {
      setLoadingSummaries(false);
    }
  };

  const handleSelectReport = (id: string) => {
    navigate(`/rib-reporte-tributario/edit/${id}`);
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer.')) return;
    try {
      await RibReporteTributarioService.delete(id);
      showSuccess('Reporte eliminado exitosamente.');
      await fetchSummaries();
    } catch (err) {
      showError(`Error al eliminar el reporte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ClipboardList className="h-6 w-6 mr-3 text-[#00FF80]" />
              RIB - Reporte Tributario
            </h1>
            <Button 
              onClick={() => navigate('/rib-reporte-tributario/new')}
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reporte
            </Button>
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Reportes Guardados</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummaries ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : (
                <RibReporteTributarioList 
                  reports={reportSummaries} 
                  onSelectReport={handleSelectReport} 
                  onDeleteReport={handleDeleteReport} 
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RibReporteTributarioPage;