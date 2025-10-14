import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from './contexts/SessionContext';
import Dashboard from './pages/Dashboard';
import SolicitudOperacion from './pages/SolicitudOperacion';
import SolicitudOperacionCreateEdit from './pages/SolicitudOperacionCreateEdit';
import DossiersGuardados from './pages/DossiersGuardados';
import DossierCompletado from './pages/DossierCompletado';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserManagement from './pages/Admin/Users';
import FichasRuc from './pages/FichasRuc';
import EeffPage from './pages/Eeff';
import EeffForm from './pages/EeffForm';
import SentinelPage from './pages/SentinelPage';
import SentinelCreatePage from './pages/SentinelCreatePage';
import Upload from './pages/Upload';
import ReporteTributarioPage from './pages/ReporteTributario';
import RibReporteTributarioPage from './pages/RibReporteTributario';
import VentasMensualesPage from './pages/VentasMensuales';
import Rib from './pages/Rib';
import ComportamientoCrediticio from './pages/ComportamientoCrediticio';
import AuthCallbackPage from './pages/AuthCallbackPage';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Toaster position="top-right" richColors theme="dark" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion" element={<ProtectedRoute><SolicitudOperacion /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion/crear" element={<ProtectedRoute><SolicitudOperacionCreateEdit /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion/editar/:id" element={<ProtectedRoute><SolicitudOperacionCreateEdit /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion/:id" element={<ProtectedRoute><SolicitudOperacionCreateEdit /></ProtectedRoute>} />
          <Route path="/dossiers-guardados" element={<ProtectedRoute><DossiersGuardados /></ProtectedRoute>} />
          <Route path="/dossier/:id" element={<ProtectedRoute><DossierCompletado /></ProtectedRoute>} />
          <Route path="/fichas-ruc" element={<ProtectedRoute><FichasRuc /></ProtectedRoute>} />
          <Route path="/eeff" element={<ProtectedRoute><EeffPage /></ProtectedRoute>} />
          <Route path="/eeff/nuevo" element={<ProtectedRoute><EeffForm /></ProtectedRoute>} />
          <Route path="/eeff/edit/:id" element={<ProtectedRoute><EeffForm /></ProtectedRoute>} />
          <Route path="/sentinel" element={<ProtectedRoute><SentinelPage /></ProtectedRoute>} />
          <Route path="/sentinel/create" element={<ProtectedRoute><SentinelCreatePage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/reporte-tributario" element={<ProtectedRoute><ReporteTributarioPage /></ProtectedRoute>} />
          <Route path="/rib-reporte-tributario" element={<ProtectedRoute><RibReporteTributarioPage /></ProtectedRoute>} />
          <Route path="/ventas-mensuales" element={<ProtectedRoute><VentasMensualesPage /></ProtectedRoute>} />
          <Route path="/rib" element={<ProtectedRoute><Rib /></ProtectedRoute>} />
          <Route path="/comportamiento-crediticio" element={<ProtectedRoute><ComportamientoCrediticio /></ProtectedRoute>} />

          



          <Route path="/admin/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
          

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export default App;