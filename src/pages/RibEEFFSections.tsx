import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import RibEeffForm from '@/pages/RibEeffForm';
import { FileText } from 'lucide-react';

const RibEEFFSectionsPage = () => {
  const { ruc } = useParams<{ ruc: string }>();

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FileText className="h-6 w-6 mr-3 text-[#00FF80]" />
              Gestionar RIB EEFF
            </h1>
            <p className="text-gray-400">
              Editando el Reporte de Información Básica y Estados Financieros para el RUC: <strong>{ruc}</strong>
            </p>
          </div>
          
          <div className="pt-4">
            <RibEeffForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RibEEFFSectionsPage;