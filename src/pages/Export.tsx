import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showSuccess, showLoading, dismissToast } from '@/utils/toast';

const Export = () => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedData, setSelectedData] = useState({
    general: true,
    actividad: true,
    representante: true,
    domicilio: false,
  });

  const handleExport = async () => {
    const loadingToast = showLoading('Generando exportación de Fichas RUC...');
    
    // Simular proceso de exportación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    dismissToast(loadingToast);
    showSuccess(`Archivo ${exportFormat.toUpperCase()} de Fichas RUC descargado exitosamente`);
  };

  const dataOptions = [
    { key: 'general', label: 'Información General', description: 'RUC, nombre de empresa, estado' },
    { key: 'actividad', label: 'Actividad Empresarial', description: 'Descripción de actividad económica' },
    { key: 'representante', label: 'Representante Legal', description: 'Nombre del representante legal' },
    { key: 'domicilio', label: 'Domicilio Fiscal', description: 'Dirección fiscal completa' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exportar Fichas RUC</h1>
          <p className="text-gray-600">
            Genera reportes personalizados de las Fichas RUC procesadas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Formato de Exportación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === 'excel' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportFormat('excel')}
                  >
                    <FileSpreadsheet className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-medium">Excel (.xlsx)</h3>
                    <p className="text-sm text-gray-500">Ideal para análisis de datos</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === 'csv' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportFormat('csv')}
                  >
                    <FileText className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-medium">CSV</h3>
                    <p className="text-sm text-gray-500">Compatible con cualquier sistema</p>
                  </div>
                  
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === 'pdf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FileText className="h-8 w-8 text-red-600 mb-2" />
                    <h3 className="font-medium">PDF</h3>
                    <p className="text-sm text-gray-500">Para reportes formales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Range */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Rango de Fechas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateFrom">Fecha Desde</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateTo">Fecha Hasta</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Datos a Incluir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataOptions.map((option) => (
                    <div key={option.key} className="flex items-start space-x-3">
                      <Checkbox
                        id={option.key}
                        checked={selectedData[option.key as keyof typeof selectedData]}
                        onCheckedChange={(checked) => 
                          setSelectedData(prev => ({ ...prev, [option.key]: checked }))
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor={option.key} className="font-medium">
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Exportación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Formato</Label>
                  <p className="text-sm text-gray-600 capitalize">{exportFormat}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Período</Label>
                  <p className="text-sm text-gray-600">
                    {dateRange.from && dateRange.to 
                      ? `${dateRange.from} a ${dateRange.to}`
                      : 'Todas las fichas RUC'
                    }
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Datos Incluidos</Label>
                  <div className="text-sm text-gray-600">
                    {Object.entries(selectedData)
                      .filter(([_, selected]) => selected)
                      .map(([key]) => 
                        dataOptions.find(opt => opt.key === key)?.label
                      )
                      .join(', ')
                    }
                  </div>
                </div>

                <Button onClick={handleExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Fichas RUC
                </Button>
              </CardContent>
            </Card>

            {/* Quick Export Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Plantillas Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Reporte Completo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Solo Datos Básicos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Directorio de Empresas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Contribuyentes Activos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Export;