import React from 'react';
import { MessageSquare, FileText, Download, Calendar, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DossierRib } from '@/types/dossier';

interface ComentariosEjecutivoSectionProps {
  dossier: DossierRib;
}

const ComentariosEjecutivoSection: React.FC<ComentariosEjecutivoSectionProps> = ({ dossier }) => {
  const comentario = dossier.comentariosEjecutivo;

  if (!comentario) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No hay comentarios del ejecutivo para esta solicitud</p>
        <p className="text-gray-500 text-sm mt-2">
          Los comentarios del ejecutivo se pueden agregar desde la sección correspondiente
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.storage
        .from('documentos')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const fileName = filePath.split('/').pop() || 'archivo';
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con Metadata */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Comentarios del Ejecutivo</h4>
              <p className="text-sm text-gray-400">Análisis y observaciones del equipo</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            Confidencial
          </Badge>
        </div>
      </div>

      {/* Metadata del Comentario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Label className="text-gray-400 text-xs">Fecha de Creación</Label>
          </div>
          <p className="text-white text-sm">{formatDate(comentario.created_at)}</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Label className="text-gray-400 text-xs">Última Actualización</Label>
          </div>
          <p className="text-white text-sm">{formatDate(comentario.updated_at)}</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <Label className="text-gray-400 text-xs">Archivos Adjuntos</Label>
          </div>
          <p className="text-white text-sm font-semibold">
            {comentario.archivos_adjuntos?.length || 0} archivo(s)
          </p>
        </div>
      </div>

      {/* Comentario Principal */}
      <div>
        <Label className="text-gray-400 text-sm mb-3 block">Comentario</Label>
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
            {comentario.comentario}
          </p>
        </div>
      </div>

      {/* Archivos Adjuntos */}
      {comentario.archivos_adjuntos && comentario.archivos_adjuntos.length > 0 && (
        <div>
          <Label className="text-gray-400 text-sm mb-3 block">Archivos Adjuntos</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {comentario.archivos_adjuntos.map((filePath, index) => {
              const fileName = filePath.split('/').pop() || `Archivo ${index + 1}`;
              const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
              
              return (
                <div 
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {fileName}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {fileExtension}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownloadFile(filePath)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex-shrink-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="text-white text-sm font-semibold mb-1">Información Confidencial</h5>
            <p className="text-gray-400 text-xs leading-relaxed">
              Los comentarios del ejecutivo contienen información sensible y análisis interno. 
              Este contenido debe ser tratado con confidencialidad y solo compartido con personal autorizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComentariosEjecutivoSection;

