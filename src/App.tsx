import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { SessionContextProvider } from '@/contexts/SessionContext';

// Import pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import FichaRuc from '@/pages/FichaRuc';
import RibEeff from '@/pages/RibEeff';
import RibEeffForm from '@/pages/RibEeffForm';
import VentasMensuales from '@/pages/VentasMensuales';
import VentasMensualesForm from '@/pages/VentasMensualesForm';
import ComportamientoCrediticio from '@/pages/ComportamientoCrediticio';
import ComportamientoCrediticioForm from '@/pages/ComportamientoCrediticioForm';
import SolicitudesOperacion from '@/pages/SolicitudesOperacion';
import SolicitudOperacionForm from '@/pages/SolicitudOperacionForm';
import DossiersGuardadosPage from '@/pages/DossiersGuardados';
import RibEEFFSectionsPage from '@/pages/RibEEFFSections';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/ficha-ruc" element={<FichaRuc />} />
          
          <Route path="/rib-eeff" element={<RibEeff />} />
          <Route path="/rib-eeff/new" element={<RibEeffForm />} />
          <Route path="/rib-eeff/edit/:ruc" element={<RibEeffForm />} />

          <Route path="/ventas-mensuales" element={<VentasMensuales />} />
          <Route path="/ventas-mensuales/new" element={<VentasMensualesForm />} />
          <Route path="/ventas-mensuales/edit/:ruc" element={<VentasMensualesForm />} />

          <Route path="/comportamiento-crediticio" element={<ComportamientoCrediticio />} />
          <Route path="/comportamiento-crediticio/new" element={<ComportamientoCrediticioForm />} />
          <Route path="/comportamiento-crediticio/edit/:ruc" element={<ComportamientoCrediticioForm />} />

          <Route path="/solicitudes-operacion" element={<SolicitudesOperacion />} />
          <Route path="/solicitudes-operacion/new" element={<SolicitudOperacionForm />} />
          <Route path="/solicitudes-operacion/edit/:id" element={<SolicitudOperacionForm />} />

          <Route path="/dossiers" element={<DossiersGuardadosPage />} />
          <Route path="/dossiers/rib-eeff/:ruc" element={<RibEEFFSectionsPage />} />
        </Routes>
      </Router>
      <Toaster />
    </SessionContextProvider>
  );
}

export default App;