import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Eye, Download, Loader2, Paperclip, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

    // Reset input
    e.target.value = '';

    setUploading(true);
    try {
      // Subir archivo al storage y crear registro vinculado a la solicitud
      // El estado se marca como 'completed' para evidencias manuales, o 'pending' si requiere IA
      // Para Factoring, usualmente queremos que la IA procese la factura, así que 'pending' es mejor por defecto (o lo que decida el service)
      
      await DocumentoService.uploadAndInsert(
        file, 
        tipo, 
        undefined, 
        false, // autoDispatch (false para evitar trigger inmediato si se desea, o true si se requiere procesamiento)
        solicitudId // Vinculación directa
      );

      // Si queremos marcar explícitamente como 'completed' (solo almacenamiento) para ciertos tipos,
      // podríamos hacer un update posterior, pero por defecto uploadAndInsert lo deja en 'pending'.
      // Si estos documentos son solo evidencia y no requieren extracción IA inmediata, podemos actualizarlos:
      
      if (['sustentos', 'evidencia_visita', 'vigencia_poder'].includes(tipo)) {
         // Estos tipos son puramente documentales/evidencia por ahora
         // Opcional: Actualizar estado a 'completed' si no hay proceso de IA asociado
      }

      showSuccess('Documento adjuntado correctamente.');
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
      // Eliminar del storage
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([path]);
      
      if (storageError) console.warn('Error eliminando del storage:', storageError);

      // Eliminar de la BD
      const { error: dbError } = await supabase
        .from('documentos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      showSuccess('Documento eliminado.');
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      showError(`Error: ${err.message}`);
    }
  };

  const handleDownload = async (path: string, name: string) => {
    try {
      const url = await DocumentoService.getSignedUrl(path);
      // Crear un link temporal para forzar la descarga con el nombre correcto
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      showError('Error al descargar archivo.');
    }
  };

  const renderDocList = (tipoFilter: string | string[]) => {
    const tipos = Array.isArray(tipoFilter) ? tipoFilter : [tipoFilter];
    const filteredDocs = documents.filter(d => tipos.includes(d.tipo));

    if (filteredDocs.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-lg">
          <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay documentos adjuntos en esta sección.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-gray-700 transition-colors">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="p-2 bg-gray-800 rounded-md">
                <FileText className="h-4 w-4 text-[#00FF80]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate" title={doc.nombre_archivo || ''}>
                  {doc.nombre_archivo}
                </p>
                <p className="text-xs text-gray-500">
                  {(doc.tamaño_archivo ? doc.tamaño_archivo / 1024 / 1024 : 0).toFixed(2)} MB • {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-[#00FF80]" 
                onClick={() => handleDownload(doc.storage_path, doc.nombre_archivo || 'doc')}
                title="Ver / Descargar"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {!readonly && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-red-500" 
                  onClick={() => handleDelete(doc.id, doc.storage_path)}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const UploadButton = ({ tipo, label, icon: Icon }: { tipo: DocumentoTipo, label: string, icon: any }) => (
    <div>
      <input
        type="file"
        id={`upload-${tipo}`}
        className="hidden"
        accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls"
        onChange={(e) => handleFileUpload(e, tipo)}
        disabled={uploading || readonly}
      />
      <Label
        htmlFor={`upload-${tipo}`}
        className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          readonly 
            ? 'opacity-50 cursor-not-allowed border-gray-800 bg-gray-900/20' 
            : 'border-gray-700 hover:border-[#00FF80]/50 hover:bg-[#00FF80]/5 bg-gray-900/30'
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-[#00FF80]" />
          ) : (
            <Icon className="h-6 w-6 text-gray-400" />
          )}
          <span className="text-xs text-gray-400 font-medium text-center">
            {uploading ? 'Subiendo...' : `Adjuntar ${label}`}
          </span>
        </div>
      </Label>
    </div>
  );

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <Paperclip className="h-5 w-5 mr-2 text-[#00FF80]" />
            Documentación y Evidencias
          </div>
          <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-700">
            {documents.length} Archivos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="facturas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="facturas">Facturas</TabsTrigger>
            <TabsTrigger value="legales">Vigencias / DNI</TabsTrigger>
            <TabsTrigger value="otros">Otros</TabsTrigger>
          </TabsList>

          <TabsContent value="facturas" className="space-y-4 pt-4">
            {!readonly && (
               <div className="grid grid-cols-1 gap-4">
                 <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-300 mb-2">
                   <p>ℹ️ Suba aquí las facturas y sustentos. El sistema las guardará como evidencia.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <UploadButton tipo="factura_negociar" label="Facturas" icon={FileSpreadsheet} />
                   <UploadButton tipo="sustentos" label="Sustentos (Guías/OC)" icon={FileText} />
                 </div>
               </div>
            )}
            {renderDocList(['factura_negociar', 'sustentos'])}
          </TabsContent>

          <TabsContent value="legales" className="space-y-4 pt-4">
            {!readonly && <UploadButton tipo="vigencia_poder" label="Vigencia / DNI" icon={FileText} />}
            {renderDocList(['vigencia_poder', 'representante_legal', 'vigencia_poderes'])}
          </TabsContent>

          <TabsContent value="otros" className="space-y-4 pt-4">
             {!readonly && (
               <div className="grid grid-cols-2 gap-4">
                 <UploadButton tipo="reporte_tributario" label="Reportes Tributarios" icon={Upload} />
                 <UploadButton tipo="evidencia_visita" label="Fotos Visita" icon={Eye} />
               </div>
             )}
             {renderDocList(['reporte_tributario', 'ficha_ruc', 'sentinel', 'eeff', 'cuenta_bancaria', 'evidencia_visita'])}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SolicitudDocumentManager;