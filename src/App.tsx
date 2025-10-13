import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import FichaRuc from './pages/FichaRuc';
import RepresentanteLegal from './pages/RepresentanteLegal';
import Eeff from './pages/Eeff';
import FacturaNegociar from './pages/FacturaNegociar';
import ReporteTributario from './pages/ReporteTributario';
import SolicitudOperacionList from './pages/SolicitudOperacionList';
import SolicitudOperacionCreateEdit from './pages/SolicitudOperacionCreateEdit';
import Rib from './pages/Rib';
import ComportamientoCrediticio from './pages/ComportamientoCrediticio';
import RibReporteTributario from './pages/RibReporteTributario';
import VentasMensuales from './pages/VentasMensuales';
import PlanillaRib from './pages/PlanillaRib';
import SentinelPage from './pages/SentinelPage';
import SentinelCreatePage from './pages/SentinelCreatePage';
import Login from './pages/Login';
import { SessionContextProvider } from './contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/ficha-ruc" element={<ProtectedRoute><FichaRuc /></ProtectedRoute>} />
          <Route path="/representante-legal" element={<ProtectedRoute><RepresentanteLegal /></ProtectedRoute>} />
          <Route path="/eeff" element={<ProtectedRoute><Eeff /></ProtectedRoute>} />
          <Route path="/factura-negociar" element={<ProtectedRoute><FacturaNegociar /></ProtectedRoute>} />
          <Route path="/reporte-tributario" element={<ProtectedRoute><ReporteTributario /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion" element={<ProtectedRoute><SolicitudOperacionList /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion/new" element={<ProtectedRoute><SolicitudOperacionCreateEdit /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion/edit/:id" element={<ProtectedRoute><SolicitudOperacionCreateEdit /></ProtectedRoute>} />
          <Route path="/rib" element={<ProtectedRoute><Rib /></ProtectedRoute>} />
          <Route path="/comportamiento-crediticio" element={<ProtectedRoute><ComportamientoCrediticio /></ProtectedRoute>} />
          <Route path="/rib-reporte-tributario" element={<ProtectedRoute><RibReporteTributario /></ProtectedRoute>} />
          <Route path="/ventas-mensuales" element={<ProtectedRoute><VentasMensuales /></ProtectedRoute>} />
          <Route path="/planilla-rib" element={<ProtectedRoute><PlanillaRib /></ProtectedRoute>} />
          <Route path="/sentinel" element={<ProtectedRoute><SentinelPage /></ProtectedRoute>} />
          <Route path="/sentinel/create" element={<ProtectedRoute><SentinelCreatePage /></ProtectedRoute>} />
          
          {/* Redirect old route to new one */}
          <Route path="/vigencia-poderes" element={<Navigate to="/eeff" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </SessionContextProvider>
  );
}

export default App;