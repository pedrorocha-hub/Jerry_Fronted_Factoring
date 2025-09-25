import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';

const ProtectedRoute: React.FC = () => {
  const { session, loading } = useSession();

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
          <p className="text-gray-400">Verificando sesión...</p>
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