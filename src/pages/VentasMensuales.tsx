import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VentasMensualesService } from '@/services/ventasMensualesService';
import { VentasMensualesSummary } from '@/types/ventasMensuales';
import VentasMensualesList from '@/components/ventas-mensuales/VentasMensualesList';
import { showError, showSuccess } from '@/utils/toast';

const VentasMensualesPage = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<VentasMensualesSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const summaryData = await VentasMensualesService.getAllSummaries();
      setSummaries(summaryData);
    } catch (err) {
      showError('Error al cargar la lista de reportes de ventas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = (summary: VentasMensualesSummary) => {
    // Navegar con RUC y solicitud_id como query params
    const params = new URLSearchParams({
      ruc: summary.ruc,
      solicitud_id: summary.solicitud_id || 'null'
    });
    navigate(`/ventas-mensuales/edit?${params.toString()}`);
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este reporte de ventas?')) {
      try {
        await VentasMensualesService.deleteById(id);
        showSuccess('Reporte de ventas eliminado exitosamente.');
        await fetchSummaries();
      } catch (err) {
        showError('Error al eliminar el reporte de ventas.');
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-[#00FF80]" />
              Análisis de Ventas Mensuales
            </h1>
            <Button 
              onClick={() => navigate('/ventas-mensuales/new')}
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
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : (
                <VentasMensualesList 
                  items={summaries} 
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

export default VentasMensualesPage;