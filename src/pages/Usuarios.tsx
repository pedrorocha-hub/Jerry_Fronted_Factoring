import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const Usuarios = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Users className="h-6 w-6 mr-3 text-[#00FF80]" />
            Usuarios
          </h1>
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">Módulo en desarrollo</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Usuarios;