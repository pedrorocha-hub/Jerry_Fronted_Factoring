import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { FileText, Calendar, FileBarChart } from 'lucide-react';
import { FichaRucService } from '@/services/fichaRucService';
import { FichaRuc } from '@/types/ficha-ruc';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DocumentsCard from '@/components/dashboard/DocumentsCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ReporteTributarioService } from '@/services/reporteTributarioService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFichas: 0,
    nuevasEsteMes: 0,
    totalReportes: 0,
    reportesEsteAno: 0,
  });
  const [recentActivity, setRecentActivity] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fichaStats, reporteStats, recentFichas] = await Promise.all([
          FichaRucService.getStats(),
          ReporteTributarioService.getStats(),
          FichaRucService.getAll(),
        ]);

        setStats({
          totalFichas: fichaStats.total,
          nuevasEsteMes: fichaStats.thisMonth,
          totalReportes: reporteStats.total,
          reportesEsteAno: reporteStats.thisYear,
        });

        setRecentActivity(recentFichas.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-[#121212] border-gray-800 animate-pulse h-36">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-gray-700 rounded w-2/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-700 rounded w-1/4 mt-4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 bg-[#121212] border-gray-800 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="h-10 bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2 bg-[#121212] border-gray-800 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="h-16 bg-gray-700 rounded"></div>
                  <div className="h-16 bg-gray-700 rounded"></div>
                  <div className="h-16 bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard 
                title="Total Fichas RUC"
                value={stats.totalFichas}
                icon={FileText}
                href="/fichas-ruc"
              />
              <StatsCard 
                title="Nuevas Fichas este Mes"
                value={stats.nuevasEsteMes}
                icon={Calendar}
                href="/fichas-ruc"
              />
              <StatsCard 
                title="Total Reportes Tributarios"
                value={stats.totalReportes}
                icon={FileBarChart}
                href="/reporte-tributario"
              />
              <StatsCard 
                title="Reportes de este Año"
                value={stats.reportesEsteAno}
                icon={Calendar}
                href="/reporte-tributario"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <DocumentsCard />
              </div>
              <div className="lg:col-span-2">
                <RecentActivity activities={recentActivity} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;