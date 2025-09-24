import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { Loader2, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ProtectedRoute = () => {
  const { session, loading, authError } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-[#121212] rounded-lg border border-red-500/50 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold text-white">Error de Permisos</h1>
          <p className="text-gray-400">
            No pudimos cargar la información de tu perfil. Es posible que tu rol no tenga los permisos necesarios para acceder a esta aplicación.
          </p>
          <p className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded border border-gray-700">
            {authError.message}
          </p>
          <Button 
            variant="destructive" 
            onClick={() => supabase.auth.signOut()}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;