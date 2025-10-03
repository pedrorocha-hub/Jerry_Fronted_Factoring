import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const SentinelPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Shield className="h-8 w-8 mr-3 text-[#00FF80]" />
              Análisis Sentinel
            </h1>
            <p className="text-gray-400 mt-2">
              Gestión y consulta de reportes de Sentinel.
            </p>
          </div>
        </div>

        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Reportes de Sentinel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <p>La funcionalidad para gestionar los reportes de Sentinel estará disponible aquí.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SentinelPage;