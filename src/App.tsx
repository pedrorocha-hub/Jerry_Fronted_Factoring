import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionContextProvider } from './contexts/SessionContext';
import Dashboard from './pages/Dashboard';
import SentinelPage from './pages/SentinelPage';
import Layout from './components/layout/Layout';

// Componente temporal para las páginas que aún no están completamente implementadas
const PlaceholderPage = ({ pageName }: { pageName: string }) => (
  <Layout>
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Página: {pageName}</h1>
      <p className="text-gray-400 mt-2">Esta sección está en construcción.</p>
    </div>
  </Layout>
);

function App() {
  return (
    <SessionContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sentinel" element={<SentinelPage />} />
          
          {/* Rutas temporales para evitar errores 404 */}
          <Route path="/upload" element={<PlaceholderPage pageName="Subir Documentos" />} />
          <Route path="/ficha-ruc" element={<PlaceholderPage pageName="Fichas RUC" />} />
          <Route path="/representante-legal" element={<PlaceholderPage pageName="Representantes Legales" />} />
          <Route path="/cuenta-bancaria" element={<PlaceholderPage pageName="Cuentas Bancarias" />} />
          <Route path="/vigencia-poderes" element={<PlaceholderPage pageName="Vigencia de Poderes" />} />
          <Route path="/factura-negociar" element={<PlaceholderPage pageName="Facturas a Negociar" />} />
          <Route path="/reporte-tributario" element={<PlaceholderPage pageName="Reportes Tributarios" />} />
          <Route path="/solicitudes-operacion" element={<PlaceholderPage pageName="Solicitudes de Operación" />} />
          <Route path="/rib" element={<PlaceholderPage pageName="Análisis RIB" />} />
          <Route path="/comportamiento-crediticio" element={<PlaceholderPage pageName="Comportamiento Crediticio" />} />

        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;