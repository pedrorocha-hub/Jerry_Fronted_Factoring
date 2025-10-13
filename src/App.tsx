import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import Upload from '@/pages/Upload';
import FichasRuc from '@/pages/FichasRuc';
import ReporteTributario from '@/pages/ReporteTributario';
import ComportamientoCrediticio from '@/pages/ComportamientoCrediticio';
import Rib from '@/pages/Rib';
import VentasMensuales from '@/pages/VentasMensuales';
import SolicitudOperacion from '@/pages/SolicitudOperacion';
import Dossier from '@/pages/Dossier';
import Usuarios from '@/pages/Usuarios';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/fichas-ruc" element={<ProtectedRoute><FichasRuc /></ProtectedRoute>} />
          <Route path="/reporte-tributario" element={<ProtectedRoute><ReporteTributario /></ProtectedRoute>} />
          <Route path="/comportamiento-crediticio" element={<ProtectedRoute><ComportamientoCrediticio /></ProtectedRoute>} />
          <Route path="/rib" element={<ProtectedRoute><Rib /></ProtectedRoute>} />
          <Route path="/ventas-mensuales" element={<ProtectedRoute><VentasMensuales /></ProtectedRoute>} />
          <Route path="/solicitud-operacion" element={<ProtectedRoute><SolicitudOperacion /></ProtectedRoute>} />
          <Route path="/solicitud-operacion/nueva" element={<ProtectedRoute><SolicitudOperacion /></ProtectedRoute>} />
          <Route path="/solicitud-operacion/:id" element={<ProtectedRoute><SolicitudOperacion /></ProtectedRoute>} />
          <Route path="/dossier" element={<ProtectedRoute><Dossier /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export default App;