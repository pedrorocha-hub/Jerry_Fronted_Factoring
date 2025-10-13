import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building2, BarChart3, ClipboardEdit, FolderOpen, Upload as UploadIcon } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const modules = [
    { title: 'Subir PDFs', icon: UploadIcon, path: '/upload', description: 'Sube y procesa documentos' },
    { title: 'Fichas RUC', icon: Building2, path: '/fichas-ruc', description: 'Gestión de fichas RUC' },
    { title: 'Reporte Tributario', icon: FileText, path: '/reporte-tributario', description: 'Reportes tributarios' },
    { title: 'Comportamiento Crediticio', icon: BarChart3, path: '/comportamiento-crediticio', description: 'Análisis crediticio' },
    { title: 'RIB', icon: FolderOpen, path: '/rib', description: 'Reportes de información básica' },
    { title: 'Ventas Mensuales', icon: BarChart3, path: '/ventas-mensuales', description: 'Análisis de ventas' },
    { title: 'Solicitud de Operación', icon: ClipboardEdit, path: '/solicitud-operacion', description: 'Gestión de solicitudes' },
    { title: 'Dossier', icon: FolderOpen, path: '/dossier', description: 'Dossiers completos' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Panel Principal</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <Card key={module.path} className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all cursor-pointer" onClick={() => navigate(module.path)}>
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <module.icon className="h-5 w-5 mr-2 text-[#00FF80]" />
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;