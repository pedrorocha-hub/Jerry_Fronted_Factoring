import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import SolicitudOperacion from './pages/SolicitudOperacion';
import SolicitudOperacionCreateEdit from './pages/SolicitudOperacionCreateEdit';
import DossiersGuardados from './pages/DossiersGuardados';
import DossierCompletado from './pages/DossierCompletado';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitudes-operacion"
          element={
            <ProtectedRoute>
              <SolicitudOperacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitudes-operacion/crear"
          element={
            <ProtectedRoute>
              <SolicitudOperacionCreateEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitudes-operacion/editar/:id"
          element={
            <ProtectedRoute>
              <SolicitudOperacionCreateEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/solicitudes-operacion/:id"
          element={
            <ProtectedRoute>
              <SolicitudOperacionCreateEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dossiers-guardados"
          element={
            <ProtectedRoute>
              <DossiersGuardados />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dossier/:id"
          element={
            <ProtectedRoute>
              <DossierCompletado />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;