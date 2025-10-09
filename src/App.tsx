import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionContextProvider } from './contexts/SessionContext';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import Login from './pages/Login';
import RibReporteTributario from './pages/RibReporteTributario';
import SolicitudOperacion from './pages/SolicitudOperacion';
import SolicitudOperacionCreateEdit from './pages/SolicitudOperacionCreateEdit';
import PlanillaRib from './pages/PlanillaRib';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/rib-reporte-tributario" element={<RibReporteTributario />} />
            <Route path="/solicitudes-operacion" element={<SolicitudOperacion />} />
            <Route path="/solicitudes-operacion/crear" element={<SolicitudOperacionCreateEdit />} />
            <Route path="/solicitudes-operacion/editar/:id" element={<SolicitudOperacionCreateEdit />} />
            <Route path="/planilla-rib" element={<PlanillaRib />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </SessionContextProvider>
  );
}

export default App;