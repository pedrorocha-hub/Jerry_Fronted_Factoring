import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import VentasMensualesDetail from './pages/VentasMensualesDetail';

// Mock component for home page
const HomePage = () => (
  <div className="p-8 bg-gray-900 text-white min-h-screen">
    <h1 className="text-3xl font-bold mb-4">Página Principal</h1>
    <p>Navega a la página de ventas mensuales con un RUC de ejemplo:</p>
    <Link to="/ventas-mensuales/20601572699" className="text-[#00FF80] hover:underline">
      Ir a Ventas Mensuales para RUC 20601572699
    </Link>
  </div>
);

function App() {
  return (
    <>
      <Toaster richColors theme="dark" />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ventas-mensuales/:ruc" element={<VentasMensualesDetail />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;