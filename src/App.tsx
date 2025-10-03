import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

// Auth
import LoginPage from '@/pages/LoginPage';
import { useAuth } from '@/hooks/useAuth';

// Main pages
import Dashboard from '@/pages/Dashboard';
import UploadPage from '@/pages/UploadPage';

// Document pages
import FichaRucPage from '@/pages/FichaRucPage';
import FichaRucDetailPage from '@/pages/FichaRucDetailPage';
import RepresentanteLegalPage from '@/pages/RepresentanteLegalPage';
import RepresentanteLegalDetailPage from '@/pages/RepresentanteLegalDetailPage';
import RepresentanteLegalCreatePage from '@/pages/RepresentanteLegalCreatePage';
import RepresentanteLegalEditPage from '@/pages/RepresentanteLegalEditPage';
import CuentaBancariaPage from '@/pages/CuentaBancariaPage';
import CuentaBancariaDetailPage from '@/pages/CuentaBancariaDetailPage';
import CuentaBancariaCreatePage from '@/pages/CuentaBancariaCreatePage';
import CuentaBancariaEditPage from '@/pages/CuentaBancariaEditPage';
import VigenciaPoderesPage from '@/pages/VigenciaPoderesPage';
import VigenciaPoderesDetailPage from '@/pages/VigenciaPoderesDetailPage';
import VigenciaPoderesCreatePage from '@/pages/VigenciaPoderesCreatePage';
import VigenciaPoderesEditPage from '@/pages/VigenciaPoderesEditPage';
import FacturaNegociarPage from '@/pages/FacturaNegociarPage';
import FacturaNegociarDetailPage from '@/pages/FacturaNegociarDetailPage';
import FacturaNegociarCreatePage from '@/pages/FacturaNegociarCreatePage';
import FacturaNegociarEditPage from '@/pages/FacturaNegociarEditPage';
import ReporteTributarioPage from '@/pages/ReporteTributarioPage';
import ReporteTributarioDetailPage from '@/pages/ReporteTributarioDetailPage';
import ReporteTributarioCreatePage from '@/pages/ReporteTributarioCreatePage';
import ReporteTributarioEditPage from '@/pages/ReporteTributarioEditPage';

// RIB pages
import SolicitudesOperacionPage from '@/pages/SolicitudesOperacionPage';
import SolicitudesOperacionDetailPage from '@/pages/SolicitudesOperacionDetailPage';
import SolicitudesOperacionCreatePage from '@/pages/SolicitudesOperacionCreatePage';
import SolicitudesOperacionEditPage from '@/pages/SolicitudesOperacionEditPage';
import RibPage from '@/pages/RibPage';
import RibDetailPage from '@/pages/RibDetailPage';
import RibCreatePage from '@/pages/RibCreatePage';
import RibEditPage from '@/pages/RibEditPage';
import ComportamientoCrediticioPage from '@/pages/ComportamientoCrediticioPage';
import ComportamientoCrediticioDetailPage from '@/pages/ComportamientoCrediticioDetailPage';
import ComportamientoCrediticioCreatePage from '@/pages/ComportamientoCrediticioCreatePage';
import ComportamientoCrediticioEditPage from '@/pages/ComportamientoCrediticioEditPage';

