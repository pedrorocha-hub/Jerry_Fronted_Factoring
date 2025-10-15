import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, ClipboardList } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RibReporteTributarioService } from '@/services/ribReporteTributarioService';
import { FichaRucService } from '@/services/fichaRucService';
import { showError } from '@/utils/toast';
import RibReporteTributarioList from '@/components/rib-reporte-tributario/RibReporteTributarioList';

interface GroupedReport {
  ruc: string;
  nombre_empresa: string;
  reports: any[];
  last_updated_at: string;
  status: string;
  creator_name: string;
}

const RibReporteTributarioPage = () => {
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAndGroupData();
  }, []);

  const loadAndGroupData = async () => {
    setLoading(true);
    try {
      // 1. Obtener todos los reportes
      const allReports = await RibReporteTributarioService.getAllWithRelations();
      
      // 2. Agrupar por RUC
      const grouped = allReports.reduce((acc, report) => {
        const ruc = report.ruc;
        if (!acc[ruc]) {
          acc[ruc] = {
            ruc: ruc,
            nombre_empresa: report.ficha_ruc?.nombre_empresa || ruc,
            reports: [],
            last_updated_at: '1970-01-01T00:00:00Z',
            status: 'Borrador',
            creator_name: 'N/A',
          };
        }
        acc[ruc].reports.push(report);
        // Actualizar con los datos del reporte más reciente
        if (new Date(report.updated_at) > new Date(acc[ruc].last_updated_at)) {
          acc[ruc].last_updated_at = report.updated_at;
          acc[ruc].status = report.status;
          acc[ruc].creator_name = report.profiles?.full_name || 'N/A';
        }
        return acc;
      }, {} as Record<string, GroupedReport>);

      const sortedGroupedReports = Object.values(grouped).sort((a, b) => 
        new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime()
      );

      setGroupedReports(sortedGroupedReports);
    } catch (err) {
      showError('Error al cargar y agrupar los reportes.');
      console.error(err);
    } finally {
      setLoading(false);
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
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader><CardTitle className="text-white">Reportes por Empresa</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : (
                <RibReporteTributarioList 
                  reports={groupedReports} 
                  onSelectReport={(ruc) => console.log("Seleccionado:", ruc)} 
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