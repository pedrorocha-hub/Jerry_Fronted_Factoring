import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './contexts/SessionContext';
import { Toaster } from 'sonner';

// Import pages
import Dashboard from './pages/Dashboard';
import DossiersGuardados from './pages/DossiersGuardados';
import UploadPage from './pages/UploadPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import SolicitudOperacion from './pages/SolicitudOperacion';
import SolicitudOperacionCreateEditPage from './pages/SolicitudOperacionCreateEdit';
import LoginPage from './pages/Login';
import Top10kPage from './pages/Top10kPage';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dossiers-guardados" element={<DossiersGuardados />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/solicitudes-operacion" element={<SolicitudOperacion />} />
          <Route path="/solicitudes-operacion/crear" element={<SolicitudOperacionCreateEditPage />} />
          <Route path="/solicitudes-operacion/editar/:id" element={<SolicitudOperacionCreateEditPage />} />
          <Route path="/solicitudes-operacion/:id" element={<SolicitudOperacionCreateEditPage />} />
          <Route path="/top-10k" element={<Top10kPage />} />
        </Routes>
      </Router>
      <Toaster richColors position="bottom-right" />
    </SessionProvider>
  );
}

export default App;