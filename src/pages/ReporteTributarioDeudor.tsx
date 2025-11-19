import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart } from 'lucide-react';

const ReporteTributarioDeudorPage = () => {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <FileBarChart className="h-6 w-6 mr-3 text-[#00FF80]" />
          Reporte Tributario del Deudor
        </h1>
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Funcionalidad en Desarrollo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">Esta página está actualmente en construcción.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReporteTributarioDeudorPage;