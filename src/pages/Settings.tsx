import React, { useState } from 'react';
import { Save, Bell, Database, Shield } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      processing: true,
      errors: true,
      dailyReport: false,
    },
    processing: {
      autoProcess: true,
      requireReview: false,
      maxFileSize: '50',
    },
    database: {
      backupFrequency: 'daily',
      retentionDays: '365',
    },
  });

  const handleSave = () => {
    showSuccess('Configuración guardada exitosamente');
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">
              Administra las configuraciones del sistema de procesamiento de documentos
            </p>
          </div>
          
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Guardar Cambios</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificaciones por Email</Label>
                  <p className="text-xs text-gray-500">Recibir notificaciones por correo</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSetting('notifications.email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Procesamiento Completado</Label>
                  <p className="text-xs text-gray-500">Notificar cuando termine el procesamiento</p>
                </div>
                <Switch
                  checked={settings.notifications.processing}
                  onCheckedChange={(checked) => updateSetting('notifications.processing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Errores de Procesamiento</Label>
                  <p className="text-xs text-gray-500">Notificar errores inmediatamente</p>
                </div>
                <Switch
                  checked={settings.notifications.errors}
                  onCheckedChange={(checked) => updateSetting('notifications.errors', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Reporte Diario</Label>
                  <p className="text-xs text-gray-500">Resumen diario de actividad</p>
                </div>
                <Switch
                  checked={settings.notifications.dailyReport}
                  onCheckedChange={(checked) => updateSetting('notifications.dailyReport', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Processing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Configuración de Procesamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Procesamiento Automático</Label>
                  <p className="text-xs text-gray-500">Procesar PDFs automáticamente al subirlos</p>
                </div>
                <Switch
                  checked={settings.processing.autoProcess}
                  onCheckedChange={(checked) => updateSetting('processing.autoProcess', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requiere Revisión Manual</Label>
                  <p className="text-xs text-gray-500">Todos los datos requieren validación</p>
                </div>
                <Switch
                  checked={settings.processing.requireReview}
                  onCheckedChange={(checked) => updateSetting('processing.requireReview', checked)}
                />
              </div>
              
              <div>
                <Label htmlFor="maxFileSize">Tamaño Máximo de Archivo (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.processing.maxFileSize}
                  onChange={(e) => updateSetting('processing.maxFileSize', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Configuración de Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
                <select 
                  id="backupFrequency"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={settings.database.backupFrequency}
                  onChange={(e) => updateSetting('database.backupFrequency', e.target.value)}
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="retentionDays">Días de Retención</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={settings.database.retentionDays}
                  onChange={(e) => updateSetting('database.retentionDays', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Días que se mantendrán los datos antes de archivar
                </p>
              </div>
              
              <Button variant="outline" size="sm">
                Crear Respaldo Manual
              </Button>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de APIs Externas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="sunatApi">API SUNAT (Opcional)</Label>
                  <Input
                    id="sunatApi"
                    placeholder="Token de API SUNAT para validación"
                    type="password"
                  />
                </div>
                <div>
                  <Label htmlFor="reniecApi">API RENIEC (Opcional)</Label>
                  <Input
                    id="reniecApi"
                    placeholder="Token de API RENIEC para validación"
                    type="password"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="customInstructions">Instrucciones Personalizadas para IA</Label>
                <Textarea
                  id="customInstructions"
                  placeholder="Instrucciones adicionales para mejorar la extracción de datos..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Estas instrucciones se utilizarán para personalizar el procesamiento
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;