import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import { FileText, Banknote, BarChart2 } from 'lucide-react';
import { FichaRucService } from '@/services/fichaRucService';
import { CuentaBancariaService } from '@/services/cuentaBancariaService';
import { EeffService } from '@/services/eeffService';

const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
  <Card className="bg-[#121212] border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-white">{value}</div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [counts, setCounts] = useState({
    fichas: 0,
    cuentas: 0,
    eeff: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [fichasData, cuentasData, eeffData] = await Promise.all([
          FichaRucService.getAll(),
          CuentaBancariaService.getAll(),
          EeffService.getAll(),
        ]);
        setCounts({
          fichas: fichasData.length,
          cuentas: cuentasData.length,
          eeff: eeffData.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-[#121212] border-gray-800 animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-700 rounded w-2/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Fichas RUC" value={counts.fichas} icon={<FileText className="h-6 w-6 text-blue-400" />} />
            <StatCard title="Cuentas Bancarias" value={counts.cuentas} icon={<Banknote className="h-6 w-6 text-green-400" />} />
            <StatCard title="EEFF" value={counts.eeff} icon={<BarChart2 className="h-6 w-6 text-indigo-400" />} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;