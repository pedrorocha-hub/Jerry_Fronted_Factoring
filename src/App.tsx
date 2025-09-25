import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SessionContextProvider } from '@/contexts/SessionContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages
import Dashboard from '@/pages/Dashboard';
import Upload from '@/pages/Upload';
import FichaRuc from '@/pages/FichaRuc';
import RepresentanteLegal from '@/pages/RepresentanteLegal';
import CuentaBancaria from '@/pages/CuentaBancaria';
import VigenciaPoderes from '@/pages/VigenciaPoderes';
import FacturaNegociar from '@/pages/FacturaNegociar';
import ReporteTributario from '@/pages/ReporteTributario';
import SolicitudOperacion from '@/pages/SolicitudOperacion';
import Login from '@/pages/Login';
import UsersPage from '@/pages/Admin/Users';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Router>
        <SessionContextProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/ficha-ruc" element={<FichaRuc />} />
              <Route path="/representante-legal" element={<RepresentanteLegal />} />
              <Route path="/cuenta-bancaria" element={<CuentaBancaria />} />
              <Route path="/vigencia-poderes" element={<VigenciaPoderes />} />
              <Route path="/factura-negociar" element={<FacturaNegociar />} />
              <Route path="/reporte-tributario" element={<ReporteTributario />} />
              <Route path="/solicitud-operacion" element={<SolicitudOperacion />} />
              <Route path="/admin/users" element={<UsersPage />} />
            </Route>
          </Routes>
        </SessionContextProvider>
        
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#121212',
              color: '#ffffff',
              border: '1px solid #374151',
            },
          }}
        />
      </Router>
    </div>
  );
}

export default App;