import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DocumentoTipo, UploadProgress } from '@/types/documento';
import { DocumentoService } from '@/services/documentoService';
import { showSuccess, showError } from '@/utils/toast';

interface DocumentUploadFormProps {
  onUploadComplete: () => void;
}

const DOCUMENT_TYPES: { value: DocumentoTipo; label: string; icon: string; description: string }[] = [
  { 
    value: 'ficha_ruc', 
    label: 'Ficha RUC', 
    icon: '📋',
    description: 'Documento oficial de registro único de contribuyentes'
  },
  { 
    value: 'representante_legal', 
    label: 'Representante Legal', 
    icon: '👤',
    description: 'Información del representante legal de la empresa'
  },
  { 
    value: 'cuenta_bancaria', 
    label: 'Cuenta Bancaria', 
    icon: '🏦',
    description: 'Información de cuentas bancarias (Cta. Cte., ahorros, etc.)'
  },
  { 
    value: 'eeff', 
    label: 'EEFF (Declaración Jurada)', 
    icon: '🧾',
    description: 'Estados Financieros / Declaración Jurada de la empresa'
  },
  { 
    value: 'reporte_tributario', 
    label: 'Reporte Tributario', 
    icon: '📊',
    description: 'Reportes tributarios y balances'
  },
  { 
    value: 'sentinel', 
    label: 'Sentinel', 
    icon: '🛡️',
    description: 'Reporte de crédito de Sentinel'
  },
];

