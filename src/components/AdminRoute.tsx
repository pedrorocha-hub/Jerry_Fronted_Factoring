import { Navigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      setIsAdmin(data?.role === 'ADMINISTRADOR');
    };

    checkAdmin();
  }, [session]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;