import React from 'react';
import Layout from '@/components/layout/Layout';

const FichaRuc = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Página en Construcción</h1>
        <p className="text-lg text-gray-400">
          El contenido para la sección <span className="font-semibold text-[#00FF80]">Ficha RUC</span> estará disponible pronto.
        </p>
      </div>
    </Layout>
  );
};

export default FichaRuc;