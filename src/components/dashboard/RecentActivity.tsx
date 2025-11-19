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
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
              <Activity className="h-5 w-5 text-[#00FF80]" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Actividad Reciente</CardTitle>
              <p className="text-sm text-gray-400">Últimas empresas procesadas por IA</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-gray-800 text-gray-300 border border-gray-700">
            {activities.length} registros
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No hay actividad reciente</h3>
            <p className="text-gray-400 mb-6">Los datos procesados por tu agente de IA aparecerán aquí automáticamente</p>
            <Button 
              onClick={() => window.location.href = '/upload'} 
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
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
                className="group flex items-center space-x-4 p-4 rounded-xl bg-gray-900/50 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-[#00FF80]/30"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00FF80]/10 to-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
                    <Building2 className="h-6 w-6 text-[#00FF80]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {activity.nombre_empresa || 'Nueva empresa procesada'}
                    </h4>
                    <Badge className="bg-[#00FF80]/10 text-[#00FF80] border-0 text-xs">
                      ✨ Procesado por IA
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center">
                    <span className="font-medium">RUC:</span> 
                    <span className="font-mono ml-1 bg-gray-800 px-2 py-0.5 rounded text-xs text-gray-300">
                      {activity.ruc || 'N/A'}
                    </span>
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs h-6 px-2 text-[#00FF80] hover:bg-[#00FF80]/10"
                      onClick={() => window.location.href = '/fichas-ruc'}
                    >
                      Ver →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  className="text-[#00FF80] hover:bg-[#00FF80]/10 font-medium"
                  onClick={() => window.location.href = '/fichas-ruc'}
                >
                  Ver todas las fichas RUC →
                </Button>
                <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
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