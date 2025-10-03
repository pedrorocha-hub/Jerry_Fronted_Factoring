import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SessionContextProvider } from '@/contexts/SessionContext';
import PrivateRoute from '@/components/auth/PrivateRoute';
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
const RibPage = lazy(() => import('./pages/RibPage'));
const ComportamientoCrediticioPage = lazy(() => import('./pages/ComportamientoCrediticioPage'));
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
            
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
            <Route path="/ficha-ruc" element={<PrivateRoute><FichaRucPage /></PrivateRoute>} />
            <Route path="/representante-legal" element={<PrivateRoute><RepresentanteLegalPage /></PrivateRoute>} />
            <Route path="/cuenta-bancaria" element={<PrivateRoute><CuentaBancariaPage /></PrivateRoute>} />
            <Route path="/vigencia-poderes" element={<PrivateRoute><VigenciaPoderesPage /></PrivateRoute>} />
            <Route path="/factura-negociar" element={<PrivateRoute><FacturaNegociarPage /></PrivateRoute>} />
            <Route path="/reporte-tributario" element={<PrivateRoute><ReporteTributarioPage /></PrivateRoute>} />
            <Route path="/solicitudes-operacion" element={<PrivateRoute><SolicitudOperacionListPage /></PrivateRoute>} />
            <Route path="/solicitudes-operacion/new" element={<PrivateRoute><SolicitudOperacionCreateEditPage /></PrivateRoute>} />
            <Route path="/solicitudes-operacion/edit/:id" element={<PrivateRoute><SolicitudOperacionCreateEditPage /></PrivateRoute>} />
            <Route path="/rib" element={<PrivateRoute><RibPage /></PrivateRoute>} />
            <Route path="/comportamiento-crediticio" element={<PrivateRoute><ComportamientoCrediticioPage /></PrivateRoute>} />
            <Route path="/sentinel" element={<PrivateRoute><SentinelPage /></PrivateRoute>} />

          </Routes>
        </Suspense>
      </Router>
      <Toaster richColors theme="dark" />
    </SessionContextProvider>
  );
}

export default App;