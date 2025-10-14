import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import FichaRuc from './pages/FichaRuc';
import FichaRucForm from './pages/FichaRucForm';
import CuentasBancarias from './pages/CuentasBancarias';
import CuentasBancariasForm from './pages/CuentasBancariasForm';
import FacturaNegociar from './pages/FacturaNegociar';
import FacturaNegociarForm from './pages/FacturaNegociarForm';
import Documentos from './pages/Documentos';
import DocumentosForm from './pages/DocumentosForm';
import EeffPage from './pages/Eeff';
import EeffForm from './pages/EeffForm';
import SentinelPage from './pages/Sentinel';
import SentinelForm from './pages/SentinelForm';
import SolicitudesOperacion from './pages/SolicitudesOperacion';
import SolicitudOperacionForm from './pages/SolicitudOperacionForm';
import RibPage from './pages/Rib';
import RibForm from './pages/RibForm';
import ComportamientoCrediticioPage from './pages/ComportamientoCrediticio';
import ComportamientoCrediticioForm from './pages/ComportamientoCrediticioForm';
import RibReporteTributarioPage from './pages/RibReporteTributario';
import RibReporteTributarioForm from './pages/RibReporteTributarioForm';
import VentasMensualesPage from './pages/VentasMensuales';
import VentasMensualesForm from './pages/VentasMensualesForm';
import DossiersGuardadosPage from './pages/DossiersGuardados';
import RibEeffPage from './pages/RibEeff';
import RibEeffForm from './pages/RibEeffForm';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Ficha RUC */}
          <Route path="/ficha-ruc" element={<ProtectedRoute><FichaRuc /></ProtectedRoute>} />
          <Route path="/ficha-ruc/nuevo" element={<ProtectedRoute><FichaRucForm /></ProtectedRoute>} />
          <Route path="/ficha-ruc/edit/:id" element={<ProtectedRoute><FichaRucForm /></ProtectedRoute>} />

          {/* Cuentas Bancarias */}
          <Route path="/cuentas-bancarias" element={<ProtectedRoute><CuentasBancarias /></ProtectedRoute>} />
          <Route path="/cuentas-bancarias/nuevo" element={<ProtectedRoute><CuentasBancariasForm /></ProtectedRoute>} />
          <Route path="/cuentas-bancarias/edit/:id" element={<ProtectedRoute><CuentasBancariasForm /></ProtectedRoute>} />

          {/* Factura a Negociar */}
          <Route path="/factura-negociar" element={<ProtectedRoute><FacturaNegociar /></ProtectedRoute>} />
          <Route path="/factura-negociar/nuevo" element={<ProtectedRoute><FacturaNegociarForm /></ProtectedRoute>} />
          <Route path="/factura-negociar/edit/:id" element={<ProtectedRoute><FacturaNegociarForm /></ProtectedRoute>} />

          {/* Documentos */}
          <Route path="/documentos" element={<ProtectedRoute><Documentos /></ProtectedRoute>} />
          <Route path="/documentos/nuevo" element={<ProtectedRoute><DocumentosForm /></ProtectedRoute>} />
          <Route path="/documentos/edit/:id" element={<ProtectedRoute><DocumentosForm /></ProtectedRoute>} />

          {/* EEFF */}
          <Route path="/eeff" element={<ProtectedRoute><EeffPage /></ProtectedRoute>} />
          <Route path="/eeff/nuevo" element={<ProtectedRoute><EeffForm /></ProtectedRoute>} />
          <Route path="/eeff/edit/:id" element={<ProtectedRoute><EeffForm /></ProtectedRoute>} />

          {/* Sentinel */}
          <Route path="/sentinel" element={<ProtectedRoute><SentinelPage /></ProtectedRoute>} />
          <Route path="/sentinel/nuevo" element={<ProtectedRoute><SentinelForm /></ProtectedRoute>} />
          <Route path="/sentinel/edit/:id" element={<ProtectedRoute><SentinelForm /></ProtectedRoute>} />

          {/* Solicitudes de Operación */}
          <Route path="/solicitudes-operacion" element={<ProtectedRoute><SolicitudesOperacion /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion/nuevo" element={<ProtectedRoute><SolicitudOperacionForm /></ProtectedRoute>} />
          <Route path="/solicitudes-operacion/edit/:id" element={<ProtectedRoute><SolicitudOperacionForm /></ProtectedRoute>} />

          {/* RIB */}
          <Route path="/rib" element={<ProtectedRoute><RibPage /></ProtectedRoute>} />
          <Route path="/rib/nuevo" element={<ProtectedRoute><RibForm /></ProtectedRoute>} />
          <Route path="/rib/edit/:id" element={<ProtectedRoute><RibForm /></ProtectedRoute>} />

          {/* Comportamiento Crediticio */}
          <Route path="/comportamiento-crediticio" element={<ProtectedRoute><ComportamientoCrediticioPage /></ProtectedRoute>} />
          <Route path="/comportamiento-crediticio/nuevo" element={<ProtectedRoute><ComportamientoCrediticioForm /></ProtectedRoute>} />
          <Route path="/comportamiento-crediticio/edit/:id" element={<ProtectedRoute><ComportamientoCrediticioForm /></ProtectedRoute>} />

          {/* RIB Reporte Tributario */}
          <Route path="/rib-reporte-tributario" element={<ProtectedRoute><RibReporteTributarioPage /></ProtectedRoute>} />
          <Route path="/rib-reporte-tributario/nuevo" element={<ProtectedRoute><RibReporteTributarioForm /></ProtectedRoute>} />
          <Route path="/rib-reporte-tributario/edit/:id" element={<ProtectedRoute><RibReporteTributarioForm /></ProtectedRoute>} />

          {/* Ventas Mensuales */}
          <Route path="/ventas-mensuales" element={<ProtectedRoute><VentasMensualesPage /></ProtectedRoute>} />
          <Route path="/ventas-mensuales/nuevo" element={<ProtectedRoute><VentasMensualesForm /></ProtectedRoute>} />
          <Route path="/ventas-mensuales/edit/:id" element={<ProtectedRoute><VentasMensualesForm /></ProtectedRoute>} />
          
          {/* Dossiers Guardados */}
          <Route path="/dossiers-guardados" element={<ProtectedRoute><DossiersGuardadosPage /></ProtectedRoute>} />

          {/* RIB EEFF */}
          <Route path="/rib-eeff" element={<ProtectedRoute><RibEeffPage /></ProtectedRoute>} />
          <Route path="/rib-eeff/nuevo" element={<ProtectedRoute><RibEeffForm /></ProtectedRoute>} />
          <Route path="/rib-eeff/edit/:id" element={<ProtectedRoute><RibEeffForm /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export default App;