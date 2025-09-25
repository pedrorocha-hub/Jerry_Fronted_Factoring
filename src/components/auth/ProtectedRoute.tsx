import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';

const ProtectedRoute: React.FC = () => {
  const { session, loading } = useSession();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('ProtectedRoute: Session check timeout reached');
        setTimeoutReached(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // If timeout reached and still loading, redirect to login
  if (timeoutReached && loading) {
    console.error('ProtectedRoute: Session validation timeout, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando sesión...</p>
          <p className="text-xs text-gray-600 mt-2">Esto no debería tomar más de unos segundos</p>
        </div>
      </div>
    );
  }

  // If not loading and no session, redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If session exists, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;