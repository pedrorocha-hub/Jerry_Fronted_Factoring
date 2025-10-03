import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SessionContextProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthRedirect from '@/components/auth/AuthRedirect';
import { Toaster } from "@/components/ui/sonner"

// Importación normal para componentes de carga rápida
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/Upload';

// Lazy loading para las páginas de CRUD
const FichaRucPage = lazy(() => import('./pages/FichaRuc'));
const RepresentanteLegalPage = lazy(() => import('./pages/RepresentanteLegal'));
const CuentaBancariaPage = lazy(() => import('./pages/CuentaBancaria'));
const VigenciaPoderesPage = lazy(() => import('./pages/VigenciaPoderes'));
const FacturaNegociarPage = lazy(() => import('./pages/FacturaNegociar'));
const ReporteTributarioPage = lazy(() => import('./pages/ReporteTributario'));
const SolicitudOperacionListPage = lazy(() => import('./pages/SolicitudOperacionList'));
const SolicitudOperacionCreateEditPage = lazy(() => import('./pages/SolicitudOperacionCreateEdit'));
const RibPage = lazy(() => import('./pages/Rib'));
const ComportamientoCrediticioPage = lazy(() => import('./pages/ComportamientoCrediticio'));
const SentinelPage = lazy(() => import('./pages/SentinelPage'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
  </div>
);

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/ficha-ruc" element={<ProtectedRoute><FichaRucPage /></ProtectedRoute>} />
            <Route path="/representante-legal" element={<ProtectedRoute><RepresentanteLegalPage /></ProtectedRoute>} />
            <Route path="/cuenta-bancaria" element={<ProtectedRoute><CuentaBancariaPage /></ProtectedRoute>} />
            <Route path="/vigencia-poderes" element={<ProtectedRoute><VigenciaPoderesPage /></ProtectedRoute>} />
            <Route path="/factura-negociar" element={<ProtectedRoute><FacturaNegociarPage /></ProtectedRoute>} />
            <Route path="/reporte-tributario" element={<ProtectedRoute><ReporteTributarioPage /></ProtectedRoute>} />
            <Route path="/solicitudes-operacion" element={<ProtectedRoute><SolicitudOperacionListPage /></ProtectedRoute>} />
            <Route path="/solicitudes-operacion/new" element={<ProtectedRoute><SolicitudOperacionCreateEditPage /></ProtectedRoute>} />
            <Route path="/solicitudes-operacion/edit/:id" element={<ProtectedRoute><SolicitudOperacionCreateEditPage /></ProtectedRoute>} />
            <Route path="/rib" element={<ProtectedRoute><RibPage /></ProtectedRoute>} />
            <Route path="/comportamiento-crediticio" element={<ProtectedRoute><ComportamientoCrediticioPage /></ProtectedRoute>} />
            <Route path="/sentinel" element={<ProtectedRoute><SentinelPage /></ProtectedRoute>} />

          </Routes>
        </Suspense>
      </Router>
      <Toaster richColors theme="dark" />
    </SessionContextProvider>
  );
}

export default App;