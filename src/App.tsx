import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

// 🧩 Páginas principales
import LoginPage from './pages/Login';
import OnboardingPage from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import DossiersGuardados from './pages/DossiersGuardados';
import UploadPage from './pages/Upload';

import SolicitudOperacion from './pages/SolicitudOperacion';
import SolicitudOperacionCreateEditPage from './pages/SolicitudOperacionCreateEdit';
import Top10kPage from './pages/Top10k';

// 🆕 Páginas adicionales (faltantes)
import DossierCompletado from './pages/DossierCompletado';
import FichasRuc from './pages/FichasRuc';
import EeffPage from './pages/Eeff';
import EeffForm from './pages/EeffForm';
import SentinelPage from './pages/SentinelPage';
import SentinelCreatePage from './pages/SentinelCreatePage';
import ReporteTributarioPage from './pages/ReporteTributario';
import RibReporteTributarioPage from './pages/RibReporteTributario';
import RibReporteTributarioForm from './pages/RibReporteTributarioForm';
import VentasMensualesPage from './pages/VentasMensuales';
import VentasMensualesForm from './pages/VentasMensualesForm';
import Rib from './pages/Rib';
import ComportamientoCrediticio from './pages/ComportamientoCrediticio';
import AuthCallbackPage from './pages/AuthCallbackPage';
import RibEeffPage from './pages/RibEeff';
import RibEeffForm from './pages/RibEeffForm';
import ComentariosEjecutivoPage from './pages/ComentariosEjecutivo';

// 🔒 Componente de protección de rutas
const PrivateRoute = ({ children, adminOnly = false }: { children: JSX.Element; adminOnly?: boolean }) => {
  const { session, isAdmin, loading, isOnboardingCompleted } = useSession();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" />;
  if (!isOnboardingCompleted) return <Navigate to="/onboarding" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;

  return children;
};

// 🗺️ Definición completa de rutas
const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Dashboard */}
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

      {/* Solicitudes de operación */}
      <Route path="/solicitudes-operacion" element={<PrivateRoute><SolicitudOperacion /></PrivateRoute>} />
      <Route path="/solicitudes-operacion/new" element={<PrivateRoute adminOnly><SolicitudOperacionCreateEditPage /></PrivateRoute>} />
      <Route path="/solicitudes-operacion/edit/:id" element={<PrivateRoute adminOnly><SolicitudOperacionCreateEditPage /></PrivateRoute>} />


      {/* Dossiers */}
      <Route path="/dossiers-guardados" element={<PrivateRoute><DossiersGuardados /></PrivateRoute>} />
      <Route path="/dossier/:id" element={<PrivateRoute><DossierCompletado /></PrivateRoute>} />

      {/* Fichas RUC */}
      <Route path="/fichas-ruc" element={<PrivateRoute><FichasRuc /></PrivateRoute>} />

      {/* EEFF */}
      <Route path="/eeff" element={<PrivateRoute><EeffPage /></PrivateRoute>} />
      <Route path="/eeff/nuevo" element={<PrivateRoute><EeffForm /></PrivateRoute>} />
      <Route path="/eeff/edit/:id" element={<PrivateRoute><EeffForm /></PrivateRoute>} />

      {/* Sentinel */}
      <Route path="/sentinel" element={<PrivateRoute><SentinelPage /></PrivateRoute>} />
      <Route path="/sentinel/create" element={<PrivateRoute><SentinelCreatePage /></PrivateRoute>} />

      {/* Reportes Tributarios */}
      <Route path="/reporte-tributario" element={<PrivateRoute><ReporteTributarioPage /></PrivateRoute>} />

      {/* RIB Reporte Tributario */}
      <Route path="/rib-reporte-tributario" element={<PrivateRoute><RibReporteTributarioPage /></PrivateRoute>} />
      <Route path="/rib-reporte-tributario/new" element={<PrivateRoute><RibReporteTributarioForm /></PrivateRoute>} />
      <Route path="/rib-reporte-tributario/edit/:id" element={<PrivateRoute><RibReporteTributarioForm /></PrivateRoute>} />

      {/* Ventas Mensuales */}
      <Route path="/ventas-mensuales" element={<PrivateRoute><VentasMensualesPage /></PrivateRoute>} />
      <Route path="/ventas-mensuales/new" element={<PrivateRoute><VentasMensualesForm /></PrivateRoute>} />
      <Route path="/ventas-mensuales/edit" element={<PrivateRoute><VentasMensualesForm /></PrivateRoute>} />
      <Route path="/ventas-mensuales/edit/:id" element={<PrivateRoute><VentasMensualesForm /></PrivateRoute>} />

      {/* RIB */}
      <Route path="/rib" element={<PrivateRoute><Rib /></PrivateRoute>} />
      <Route path="/rib/edit/:id" element={<PrivateRoute><Rib /></PrivateRoute>} />

      {/* Comportamiento Crediticio */}
      <Route path="/comportamiento-crediticio" element={<PrivateRoute><ComportamientoCrediticio /></PrivateRoute>} />
      <Route path="/comportamiento-crediticio/edit/:id" element={<PrivateRoute><ComportamientoCrediticio /></PrivateRoute>} />

      {/* RIB EEFF */}
      <Route path="/rib-eeff" element={<PrivateRoute><RibEeffPage /></PrivateRoute>} />
      <Route path="/rib-eeff/nuevo" element={<PrivateRoute><RibEeffForm /></PrivateRoute>} />
      <Route path="/rib-eeff/edit/:id" element={<PrivateRoute><RibEeffForm /></PrivateRoute>} />

      {/* Comentarios del Ejecutivo */}
      <Route path="/comentarios-ejecutivo" element={<PrivateRoute><ComentariosEjecutivoPage /></PrivateRoute>} />
      <Route path="/comentarios-ejecutivo/edit/:id" element={<PrivateRoute><ComentariosEjecutivoPage /></PrivateRoute>} />

      {/* Otras */}
      <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
      <Route path="/top-10k" element={<PrivateRoute><Top10kPage /></PrivateRoute>} />

      {/* Admin */}
      {/* <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsersPage /></PrivateRoute>} /> */}

      {/* Default */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// 🌐 App principal
function App() {
  return (
    <SessionProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" richColors theme="dark" />
      </Router>
    </SessionProvider>
  );
}

export default App;