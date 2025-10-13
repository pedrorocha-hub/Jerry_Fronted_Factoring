import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, File, X } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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
    const toastId = showLoading('Subiendo archivos...');

    for (const file of files) {
      const filePath = `public/${file.name}`;
      const { error } = await supabase.storage.from('documentos').upload(filePath, file);

      if (error) {
        dismissToast(toastId);
        showError(`Error al subir ${file.name}: ${error.message}`);
        setUploading(false);
        return;
      }
    }

    dismissToast(toastId);
    showSuccess('Todos los archivos se han subido correctamente.');
    setFiles([]);
    setUploading(false);
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <UploadCloud className="h-6 w-6 mr-3 text-[#00FF80]" />
          Subir Documentos
        </h1>
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Carga de Fichas RUC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-700 rounded-lg">
              <UploadCloud className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-white">Arrastra y suelta archivos aquí</h3>
              <p className="text-gray-400">o</p>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button asChild className="mt-4 bg-gray-800 hover:bg-gray-700 text-white">
                <label htmlFor="file-upload">Seleccionar Archivos</label>
              </Button>
            </div>
            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-white font-semibold mb-2">Archivos seleccionados:</h4>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded-md">
                      <div className="flex items-center space-x-2">
                        <File className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-white">{file.name}</span>
                      </div>
                      <button onClick={() => handleRemoveFile(index)} className="text-gray-500 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4 bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {uploading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UploadPage;