import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionContextProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import UploadPage from '@/pages/Upload';
import FichaRucPage from '@/pages/FichaRuc';
import RepresentanteLegalPage from '@/pages/RepresentanteLegal';
import FacturaNegociarPage from '@/pages/FacturaNegociar';
import ReporteTributarioPage from '@/pages/ReporteTributario';
import EeffPage from './pages/Eeff';
import EeffForm from './pages/EeffForm';
import SentinelPage from './pages/SentinelPage';
import SentinelCreatePage from './pages/SentinelCreatePage';
import SolicitudOperacionListPage from './pages/SolicitudOperacionList';
import SolicitudOperacionCreateEditPage from './pages/SolicitudOperacionCreateEdit';
import RibPage from './pages/Rib';
import ComportamientoCrediticioPage from './pages/ComportamientoCrediticio';
import RibReporteTributarioPage from './pages/RibReporteTributario';
import VentasMensualesPage from './pages/VentasMensuales';
import PlanillaRibPage from './pages/PlanillaRib';
import UsersPage from './pages/Admin/Users';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/ficha-ruc" element={<FichaRucPage />} />
            <Route path="/representante-legal" element={<RepresentanteLegalPage />} />
            <Route path="/factura-negociar" element={<FacturaNegociarPage />} />
            <Route path="/reporte-tributario" element={<ReporteTributarioPage />} />
            <Route path="/eeff" element={<EeffPage />} />
            <Route path="/eeff/nuevo" element={<EeffForm />} />
            <Route path="/eeff/edit/:id" element={<EeffForm />} />
            <Route path="/sentinel" element={<SentinelPage />} />
            <Route path="/sentinel/create" element={<SentinelCreatePage />} />
            <Route path="/solicitudes-operacion" element={<SolicitudOperacionListPage />} />
            <Route path="/solicitudes-operacion/new" element={<SolicitudOperacionCreateEditPage />} />
            <Route path="/solicitudes-operacion/edit/:id" element={<SolicitudOperacionCreateEditPage />} />
            <Route path="/rib" element={<RibPage />} />
            <Route path="/comportamiento-crediticio" element={<ComportamientoCrediticioPage />} />
            <Route path="/rib-reporte-tributario" element={<RibReporteTributarioPage />} />
            <Route path="/ventas-mensuales" element={<VentasMensualesPage />} />
            <Route path="/planilla-rib" element={<PlanillaRibPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster richColors theme="dark" />
    </SessionContextProvider>
  );
}

export default App;