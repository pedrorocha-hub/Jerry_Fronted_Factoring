import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Eye, Download, Loader2, Paperclip, FileSpreadsheet, Image as ImageIcon, X, File, ExternalLink, Brain, Receipt, Camera, FolderOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { DocumentoService } from '@/services/documentoService';
import { Documento, DocumentoTipo } from '@/types/documento';

interface SolicitudDocumentManagerProps {
  solicitudId: string;
  readonly?: boolean;
  refreshTrigger?: number;
}

const SolicitudDocumentManager: React.FC<SolicitudDocumentManagerProps> = ({ 
  solicitudId,
  readonly = false,
  refreshTrigger = 0
}) => {
  const [documents, setDocuments] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, [solicitudId, refreshTrigger]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset input

    setUploading(true);
    try {
      // Los documentos subidos por este botón general se clasifican como 'sustentos'
      await DocumentoService.uploadAndInsert(
        file, 
        'sustentos', 
        undefined, 
        false, 
        solicitudId 
      );
      showSuccess('Documento subido correctamente.');
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
      const url = await DocumentoService.getSignedUrl(doc.storage_path);
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

  return (
    <>
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-[#00FF80]" />
              Documentos / Sustentos
            </div>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
              {documents.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-6">
          
          {/* Botón de carga general (Sustentos adicionales) */}
          {!readonly && (
            <div className="w-full">
              <input
                type="file"
                id="upload-sustentos-unified"
                className="hidden"
                accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Label
                htmlFor="upload-sustentos-unified"
                className={`flex flex-col items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                  uploading
                    ? 'border-gray-700 bg-gray-900/50 cursor-wait'
                    : 'border-gray-700 bg-gray-900/30 hover:bg-[#00FF80]/5 hover:border-[#00FF80]/50 hover:text-[#00FF80] text-gray-400'
                }`}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {uploading ? 'Subiendo...' : 'Subir Sustento Adicional / Otros'}
                    </span>
                  </div>
                )}
              </Label>
            </div>
          )}

          {/* Secciones de Documentos Agrupados */}
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-xs border border-dashed border-gray-800 rounded-lg">
              No hay documentos adjuntos aún.
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { 
                  id: 'facturas', 
                  title: 'Facturas a Negociar', 
                  icon: Receipt, 
                  color: 'text-blue-400',
                  docs: documents.filter(d => d.tipo === 'factura_negociar')
                },
                { 
                  id: 'evidencias', 
                  title: 'Evidencias de Visita', 
                  icon: Camera, 
                  color: 'text-purple-400',
                  docs: documents.filter(d => d.tipo === 'evidencia_visita')
                },
                { 
                  id: 'otros', 
                  title: 'Sustentos y Otros', 
                  icon: FolderOpen, 
                  color: 'text-[#00FF80]',
                  docs: documents.filter(d => !['factura_negociar', 'evidencia_visita'].includes(d.tipo))
                }
              ].map((section) => (
                section.docs.length > 0 && (
                  <div key={section.id} className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 pb-1 border-b border-gray-800">
                      <section.icon className={`h-3 w-3 ${section.color}`} />
                      {section.title} ({section.docs.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {section.docs.map(doc => {
                        const isImage = doc.nombre_archivo?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        const isPdf = doc.nombre_archivo?.match(/\.pdf$/i);
                        const isExcel = doc.nombre_archivo?.match(/\.(xlsx|xls)$/i);
                        const isPreviewable = isImage || isPdf;

                        return (
                          <div key={doc.id} className="group flex items-center justify-between p-2.5 bg-gray-900/40 border border-gray-800/60 rounded-md hover:bg-gray-900/80 hover:border-gray-700 transition-all">
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <div className="h-8 w-8 flex-shrink-0 bg-gray-800 rounded flex items-center justify-center">
                                {isImage ? (
                                  <ImageIcon className="h-4 w-4 text-[#00FF80]" />
                                ) : isExcel ? (
                                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                                ) : isPdf ? (
                                  <FileText className="h-4 w-4 text-orange-400" />
                                ) : (
                                  <File className="h-4 w-4 text-blue-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-200 truncate" title={doc.nombre_archivo || ''}>
                                  {doc.nombre_archivo}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {(doc.tamaño_archivo ? doc.tamaño_archivo / 1024 / 1024 : 0).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`h-7 w-7 ${isPreviewable ? 'text-blue-400 hover:bg-blue-400/10' : 'text-gray-600'}`}
                                onClick={() => handlePreview(doc)}
                                title={isPreviewable ? "Vista previa" : "Abrir archivo"}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10" 
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>

                              {!readonly && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-red-500/10" 
                                  onClick={() => handleDelete(doc.id, doc.storage_path)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="bg-black/95 border-gray-800 text-white max-w-5xl w-full h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
           <DialogHeader className="px-4 py-3 border-b border-gray-800 flex flex-row items-center justify-between space-y-0 shrink-0">
             <div className="flex flex-col gap-0.5 overflow-hidden">
               <DialogTitle className="text-sm font-medium truncate max-w-[300px] md:max-w-[500px]" title={previewDocName}>
                 {previewDocName}
               </DialogTitle>
               <DialogDescription className="text-xs text-gray-400">
                 Vista previa del documento
               </DialogDescription>
             </div>
             <div className="flex items-center gap-2 shrink-0">
                {previewUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(previewUrl, '_blank')} 
                    className="text-xs h-8 border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    <span className="hidden sm:inline">Abrir en nueva pestaña</span>
                    <span className="sm:hidden">Abrir</span>
                  </Button>
                )}
               <Button variant="ghost" size="icon" onClick={() => setPreviewUrl(null)} className="text-gray-400 hover:text-white h-8 w-8">
                 <X className="h-5 w-5" />
               </Button>
             </div>
           </DialogHeader>
           
           <div className="flex-1 w-full h-full bg-[#121212] relative overflow-hidden">
             {previewUrl && previewType === 'image' && (
               <img 
                 src={previewUrl} 
                 alt="Vista previa" 
                 className="w-full h-full object-contain p-4"
               />
             )}
             {previewUrl && previewType === 'pdf' && (
               <iframe
                 src={previewUrl}
                 className="w-full h-full border-none"
                 title="Vista previa PDF"
                 allow="fullscreen"
               />
             )}
           </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SolicitudDocumentManager;