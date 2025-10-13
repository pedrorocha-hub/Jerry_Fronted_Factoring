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
import Login from './pages/Login';
import { SessionContextProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/ficha-ruc" element={<FichaRuc />} />
            <Route path="/representante-legal" element={<RepresentanteLegal />} />
            <Route path="/eeff" element={<Eeff />} />
            <Route path="/factura-negociar" element={<FacturaNegociar />} />
            <Route path="/reporte-tributario" element={<ReporteTributario />} />
            <Route path="/solicitudes-operacion" element={<SolicitudOperacionList />} />
            <Route path="/solicitudes-operacion/new" element={<SolicitudOperacionCreateEdit />} />
            <Route path="/solicitudes-operacion/edit/:id" element={<SolicitudOperacionCreateEdit />} />
            <Route path="/rib" element={<Rib />} />
            <Route path="/comportamiento-crediticio" element={<ComportamientoCrediticio />} />
            <Route path="/rib-reporte-tributario" element={<RibReporteTributario />} />
            <Route path="/ventas-mensuales" element={<VentasMensuales />} />
            <Route path="/planilla-rib" element={<PlanillaRib />} />
            <Route path="/sentinel" element={<SentinelPage />} />
            <Route path="/vigencia-poderes" element={<Navigate to="/eeff" replace />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </SessionContextProvider>
  );
}

export default App;