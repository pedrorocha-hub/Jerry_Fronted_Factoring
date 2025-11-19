import { Navigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { ReactNode, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { session, loading, isAdmin, isOnboardingCompleted, refreshProfile } = useSession();

  // Refrescar perfil cuando el componente se monta para asegurar datos actualizados
  useEffect(() => {
    if (session && !loading) {
      refreshProfile();
    }
  }, [session, loading, refreshProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00FF80] mx-auto" />
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if user hasn't completed it
  if (!isOnboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect non-admins from admin routes
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;