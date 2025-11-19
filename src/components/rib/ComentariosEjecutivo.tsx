import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Paperclip, 
  Upload, 
  X, 
  FileText, 
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { ComentariosEjecutivoService, ComentarioEjecutivo as ComentarioEjecutivoType } from '@/services/comentariosEjecutivoService';

interface ComentariosEjecutivoProps {
  ribId?: string;
  comentario?: ComentarioEjecutivoType;
  onSave?: (comentario: ComentarioEjecutivoType) => void;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  storagePath?: string;
}

const ComentariosEjecutivo: React.FC<ComentariosEjecutivoProps> = ({
  ribId,
  comentario,
  onSave,
  disabled = false
}) => {
  const [comentarioText, setComentarioText] = useState(comentario?.comentario || '');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar comentarios existentes cuando se proporciona ribId
  React.useEffect(() => {
    const loadComentarios = async () => {
      if (ribId && !comentario) {
        try {
          const existingComentario = await ComentariosEjecutivoService.getByRibId(ribId);
          if (existingComentario) {
            setComentarioText(existingComentario.comentario);
            
            if (existingComentario.archivos_adjuntos && existingComentario.archivos_adjuntos.length > 0) {
              const existingFiles: UploadedFile[] = existingComentario.archivos_adjuntos.map((path, index) => ({
                file: new File([], path.split('/').pop() || `archivo_${index + 1}`),
                id: `existing_${index}`,
                status: 'completed' as const,
                progress: 100,
                storagePath: path
              }));
              setUploadedFiles(existingFiles);
            }
          }
        } catch (error) {
          console.error('Error loading comentarios:', error);
        }
      }
    };

    loadComentarios();
  }, [ribId, comentario]);

  // Inicializar archivos existentes si hay comentario previo
  React.useEffect(() => {
    if (comentario?.archivos_adjuntos && comentario.archivos_adjuntos.length > 0) {
      // Simular archivos existentes
      const existingFiles: UploadedFile[] = comentario.archivos_adjuntos.map((path, index) => ({
        file: new File([], path.split('/').pop() || `archivo_${index + 1}`),
        id: `existing_${index}`,
        status: 'completed' as const,
        progress: 100,
        storagePath: path
      }));
      setUploadedFiles(existingFiles);
    }
  }, [comentario]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    showSuccess(`${acceptedFiles.length} archivo(s) agregado(s)`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled
  });

  const uploadFile = async (file: UploadedFile): Promise<string> => {
    const fileId = crypto.randomUUID();
    const fileName = file.file.name;
    const path = `comentarios_ejecutivo/${fileId}_${fileName}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(path, file.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error subiendo archivo: ${uploadError.message}`);
      }

      return path;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!comentarioText.trim()) {
      setError('Debe ingresar un comentario');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Subir archivos pendientes
      const archivosPaths: string[] = [];
      
      for (const file of uploadedFiles) {
        if (file.status === 'pending') {
          file.status = 'uploading';
          setUploadedFiles([...uploadedFiles]);
          
          try {
            const path = await uploadFile(file);
            archivosPaths.push(path);
            file.status = 'completed';
            file.storagePath = path;
          } catch (error) {
            file.status = 'error';
            console.error('Error uploading file:', error);
          }
        } else if (file.status === 'completed' && file.storagePath) {
          archivosPaths.push(file.storagePath);
        }
      }

      if (!ribId) {
        setError('ID de RIB requerido para guardar comentarios');
        return;
      }

      const comentarioData = {
        comentario: comentarioText,
        archivos_adjuntos: archivosPaths,
        rib_id: ribId
      };

      // Guardar en la base de datos
      const savedComentario = await ComentariosEjecutivoService.upsert(ribId, comentarioData);

      if (onSave) {
        onSave(savedComentario);
      }

      showSuccess('Comentarios del ejecutivo guardados correctamente');
    } catch (error) {
      console.error('Error saving comentarios:', error);
      setError('Error al guardar los comentarios');
      showError('Error al guardar los comentarios');
    } finally {
      setSaving(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const downloadFile = async (storagePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .download(storagePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      showError('Error al descargar el archivo');
    }
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'uploading':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <MessageSquare className="h-5 w-5 mr-2 text-[#00FF80]" />
          Comentarios del Ejecutivo
          <Badge variant="secondary" className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500/30">
            BETA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="comentario" className="text-white font-semibold">
            Comentarios
          </Label>
          <Textarea
            id="comentario"
            value={comentarioText}
            onChange={(e) => setComentarioText(e.target.value)}
            placeholder="Ingrese sus comentarios sobre el análisis RIB..."
            className="bg-gray-900/50 border-gray-700 min-h-[120px] mt-2"
            disabled={disabled}
          />
        </div>

        <div>
          <Label className="text-white font-semibold mb-2 block">
            Archivos Adjuntos
          </Label>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-[#00FF80] bg-[#00FF80]/5'
                : 'border-gray-600 hover:border-gray-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-300 mb-1">
              {isDragActive
                ? 'Suelta los archivos aquí'
                : 'Arrastra archivos aquí o haz clic para seleccionar'}
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, DOCX, PNG, JPG (máx. 10MB cada uno)
            </p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300 truncate max-w-xs">
                      {file.file.name}
                    </span>
                    <span className={`text-xs ${getStatusColor(file.status)}`}>
                      {file.status === 'uploading' && (
                        <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                      )}
                      {file.status === 'completed' ? 'Completado' : 
                       file.status === 'uploading' ? 'Subiendo...' : 
                       file.status === 'error' ? 'Error' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && file.storagePath && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file.storagePath!, file.file.name)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={saving || disabled || !comentarioText.trim()}
            className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Paperclip className="h-4 w-4 mr-2" />
                Guardar Comentarios
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComentariosEjecutivo;