// Sentinel pages
import SentinelPage from '@/pages/SentinelPage';
import SentinelDetailPage from '@/pages/SentinelDetailPage';
import SentinelCreatePage from '@/pages/SentinelCreatePage';
import SentinelEditPage from '@/pages/SentinelEditPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <div className="App">
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />

            {/* Document routes */}
            <Route path="/ficha-ruc" element={
              <ProtectedRoute>
                <FichaRucPage />
              </ProtectedRoute>
            } />
            <Route path="/ficha-ruc/:id" element={
              <ProtectedRoute>
                <FichaRucDetailPage />
              </ProtectedRoute>
            } />

            <Route path="/representante-legal" element={
              <ProtectedRoute>
                <RepresentanteLegalPage />
              </ProtectedRoute>
            } />
            <Route path="/representante-legal/create" element={
              <ProtectedRoute>
                <RepresentanteLegalCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/representante-legal/:id" element={
              <ProtectedRoute>
                <RepresentanteLegalDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/representante-legal/:id/edit" element={
              <ProtectedRoute>
                <RepresentanteLegalEditPage />
              </ProtectedRoute>
            } />

            <Route path="/cuenta-bancaria" element={
              <ProtectedRoute>
                <CuentaBancariaPage />
              </ProtectedRoute>
            } />
            <Route path="/cuenta-bancaria/create" element={
              <ProtectedRoute>
                <CuentaBancariaCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/cuenta-bancaria/:id" element={
              <ProtectedRoute>
                <CuentaBancariaDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/cuenta-bancaria/:id/edit" element={
              <ProtectedRoute>
                <CuentaBancariaEditPage />
              </ProtectedRoute>
            } />

            <Route path="/vigencia-poderes" element={
              <ProtectedRoute>
                <VigenciaPoderesPage />
              </ProtectedRoute>
            } />
            <Route path="/vigencia-poderes/create" element={
              <ProtectedRoute>
                <VigenciaPoderesCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/vigencia-poderes/:id" element={
              <ProtectedRoute>
                <VigenciaPoderesDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/vigencia-poderes/:id/edit" element={
              <ProtectedRoute>
                <VigenciaPoderesEditPage />
              </ProtectedRoute>
            } />

            <Route path="/factura-negociar" element={
              <ProtectedRoute>
                <FacturaNegociarPage />
              </ProtectedRoute>
            } />
            <Route path="/factura-negociar/create" element={
              <ProtectedRoute>
                <FacturaNegociarCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/factura-negociar/:id" element={
              <ProtectedRoute>
                <FacturaNegociarDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/factura-negociar/:id/edit" element={
              <ProtectedRoute>
                <FacturaNegociarEditPage />
              </ProtectedRoute>
            } />

            <Route path="/reporte-tributario" element={
              <ProtectedRoute>
                <ReporteTributarioPage />
              </ProtectedRoute>
            } />
            <Route path="/reporte-tributario/create" element={
              <ProtectedRoute>
                <ReporteTributarioCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/reporte-tributario/:id" element={
              <ProtectedRoute>
                <ReporteTributarioDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/reporte-tributario/:id/edit" element={
              <ProtectedRoute>
                <ReporteTributarioEditPage />
              </ProtectedRoute>
            } />

            {/* RIB routes */}
            <Route path="/solicitudes-operacion" element={
              <ProtectedRoute>
                <SolicitudesOperacionPage />
              </ProtectedRoute>
            } />
            <Route path="/solicitudes-operacion/create" element={
              <ProtectedRoute>
                <SolicitudesOperacionCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/solicitudes-operacion/:id" element={
              <ProtectedRoute>
                <SolicitudesOperacionDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/solicitudes-operacion/:id/edit" element={
              <ProtectedRoute>
                <SolicitudesOperacionEditPage />
              </ProtectedRoute>
            } />

            <Route path="/rib" element={
              <ProtectedRoute>
                <RibPage />
              </ProtectedRoute>
            } />
            <Route path="/rib/create" element={
              <ProtectedRoute>
                <RibCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/rib/:id" element={
              <ProtectedRoute>
                <RibDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/rib/:id/edit" element={
              <ProtectedRoute>
                <RibEditPage />
              </ProtectedRoute>
            } />

            <Route path="/comportamiento-crediticio" element={
              <ProtectedRoute>
                <ComportamientoCrediticioPage />
              </ProtectedRoute>
            } />
            <Route path="/comportamiento-crediticio/create" element={
              <ProtectedRoute>
                <ComportamientoCrediticioCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/comportamiento-crediticio/:id" element={
              <ProtectedRoute>
                <ComportamientoCrediticioDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/comportamiento-crediticio/:id/edit" element={
              <ProtectedRoute>
                <ComportamientoCrediticioEditPage />
              </ProtectedRoute>
            } />

            {/* Sentinel routes */}
            <Route path="/sentinel" element={
              <ProtectedRoute>
                <SentinelPage />
              </ProtectedRoute>
            } />
            <Route path="/sentinel/create" element={
              <ProtectedRoute>
                <SentinelCreatePage />
              </ProtectedRoute>
            } />
            <Route path="/sentinel/:id" element={
              <ProtectedRoute>
                <SentinelDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/sentinel/:id/edit" element={
              <ProtectedRoute>
                <SentinelEditPage />
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151'
              }
            }}
          />
        </div>
      </Router>
    </SessionContextProvider>
  );
}

export default App;