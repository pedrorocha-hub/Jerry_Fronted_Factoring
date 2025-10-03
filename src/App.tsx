import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SessionContextProvider } from '@/contexts/SessionContext';

// Auth
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Main pages
import Dashboard from '@/pages/Dashboard';
import UploadPage from '@/pages/Upload';
import FichaRucPage from '@/pages/FichaRuc';
import RepresentanteLegalPage from '@/pages/RepresentanteLegal';
import CuentaBancariaPage from '@/pages/CuentaBancaria';
import VigenciaPoderesPage from '@/pages/VigenciaPoderes';
import FacturaNegociarPage from '@/pages/FacturaNegociar';
import ReporteTributarioPage from '@/pages/ReporteTributario';
import SolicitudOperacionListPage from '@/pages/SolicitudOperacionList';
import SolicitudOperacionCreateEditPage from '@/pages/SolicitudOperacionCreateEdit';
import RibPage from '@/pages/Rib';
import ComportamientoCrediticioPage from '@/pages/ComportamientoCrediticio';
import SentinelPage from '@/pages/SentinelPage';
import SentinelCreatePage from '@/pages/SentinelCreatePage';
import SentinelDetailPage from '@/pages/SentinelDetailPage';
import SentinelEditPage from '@/pages/SentinelEditPage';
import UsersPage from '@/pages/Admin/Users';

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/ficha-ruc" element={<FichaRucPage />} />
              <Route path="/representante-legal" element={<RepresentanteLegalPage />} />
              <Route path="/cuenta-bancaria" element={<CuentaBancariaPage />} />
              <Route path="/vigencia-poderes" element={<VigenciaPoderesPage />} />
              <Route path="/factura-negociar" element={<FacturaNegociarPage />} />
              <Route path="/reporte-tributario" element={<ReporteTributarioPage />} />
              <Route path="/solicitudes-operacion" element={<SolicitudOperacionListPage />} />
              <Route path="/solicitudes-operacion/new" element={<SolicitudOperacionCreateEditPage />} />
              <Route path="/solicitudes-operacion/edit/:id" element={<SolicitudOperacionCreateEditPage />} />
              <Route path="/rib" element={<RibPage />} />
              <Route path="/comportamiento-crediticio" element={<ComportamientoCrediticioPage />} />
              <Route path="/sentinel" element={<SentinelPage />} />
              <Route path="/sentinel/create" element={<SentinelCreatePage />} />
              <Route path="/sentinel/:id" element={<SentinelDetailPage />} />
              <Route path="/sentinel/:id/edit" element={<SentinelEditPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
            </Route>
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151'
              }
            }}
          />
        </div>
      </Router>
    </SessionContextProvider>
  );
}

export default App;