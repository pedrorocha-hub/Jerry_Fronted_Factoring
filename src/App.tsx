import { SessionContextProvider } from '@/contexts/SessionContext';
import { Toaster } from 'sonner';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Page Imports
import Index from './pages/Index';
import Login from './pages/Login';
import Users from './pages/Users';
import Rib from './pages/Rib';
import RibForm from './pages/RibForm';
import VentasMensuales from './pages/VentasMensuales';
import VentasMensualesForm from './pages/VentasMensualesForm';
import ReporteTributario from './pages/ReporteTributario';
import ReporteTributarioForm from './pages/ReporteTributarioForm';
import ComportamientoCrediticio from './pages/ComportamientoCrediticio';
import ComportamientoCrediticioForm from './pages/ComportamientoCrediticioForm';
import SolicitudesOperacion from './pages/SolicitudesOperacion';
import SolicitudOperacionForm from './pages/SolicitudOperacionForm';
import DossiersGuardados from './pages/DossiersGuardados';
import DossierView from './pages/DossierView';
import RibEeffPage from './pages/RibEeff';
import RibEeffForm from './pages/RibEeffForm';
import Eeff from './pages/Eeff';
import EeffForm from './pages/EeffForm';

// Component Imports
import PrivateRoute from './components/routes/PrivateRoute';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          
          {/* RIB */}
          <Route path="/rib" element={<PrivateRoute><Rib /></PrivateRoute>} />
          <Route path="/rib/nuevo" element={<PrivateRoute><RibForm /></PrivateRoute>} />
          <Route path="/rib/editar/:ruc" element={<PrivateRoute><RibForm /></PrivateRoute>} />
          
          {/* Ventas Mensuales */}
          <Route path="/ventas-mensuales" element={<PrivateRoute><VentasMensuales /></PrivateRoute>} />
          <Route path="/ventas-mensuales/nuevo" element={<PrivateRoute><VentasMensualesForm /></PrivateRoute>} />
          <Route path="/ventas-mensuales/editar/:id" element={<PrivateRoute><VentasMensualesForm /></PrivateRoute>} />
          
          {/* Reporte Tributario */}
          <Route path="/reporte-tributario" element={<PrivateRoute><ReporteTributario /></PrivateRoute>} />
          <Route path="/reporte-tributario/nuevo" element={<PrivateRoute><ReporteTributarioForm /></PrivateRoute>} />
          <Route path="/reporte-tributario/editar/:id" element={<PrivateRoute><ReporteTributarioForm /></PrivateRoute>} />
          
          {/* Comportamiento Crediticio */}
          <Route path="/comportamiento-crediticio" element={<PrivateRoute><ComportamientoCrediticio /></PrivateRoute>} />
          <Route path="/comportamiento-crediticio/nuevo" element={<PrivateRoute><ComportamientoCrediticioForm /></PrivateRoute>} />
          <Route path="/comportamiento-crediticio/editar/:id" element={<PrivateRoute><ComportamientoCrediticioForm /></PrivateRoute>} />
          
          {/* Solicitudes de Operación */}
          <Route path="/solicitudes-operacion" element={<PrivateRoute><SolicitudesOperacion /></PrivateRoute>} />
          <Route path="/solicitudes-operacion/nuevo" element={<PrivateRoute><SolicitudOperacionForm /></PrivateRoute>} />
          <Route path="/solicitudes-operacion/editar/:id" element={<PrivateRoute><SolicitudOperacionForm /></PrivateRoute>} />
          
          {/* Dossiers */}
          <Route path="/dossiers" element={<PrivateRoute><DossiersGuardados /></PrivateRoute>} />
          <Route path="/dossier/:id" element={<PrivateRoute><DossierView /></PrivateRoute>} />
          
          {/* RIB EEFF */}
          <Route path="/rib-eeff" element={<PrivateRoute><RibEeffPage /></PrivateRoute>} />
          <Route path="/rib-eeff/nuevo" element={<PrivateRoute><RibEeffForm /></PrivateRoute>} />
          <Route path="/rib-eeff/manage/:ruc" element={<PrivateRoute><RibEeffForm /></PrivateRoute>} />
          
          {/* EEFF */}
          <Route path="/eeff" element={<PrivateRoute><Eeff /></PrivateRoute>} />
          <Route path="/eeff/nuevo" element={<PrivateRoute><EeffForm /></PrivateRoute>} />
          <Route path="/eeff/editar/:id" element={<PrivateRoute><EeffForm /></PrivateRoute>} />
        </Routes>
      </Router>
      <Toaster richColors />
    </SessionContextProvider>
  );
}

export default App;