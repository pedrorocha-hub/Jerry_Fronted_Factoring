import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadedFile } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

interface FileDropzoneProps {
  onFilesAdded: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesAdded,
  uploadedFiles,
  onRemoveFile,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
      documentType: detectDocumentType(file.name),
    }));

    onFilesAdded(newFiles);
    showSuccess(`${acceptedFiles.length} archivo(s) agregado(s)`);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach((rejection) => {
        if (rejection.file.size > 50 * 1024 * 1024) {
          showError(`${rejection.file.name} es demasiado grande. Máximo 50MB.`);
        } else {
          showError(`${rejection.file.name} no es un archivo PDF válido.`);
        }
      });
    }
  });

  const detectDocumentType = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('ruc') || name.includes('ficha')) return 'Ficha RUC';
    if (name.includes('financiero') || name.includes('balance') || name.includes('estado')) return 'Estado Financiero';
    if (name.includes('tributario') || name.includes('sunat') || name.includes('declaracion')) return 'Reporte Tributario';
    if (name.includes('representante') || name.includes('poder')) return 'Representantes Legales';
    if (name.includes('sentinel')) return 'Sentinel';
    if (name.includes('apfac')) return 'APFAC';
    if (name.includes('deuda') || name.includes('coactiva')) return 'Deuda Coactiva';
    return 'Documento General';
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'uploading': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'uploading': return 'Enviando';
      case 'completed': return 'Enviado';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive || dragActive 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <Upload className={`mx-auto h-16 w-16 mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra y suelta tus PDFs aquí'}
          </p>
          <p className="text-gray-500 mb-6">
            o haz clic para seleccionar archivos (máximo 50MB por archivo)
          </p>
          <div className="text-sm text-gray-600 mb-4">
            <strong>Tipos soportados:</strong> Ficha RUC, Estados Financieros, Reportes Tributarios, Sentinel, APFAC, Deuda Coactiva
          </div>
          <Button variant="outline" size="lg" className="px-8">
            <Upload className="h-4 w-4 mr-2" />
            Seleccionar Archivos
          </Button>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Archivos ({uploadedFiles.length})
            </h3>
            <div className="text-sm text-gray-500">
              {uploadedFiles.filter(f => f.status === 'completed').length} enviados
            </div>
          </div>
          
          <div className="grid gap-4">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {uploadedFile.documentType}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(uploadedFile.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(uploadedFile.status)}
                          <span>{getStatusLabel(uploadedFile.status)}</span>
                        </div>
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFile(uploadedFile.id)}
                        className="text-gray-400 hover:text-red-600"
                        disabled={uploadedFile.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;