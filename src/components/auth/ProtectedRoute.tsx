import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { status } = useSession();

  if (status === 'unknown') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace />;
  }

  // Si status es 'authed' o 'error' (en caso de error de perfil, aún permitimos el acceso)
  return <Outlet />;
};

export default ProtectedRoute;