import RecentActivity from '@/components/dashboard/RecentActivity';
import DocumentsCard from '@/components/dashboard/DocumentsCard';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import RibCard from '@/components/dashboard/RibCard';

const Dashboard = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-[#0a0a0a] text-white">
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
  );
};

export default Dashboard;