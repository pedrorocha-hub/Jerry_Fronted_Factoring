import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Página de Inicio</h1>
        <p className="text-gray-400 mb-8">Navega a las secciones de la aplicación.</p>
        <div className="space-x-4">
          <Link to="/eeff" className="bg-[#00FF80] text-black font-medium px-6 py-2 rounded-md hover:bg-[#00FF80]/90 transition-colors">
            Ir a EEFF
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Index;