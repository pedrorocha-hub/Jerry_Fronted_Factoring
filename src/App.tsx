import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './contexts/SessionContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import EeffPage from './pages/Eeff';
import EeffForm from './pages/EeffForm';
import RibEeffPage from './pages/RibEeff';
import RibEeffForm from './pages/RibEeffForm';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#00FF80]" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/eeff" 
          element={
            <PrivateRoute>
              <EeffPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/eeff/nuevo" 
          element={
            <PrivateRoute>
              <EeffForm />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/eeff/edit/:id" 
          element={
            <PrivateRoute>
              <EeffForm />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/rib-eeff" 
          element={
            <PrivateRoute>
              <RibEeffPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/rib-eeff/nuevo" 
          element={
            <PrivateRoute>
              <RibEeffForm />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/rib-eeff/edit/:id" 
          element={
            <PrivateRoute>
              <RibEeffForm />
            </PrivateRoute>
          } 
        />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <SessionProvider>
      <AppContent />
      <Toaster theme="dark" />
    </SessionProvider>
  );
}

export default App;