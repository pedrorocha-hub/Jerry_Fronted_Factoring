import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Building2, Activity, Upload } from 'lucide-react';

interface RecentActivityProps {
  activities: any[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Actividad Reciente</CardTitle>
              <p className="text-sm text-gray-500">Últimas empresas procesadas por IA</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {activities.length} registros
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay actividad reciente</h3>
            <p className="text-gray-500 mb-6">Los datos procesados por tu agente de IA aparecerán aquí automáticamente</p>
            <Button 
              onClick={() => window.location.href = '/upload'} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Documentos
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={index} 
                className="group flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {activity.nombre_empresa || 'Nueva empresa procesada'}
                    </h4>
                    <Badge className="bg-green-100 text-green-800 border-0 text-xs shadow-sm">
                      ✨ Procesado por IA
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 flex items-center">
                    <span className="font-medium">RUC:</span> 
                    <span className="font-mono ml-1 bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {activity.ruc || 'N/A'}
                    </span>
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      {new Date(activity.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs h-6 px-2"
                      onClick={() => window.location.href = '/ficha-ruc'}
                    >
                      Ver →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:bg-blue-50 font-medium"
                  onClick={() => window.location.href = '/ficha-ruc'}
                >
                  Ver todas las fichas RUC →
                </Button>
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  Mostrando últimas {Math.min(activities.length, 5)} actividades
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;