const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<DocumentoTipo | ''>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      showError('Solo se permiten archivos PDF');
    }
    
    setSelectedFiles(pdfFiles);
    
    // Auto-detectar tipo de documento basado en el nombre del archivo
    if (pdfFiles.length === 1) {
      const fileName = pdfFiles[0].name.toLowerCase();
      console.log('Auto-detecting document type for:', fileName);
      
      if (fileName.includes('ruc') || fileName.includes('ficha')) {
        setDocumentType('ficha_ruc');
        console.log('Auto-selected: ficha_ruc');
      } else if (fileName.includes('cta') || fileName.includes('cuenta') || fileName.includes('bancaria') || fileName.includes('banco')) {
        setDocumentType('cuenta_bancaria');
        console.log('Auto-selected: cuenta_bancaria');
      } else if (fileName.includes('representante') || fileName.includes('legal')) {
        setDocumentType('representante_legal');
        console.log('Auto-selected: representante_legal');
      } else if (fileName.includes('eeff') || fileName.includes('financiero') || fileName.includes('declaracion')) {
        setDocumentType('eeff');
        console.log('Auto-selected: eeff');
      } else if (fileName.includes('tributario') || fileName.includes('reporte') || fileName.includes('balance')) {
        setDocumentType('reporte_tributario');
        console.log('Auto-selected: reporte_tributario');
      } else if (fileName.includes('sentinel')) {
        setDocumentType('sentinel');
        console.log('Auto-selected: sentinel');
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showError('Selecciona al menos un archivo');
      return;
    }

    if (!documentType) {
      showError('Selecciona el tipo de documento');
      return;
    }

    console.log('Starting upload process...');
    console.log('Document type selected:', documentType);

    setIsUploading(true);
    
    const initialProgress: UploadProgress[] = selectedFiles.map((file, index) => ({
      fileId: `${index}`,
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(initialProgress);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, file.name, 'as type:', documentType);
          
          await DocumentoService.uploadAndInsert(
            file,
            documentType,
            (progress) => {
              setUploadProgress(prev => 
                prev.map(item => 
                  item.fileId === `${i}` 
                    ? { ...item, progress }
                    : item
                )
              );
            }
          );

          setUploadProgress(prev => 
            prev.map(item => 
              item.fileId === `${i}` 
                ? { ...item, status: 'completed', progress: 100 }
                : item
            )
          );

          successCount++;

        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          
          setUploadProgress(prev => 
            prev.map(item => 
              item.fileId === `${i}` 
                ? { 
                    ...item, 
                    status: 'error', 
                    progress: 0,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                  }
                : item
            )
          );

          errorCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(`${successCount} archivo(s) subido(s) y enviado(s) al webhook para procesamiento`);
      }
      
      if (errorCount > 0) {
        showError(`${errorCount} archivo(s) fallaron al subir`);
      }

      if (errorCount === 0) {
        setSelectedFiles([]);
        setDocumentType('');
        setUploadProgress([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      onUploadComplete();

    } catch (error) {
      console.error('Error in upload process:', error);
      showError('Error durante el proceso de subida');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return <Brain className="h-4 w-4 animate-pulse text-[#00FF80]" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-[#00FF80]" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-[#00FF80]';
      case 'completed':
        return 'text-[#00FF80]';
      case 'error':
        return 'text-red-400';
    }
  };

  const getStatusText = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'Enviando al webhook...';
      case 'completed':
        return 'Enviado exitosamente';
      case 'error':
        return 'Error en envío';
    }
  };

  return (
    <Card className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all duration-300">
      <CardContent className="space-y-6 p-6">
        {/* Selector de tipo de documento */}
        <div>
          <Label htmlFor="documentType" className="text-gray-300 font-medium">Tipo de Documento *</Label>
          <Select value={documentType} onValueChange={(value) => {
            console.log('Manual type selection:', value);
            setDocumentType(value as DocumentoTipo);
          }}>
            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
              <SelectValue placeholder="Selecciona el tipo de documento" />
            </SelectTrigger>
            <SelectContent className="bg-[#121212] border-gray-800">
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-800">
                  <div className="flex items-start space-x-3 py-2">
                    <span className="text-lg">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-400">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {documentType && (
            <div className="mt-2 p-3 bg-[#00FF80]/10 border border-[#00FF80]/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{DOCUMENT_TYPES.find(t => t.value === documentType)?.icon}</span>
                <div>
                  <div className="text-sm font-medium text-[#00FF80]">
                    {DOCUMENT_TYPES.find(t => t.value === documentType)?.label}
                  </div>
                  <div className="text-xs text-gray-300">
                    Tipo seleccionado: <code className="bg-gray-800 px-1 rounded">{documentType}</code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selector de archivos */}
        <div>
          <Label htmlFor="fileInput" className="text-gray-300 font-medium">Archivos PDF *</Label>
          <Input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50"
          />
          <p className="text-xs text-gray-400 mt-1">
            Selecciona uno o más archivos PDF (máximo 50MB por archivo)
          </p>
        </div>

        {/* Lista de archivos seleccionados */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-gray-300 font-medium">Archivos Seleccionados ({selectedFiles.length})</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-[#00FF80]" />
                    <span className="text-sm font-medium truncate text-white">{file.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progreso de subida */}
        {uploadProgress.length > 0 && (
          <div className="space-y-4">
            <Label className="text-gray-300 font-medium">Progreso de Envío</Label>
            {uploadProgress.map((progress) => (
              <div key={progress.fileId} className="space-y-3 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(progress.status)}
                    <span className="text-sm font-medium truncate text-white">{progress.fileName}</span>
                  </div>
                  <span className={`text-xs font-medium ${getStatusColor(progress.status)}`}>
                    {getStatusText(progress.status)}
                  </span>
                </div>
                {progress.status === 'uploading' && (
                  <div className="space-y-2">
                    <Progress 
                      value={progress.progress} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-center space-x-2 text-xs text-[#00FF80]">
                      <Zap className="h-3 w-3 animate-pulse" />
                      <span>Enviando al webhook para procesamiento...</span>
                    </div>
                  </div>
                )}
                {progress.status === 'completed' && (
                  <div className="flex items-center justify-center space-x-2 text-xs text-[#00FF80] bg-[#00FF80]/10 py-2 rounded border border-[#00FF80]/20">
                    <CheckCircle className="h-3 w-3" />
                    <span>Documento enviado exitosamente al webhook</span>
                  </div>
                )}
                {progress.status === 'error' && progress.error && (
                  <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                    <strong>Error:</strong> {progress.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botón de subida */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0 || !documentType}
          className="w-full bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
          size="lg"
        >
          {isUploading ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-pulse" />
              Enviando al webhook...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Subir y Procesar {selectedFiles.length > 0 ? `${selectedFiles.length} archivo(s)` : 'Archivos'}
            </>
          )}
        </Button>

        {/* Info sobre procesamiento */}
        <div className="bg-[#00FF80]/10 border border-[#00FF80]/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-[#00FF80]">
            <Brain className="h-4 w-4" />
            <span className="text-xs font-medium">
              Los documentos se enviarán al webhook para procesamiento automático
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadForm;