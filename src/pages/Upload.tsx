import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, File, X, RefreshCw, FileText, Shield, BarChart2, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type DocumentType = 'Ficha RUC' | 'Sentinel' | 'Reporte Tributario';
type Documento = {
  id: string;
  nombre_archivo: string;
  tipo: DocumentType;
  estado: 'pending' | 'processing' | 'completed' | 'error' | 'uploading';
  created_at: string;
  error_msg?: string;
};

const DOCUMENT_TYPES: { id: DocumentType; label: string; icon: React.ElementType }[] = [
  { id: 'Ficha RUC', label: 'Ficha RUC', icon: FileText },
  { id: 'Sentinel', label: 'Sentinel', icon: Shield },
  { id: 'Reporte Tributario', label: 'Reporte Tributario', icon: BarChart2 },
];

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('Ficha RUC');
  const [recentDocuments, setRecentDocuments] = useState<Documento[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const fetchRecentDocuments = useCallback(async () => {
    setLoadingRecent(true);
    const { data, error } = await supabase
      .from('documentos')
      .select('id, nombre_archivo, tipo, estado, created_at, error_msg')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      showError('Error al cargar documentos recientes.');
      console.error(error);
    } else {
      setRecentDocuments(data as Documento[]);
    }
    setLoadingRecent(false);
  }, []);

  useEffect(() => {
    fetchRecentDocuments();
  }, [fetchRecentDocuments]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      showError('Por favor, seleccione al menos un archivo.');
      return;
    }

    setUploading(true);
    const toastId = showLoading(`Subiendo ${files.length} archivo(s)...`);
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${selectedDocType}/${uniqueFileName}`;

      const { data: docRecord, error: insertError } = await supabase
        .from('documentos')
        .insert({
          tipo: selectedDocType,
          nombre_archivo: file.name,
          tamaño_archivo: file.size,
          estado: 'uploading',
          storage_path: filePath,
        })
        .select('id')
        .single();

      if (insertError) {
        showError(`Error al registrar ${file.name}: ${insertError.message}`);
        errorCount++;
        continue;
      }

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) {
        await supabase
          .from('documentos')
          .update({ estado: 'error', error_msg: uploadError.message })
          .eq('id', docRecord.id);
        showError(`Error al subir ${file.name}: ${uploadError.message}`);
        errorCount++;
      } else {
        await supabase
          .from('documentos')
          .update({ estado: 'pending' })
          .eq('id', docRecord.id);
        successCount++;
      }
    }

    dismissToast(toastId);
    if (successCount > 0) {
      showSuccess(`${successCount} archivo(s) subido(s) correctamente.`);
    }
    if (errorCount > 0) {
      showError(`${errorCount} archivo(s) no pudieron subirse.`);
    }
    
    setFiles([]);
    setUploading(false);
    fetchRecentDocuments();
  };

  const getStatusBadge = (status: Documento['estado']) => {
    const variants = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse',
      completed: 'bg-green-500/10 text-green-400 border-green-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      uploading: 'bg-gray-500/10 text-gray-400 border-gray-500/20 animate-pulse',
    };
    const labels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      error: 'Error',
      uploading: 'Subiendo',
    };
    return <Badge className={variants[status] || variants.pending}>{labels[status] || 'Desconocido'}</Badge>;
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <UploadCloud className="h-6 w-6 mr-3 text-[#00FF80]" />
          Subir Documentos
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">1. Seleccione el tipo de documento</CardTitle>
              <CardDescription className="text-gray-400">
                Elija el tipo de documento que va a subir. Esto nos ayuda a procesarlo correctamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedDocType} 
                onValueChange={(value) => setSelectedDocType(value as DocumentType)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {DOCUMENT_TYPES.map(({ id, label, icon: Icon }) => (
                  <Label key={id} htmlFor={id} className="flex flex-col items-center justify-center rounded-md border-2 border-gray-700 bg-transparent p-4 hover:bg-gray-800/50 has-[:checked]:border-[#00FF80] has-[:checked]:bg-[#00FF80]/10 cursor-pointer transition-all">
                    <RadioGroupItem value={id} id={id} className="sr-only" />
                    <Icon className="mb-3 h-6 w-6 text-[#00FF80]" />
                    <span className="font-medium text-white">{label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">2. Seleccione los archivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-700 rounded-lg">
                <UploadCloud className="w-10 h-10 text-gray-500 mb-3" />
                <Input id="file-upload" type="file" multiple onChange={handleFileChange} className="hidden" />
                <Button asChild className="bg-gray-800 hover:bg-gray-700 text-white">
                  <label htmlFor="file-upload">Seleccionar Archivos</label>
                </Button>
                <p className="text-xs text-gray-500 mt-2">o arrastra y suelta aquí</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {files.length > 0 && (
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">3. Archivos listos para subir</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded-md">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-white truncate">{file.name}</span>
                    </div>
                    <button onClick={() => handleRemoveFile(index)} className="text-gray-500 hover:text-red-500 ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4 bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : `Subir ${files.length} archivo(s) como ${selectedDocType}`}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Documentos Recientes</CardTitle>
              <CardDescription className="text-gray-400">Últimos 10 documentos subidos.</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchRecentDocuments} disabled={loadingRecent} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <RefreshCw className={`h-4 w-4 ${loadingRecent ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-300">Nombre de Archivo</TableHead>
                  <TableHead className="text-gray-300">Tipo</TableHead>
                  <TableHead className="text-gray-300">Estado</TableHead>
                  <TableHead className="text-right text-gray-300">Fecha de Subida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRecent ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">Cargando...</TableCell></TableRow>
                ) : recentDocuments.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-400">No hay documentos recientes.</TableCell></TableRow>
                ) : (
                  recentDocuments.map((doc) => (
                    <TableRow key={doc.id} className="border-gray-800">
                      <TableCell className="font-medium text-white">{doc.nombre_archivo}</TableCell>
                      <TableCell className="text-gray-400">{doc.tipo}</TableCell>
                      <TableCell>{getStatusBadge(doc.estado)}</TableCell>
                      <TableCell className="text-right text-gray-400 text-sm">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: es })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Upload;