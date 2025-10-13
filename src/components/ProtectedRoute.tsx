import { Navigate } from 'react-router-dom';
import { useSession } from '@supabase/auth-helpers-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;