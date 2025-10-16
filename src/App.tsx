import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

// Page Imports
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import DossiersGuardados from './pages/DossiersGuardados';
import UploadPage from './pages/Upload';
import AdminUsersPage from './pages/admin/Users';
import SolicitudOperacion from './pages/SolicitudOperacion';
import SolicitudOperacionCreateEditPage from './pages/SolicitudOperacionCreateEdit';
import Top10kPage from './pages/Top10k';
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


const PrivateRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { session, isAdmin, loading } = useSession();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/dossiers-guardados" element={<PrivateRoute><DossiersGuardados /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
      <Route path="/top-10k" element={<PrivateRoute><Top10kPage /></PrivateRoute>} />
      
      <Route path="/solicitudes-operacion" element={<PrivateRoute><SolicitudOperacion /></PrivateRoute>} />
      <Route path="/solicitudes-operacion/crear" element={<PrivateRoute adminOnly><SolicitudOperacionCreateEditPage /></PrivateRoute>} />
      <Route path="/solicitudes-operacion/editar/:id" element={<PrivateRoute adminOnly><SolicitudOperacionCreateEditPage /></PrivateRoute>} />
      <Route path="/solicitudes-operacion/:id" element={<PrivateRoute><SolicitudOperacionCreateEditPage /></PrivateRoute>} />

      <Route path="/admin/users" element={<PrivateRoute adminOnly><AdminUsersPage /></PrivateRoute>} />
      <Route path="/fichas-ruc" element={<PrivateRoute><FichasRuc /></PrivateRoute>} />
      <Route path="/eeff" element={<PrivateRoute><EeffPage /></PrivateRoute>} />
      <Route path="/eeff/nuevo" element={<PrivateRoute><EeffForm /></PrivateRoute>} />
      <Route path="/sentinel" element={<PrivateRoute><SentinelPage /></PrivateRoute>} />
      <Route path="/sentinel/create" element={<PrivateRoute><SentinelCreatePage /></PrivateRoute>} />
      <Route path="/reporte-tributario" element={<PrivateRoute><ReporteTributarioPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <SessionProvider>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </SessionProvider>
  );
}

export default App;