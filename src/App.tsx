import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EeffPage from './pages/Eeff';
import EeffForm from './pages/EeffForm';
import Index from './pages/Index';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/eeff" element={<EeffPage />} />
          <Route path="/eeff/nuevo" element={<EeffForm />} />
          <Route path="/eeff/edit/:id" element={<EeffForm />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster richColors theme="dark" />
    </>
  );
}

export default App;