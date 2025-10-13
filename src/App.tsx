import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AuthProvider, { useAuth } from '@/contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FichaRucPage from './pages/FichaRuc';
import FichaRucDetailsPage from './pages/FichaRucDetails';
import EeffPage from './pages/Eeff';
import EeffForm from './pages/EeffForm';
import UploadPage from './pages/Upload';
import SentinelPage from './pages/Sentinel';
import ComportamientoCrediticioPage from './pages/ComportamientoCrediticio';
import VentasMensualesPage from './pages/VentasMensuales';
import RibReporteTributarioPage from './pages/RibReporteTributario';
import DossiersGuardadosPage from './pages/DossiersGuardados';
import SolicitudesOperacionPage from './pages/SolicitudesOperacion';
import SolicitudOperacionForm from './pages/SolicitudOperacionForm';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { session } = useAuth();
  return session ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/fichas-ruc" element={<PrivateRoute><FichaRucPage /></PrivateRoute>} />
          <Route path="/fichas-ruc/:ruc" element={<PrivateRoute><FichaRucDetailsPage /></PrivateRoute>} />
          <Route path="/eeff" element={<PrivateRoute><EeffPage /></PrivateRoute>} />
          <Route path="/eeff/new" element={<PrivateRoute><EeffForm /></PrivateRoute>} />
          <Route path="/eeff/edit/:id" element={<PrivateRoute><EeffForm /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/sentinel" element={<PrivateRoute><SentinelPage /></PrivateRoute>} />
          <Route path="/comportamiento-crediticio" element={<PrivateRoute><ComportamientoCrediticioPage /></PrivateRoute>} />
          <Route path="/ventas-mensuales" element={<PrivateRoute><VentasMensualesPage /></PrivateRoute>} />
          <Route path="/rib-reporte-tributario" element={<PrivateRoute><RibReporteTributarioPage /></PrivateRoute>} />
          <Route path="/dossiers-guardados" element={<PrivateRoute><DossiersGuardadosPage /></PrivateRoute>} />
          <Route path="/solicitudes-operacion" element={<PrivateRoute><SolicitudesOperacionPage /></PrivateRoute>} />
          <Route path="/solicitudes-operacion/new" element={<PrivateRoute><SolicitudOperacionForm /></PrivateRoute>} />
          <Route path="/solicitudes-operacion/edit/:id" element={<PrivateRoute><SolicitudOperacionForm /></PrivateRoute>} />
        </Routes>
      </Router>
      <Toaster richColors theme="dark" />
    </AuthProvider>
  );
}

export default App;