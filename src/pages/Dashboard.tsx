import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DocumentsCard from '@/components/dashboard/DocumentsCard';
import RibCard from '@/components/dashboard/RibCard';
import { FichaRucService } from '@/services/fichaRucService';
import { DocumentoService } from '@/services/documentoService';
import { FileText, Clock, AlertCircle, CalendarDays } from 'lucide-react';
import { FichaRuc } from '@/types/ficha-ruc';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFichas: 0,
    pdfsThisMonth: 0,
    pendingReview: 0,
    errors: 0,
  });
  const [recentActivity, setRecentActivity] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fichaStats, docStats, recentFichas] = await Promise.all([
        FichaRucService.getStats(),
        DocumentoService.getStats(),
        FichaRucService.getAll(),
      ]);

      setStats({
        totalFichas: fichaStats.total,
        pdfsThisMonth: docStats.thisMonth,
        pendingReview: docStats.pendientes,
        errors: docStats.errores,
      });
      
      setRecentActivity(recentFichas.slice(0, 5));
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <WelcomeHeader />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Fichas RUC" value={stats.totalFichas} icon={FileText} href="/fichas-ruc" />
          <StatsCard title="PDFs Procesados (Mes)" value={stats.pdfsThisMonth} icon={CalendarDays} href="/upload" />
          <StatsCard title="Pendientes de Revisión" value={stats.pendingReview} icon={Clock} href="/upload" />
          <StatsCard title="Documentos con Error" value={stats.errors} icon={AlertCircle} href="/upload" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <RecentActivity activities={recentActivity} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DocumentsCard />
          <RibCard />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;