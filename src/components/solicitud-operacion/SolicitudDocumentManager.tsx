import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Eye, Download, Loader2, Paperclip, FileSpreadsheet, Image as ImageIcon, X, File, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { DocumentoService } from '@/services/documentoService';
import { Documento, DocumentoTipo } from '@/types/documento';

interface SolicitudDocumentManagerProps {
  solicitudId: string;
  readonly?: boolean;
}

const SolicitudDocumentManager: React.FC<SolicitudDocumentManagerProps> = ({ 
  solicitudId,
  readonly = false
}) => {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, [solicitudId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('solicitud_id', solicitudId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error cargando documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipo: DocumentoTipo) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset input

    setUploading(true);
    try {
      await DocumentoService.uploadAndInsert(
        file, 
        tipo, 
        undefined, 
        false, 
        solicitudId 
      );
      showSuccess('Archivo subido correctamente.');
      loadDocuments();
    } catch (err: any) {
      console.error('Error subiendo archivo:', err);
      showError(`Error al subir: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (readonly) return;
    if (!confirm('¿Eliminar este documento?')) return;

    try {
      const { error: storageError } = await supabase.storage.from('documentos').remove([path]);
      if (storageError) console.warn('Error storage:', storageError);

      const { error: dbError } = await supabase.from('documentos').delete().eq('id', id);
      if (dbError) throw dbError;

      showSuccess('Documento eliminado.');
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      showError(`Error: ${err.message}`);
    }
  };

  const handlePreview = async (doc: Documento) => {
    try {
      console.log('Generando vista previa para:', doc.storage_path);
      const url = await DocumentoService.getSignedUrl(doc.storage_path);
      console.log('URL generada:', url);

      setPreviewDocName(doc.nombre_archivo || 'Documento');

      const isImage = doc.nombre_archivo?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
      const isPdf = doc.nombre_archivo?.match(/\.pdf$/i);
      
      if (isImage) {
        setPreviewType('image');
        setPreviewUrl(url);
      } else if (isPdf) {
        setPreviewType('pdf');
        setPreviewUrl(url);
      } else {
        // Fallback para otros tipos: intentar abrir en nueva pestaña directamente
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error preview:', err);
      showError('Error al cargar vista previa.');
    }
  };

  const handleDownload = async (doc: Documento) => {
    try {
      const url = await DocumentoService.getSignedUrl(doc.storage_path);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.nombre_archivo || 'documento';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showError('Error al descargar el archivo.');
    }
  };

  const UploadButton = ({ tipo, label, icon: Icon }: { tipo: DocumentoTipo, label: string, icon: any }) => (
    <div className="w-full">
      <input
        type="file"
        id={`upload-${tipo}`}
        className="hidden"
        accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls,.doc,.docx"
        onChange={(e) => handleFileUpload(e, tipo)}
        disabled={uploading || readonly}
      />
      <Label
        htmlFor={`upload-${tipo}`}
        className={`flex flex-col items-center justify-center w-full h-24 p-2 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
          readonly 
            ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900/20' 
            : 'border-gray-700 hover:border-[#00FF80]/50 hover:bg-[#00FF80]/5 bg-gray-900/30'
        }`}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[#00FF80]" />
        ) : (
          <Icon className="h-6 w-6 text-gray-400 mb-2" />
        )}
        <span className="text-xs text-gray-400 font-medium text-center leading-tight">
          {uploading ? 'Subiendo...' : label}
        </span>
      </Label>
    </div>
  );

  const renderDocList = (tipoFilter: string | string[]) => {
    const tipos = Array.isArray(tipoFilter) ? tipoFilter : [tipoFilter];
    const filteredDocs = documents.filter(d => tipos.includes(d.tipo));

    if (filteredDocs.length === 0) return null;

    return (
      <div className="grid grid-cols-1 gap-2 mt-3">
        {filteredDocs.map(doc => {
          const isImage = doc.nombre_archivo?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          const isPdf = doc.nombre_archivo?.match(/\.pdf$/i);
          const isExcel = doc.nombre_archivo?.match(/\.(xlsx|xls)$/i);
          const isPreviewable = isImage || isPdf;

          return (
            <div key={doc.id} className="group flex items-center justify-between p-2 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="h-10 w-10 flex-shrink-0 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <ImageIcon className="h-5 w-5 text-[#00FF80]" />
                  ) : isExcel ? (
                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                  ) : isPdf ? (
                    <FileText className="h-5 w-5 text-orange-400" />
                  ) : (
                    <File className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-200 font-medium truncate max-w-[200px]" title={doc.nombre_archivo || ''}>
                    {doc.nombre_archivo}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">
                    {(doc.tamaño_archivo ? doc.tamaño_archivo / 1024 / 1024 : 0).toFixed(2)} MB • {doc.tipo.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 ${isPreviewable ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10' : 'text-gray-600 hover:text-gray-300'}`}
                  onClick={() => handlePreview(doc)}
                  title={isPreviewable ? "Vista previa" : "Abrir archivo"}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10" 
                  onClick={() => handleDownload(doc)}
                  title="Descargar"
                >
                  <Download className="h-4 w-4" />
                </Button>

                {!readonly && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10" 
                    onClick={() => handleDelete(doc.id, doc.storage_path)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-[#00FF80]" />
              Evidencias
            </div>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
              {documents.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs defaultValue="operacion" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9 bg-gray-900 mb-4">
              <TabsTrigger value="operacion" className="text-xs">Operación</TabsTrigger>
              <TabsTrigger value="legal" className="text-xs">Legal</TabsTrigger>
              <TabsTrigger value="visita" className="text-xs">Visita/Otros</TabsTrigger>
            </TabsList>

            <TabsContent value="operacion" className="space-y-2 m-0">
              {!readonly && (
                <div className="grid grid-cols-1 gap-2">
                  <UploadButton tipo="sustentos" label="Subir Documentos Operativos (Facturas/Sustentos)" icon={FileText} />
                </div>
              )}
              {renderDocList(['factura_negociar', 'sustentos'])}
              {documents.filter(d => ['factura_negociar', 'sustentos'].includes(d.tipo)).length === 0 && (
                <div className="text-center py-6 text-gray-600 text-xs border border-dashed border-gray-800 rounded-lg mt-2">
                  Sin documentos operativos
                </div>
              )}
            </TabsContent>

            <TabsContent value="legal" className="space-y-2 m-0">
              {!readonly && (
                <div className="grid grid-cols-2 gap-2">
                   <UploadButton tipo="vigencia_poder" label="Vigencia/DNI" icon={FileText} />
                   <UploadButton tipo="reporte_tributario" label="Reporte Trib." icon={FileText} />
                </div>
              )}
              {renderDocList(['vigencia_poder', 'representante_legal', 'vigencia_poderes', 'reporte_tributario'])}
            </TabsContent>

            <TabsContent value="visita" className="space-y-2 m-0">
               {!readonly && (
                 <div className="grid grid-cols-2 gap-2">
                   <UploadButton tipo="evidencia_visita" label="Fotos Visita" icon={ImageIcon} />
                   <UploadButton tipo="eeff" label="EEFF / Otros" icon={Upload} />
                 </div>
               )}
               {renderDocList(['evidencia_visita', 'ficha_ruc', 'sentinel', 'eeff', 'cuenta_bancaria'])}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal para vista previa */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="bg-black/95 border-gray-800 text-white max-w-5xl w-full h-[85vh] flex flex-col p-0 overflow-hidden">
           <DialogHeader className="px-4 py-3 border-b border-gray-800 flex flex-row items-center justify-between space-y-0">
             <div className="flex flex-col gap-0.5">
               <DialogTitle className="text-sm font-medium">Vista Previa</DialogTitle>
               <DialogDescription className="text-xs text-gray-400">
                 {previewDocName}
               </DialogDescription>
             </div>
             <div className="flex items-center gap-2">
                {previewUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(previewUrl, '_blank')} 
                    className="text-xs h-8 border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Abrir en nueva pestaña
                  </Button>
                )}
               <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(null)} className="text-gray-400 hover:text-white h-8 w-8">
                 <X className="h-5 w-5" />
               </Button>
             </div>
           </DialogHeader>
           
           <div className="flex-1 flex items-center justify-center h-full w-full bg-[#1a1a1a] relative">
             {previewUrl && previewType === 'image' && (
               <img 
                 src={previewUrl} 
                 alt="Vista previa" 
                 className="max-w-full max-h-full object-contain p-4"
               />
             )}
             {previewUrl && previewType === 'pdf' && (
               <iframe
                 src={previewUrl}
                 className="w-full h-full border-none"
                 title="Vista previa PDF"
               />
             )}
           </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SolicitudDocumentManager;