import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import Dashboard from './pages/Dashboard';
import SolicitudesOperacion from './pages/SolicitudesOperacion';
import DossiersGuardados from './pages/DossiersGuardados';
import FichasRuc from './pages/FichasRuc';
import EEFF from './pages/Eeff';
import Sentinel from './pages/Sentinel';
import Upload from './pages/Upload';
import AdminUsers from './pages/Admin/Users';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Rib from './pages/Rib';
import ComportamientoCrediticio from './pages/ComportamientoCrediticio';
import RibReporteTributario from './pages/RibReporteTributario';
import VentasMensuales from './pages/VentasMensuales';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion" element={<ProtectedRoute><SolicitudesOperacion /></ProtectedRoute>} />
          <Route path="/dossiers-guardados" element={<ProtectedRoute><DossiersGuardados /></ProtectedRoute>} />
          <Route path="/fichas-ruc" element={<ProtectedRoute><FichasRuc /></ProtectedRoute>} />
          <Route path="/eeff" element={<ProtectedRoute><EEFF /></ProtectedRoute>} />
          <Route path="/sentinel" element={<ProtectedRoute><Sentinel /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          
          <Route path="/rib" element={<ProtectedRoute><Rib /></ProtectedRoute>} />
          <Route path="/comportamiento-crediticio" element={<ProtectedRoute><ComportamientoCrediticio /></ProtectedRoute>} />
          <Route path="/rib-reporte-tributario" element={<ProtectedRoute><RibReporteTributario /></ProtectedRoute>} />
          <Route path="/ventas-mensuales" element={<ProtectedRoute><VentasMensuales /></ProtectedRoute>} />

          <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export default App;