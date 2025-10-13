import Layout from '@/components/layout/Layout';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DocumentsCard from '@/components/dashboard/DocumentsCard';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import RibCard from '@/components/dashboard/RibCard';

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <WelcomeHeader />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity activities={[]} />
          </div>
          <div className="space-y-6">
            <DocumentsCard />
            <RibCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;