import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import Dashboard from './pages/Dashboard';
import SolicitudesOperacionPage from './pages/SolicitudesOperacionPage';
import DossiersGuardadosPage from './pages/DossiersGuardados';
import FichasRucPage from './pages/FichasRucPage';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import SolicitudOperacionFormPage from './pages/SolicitudOperacionFormPage';
import UsersPage from './pages/Admin/Users';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
  const { session, loading, isAdmin } = useSession();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/solicitudes-operacion" element={<PrivateRoute><SolicitudesOperacionPage /></PrivateRoute>} />
      <Route path="/solicitudes-operacion/new" element={<PrivateRoute><SolicitudOperacionFormPage /></PrivateRoute>} />
      <Route path="/solicitudes-operacion/edit/:id" element={<PrivateRoute><SolicitudOperacionFormPage /></PrivateRoute>} />
      <Route path="/dossiers-guardados" element={<PrivateRoute><DossiersGuardadosPage /></PrivateRoute>} />
      <Route path="/fichas-ruc" element={<PrivateRoute><FichasRucPage /></PrivateRoute>} />
      <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
      
      <Route path="/admin/users" element={<PrivateRoute adminOnly={true}><UsersPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </Router>
  );
}

export default App;