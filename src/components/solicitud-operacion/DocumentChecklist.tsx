import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Upload, RefreshCw, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TipoProducto } from '@/types/solicitud-operacion';
import { DOCUMENT_LABELS, PRODUCT_REQUIREMENTS, DocumentTypeKey } from '@/config/documentRequirements';
import { supabase } from '@/integrations/supabase/client';
import { DocumentoService } from '@/services/documentoService';
import { DocumentoTipo } from '@/types/documento';
import { showSuccess, showError } from '@/utils/toast';

interface DocumentChecklistProps {
  ruc: string;
  tipoProducto: TipoProducto | null;
  onValidationChange: (isValid: boolean) => void;
  solicitudId?: string; // Nuevo prop opcional
}

// Mapeo entre las claves del checklist y los tipos de documentos en la BD/Storage
const CHECKLIST_TO_DOC_TYPE: Record<DocumentTypeKey, DocumentoTipo> = {
  FICHA_RUC: 'ficha_ruc',
  SENTINEL: 'sentinel',
  REPORTE_TRIBUTARIO: 'reporte_tributario',
  FACTURA: 'factura_negociar',
  EEFF: 'eeff',
  VIGENCIA_PODER: 'vigencia_poderes'
};

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ 
  ruc, 
  tipoProducto,
  onValidationChange,
  solicitudId
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<DocumentTypeKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocKey, setSelectedDocKey] = useState<DocumentTypeKey | null>(null);

  const [docStatus, setDocStatus] = useState<Record<DocumentTypeKey, boolean>>({
    FICHA_RUC: false,
    SENTINEL: false,
    REPORTE_TRIBUTARIO: false,
    FACTURA: false,
    EEFF: false,
    VIGENCIA_PODER: false
  });

  // Función para verificar existencia de documentos (Tabla de Datos + Tabla Documentos)
  const checkDocuments = async () => {
    if (!ruc || ruc.length !== 11) return;
    
    setLoading(true);
    try {
      // 1. Consultamos las tablas de datos procesados (tablas específicas)
      const [ficha, sentinel, tributario, facturasData, eeff] = await Promise.all([
        supabase.from('ficha_ruc').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('sentinel').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('reporte_tributario').select('id').eq('ruc', ruc).limit(1),
        supabase.from('factura_negociar').select('id').eq('ruc', ruc).limit(1),
        supabase.from('eeff').select('id').eq('ruc', ruc).limit(1)
      ]);

      // 2. Consultamos la tabla de 'documentos' (archivos adjuntos)
      // Buscamos por RUC O por SolicitudID si existe
      let docQuery = supabase.from('documentos').select('tipo');
      
      if (solicitudId) {
        docQuery = docQuery.or(`ruc_extraido.eq.${ruc},solicitud_id.eq.${solicitudId}`);
      } else {
        docQuery = docQuery.eq('ruc_extraido', ruc);
      }
      
      const { data: uploadedDocs } = await docQuery;
      
      // Helper para saber si existe el archivo físico
      const hasUploadedDoc = (key: DocumentTypeKey) => {
        const mappedType = CHECKLIST_TO_DOC_TYPE[key];
        return uploadedDocs?.some(d => d.tipo === mappedType);
      };

      // El estado es TRUE si existe el dato procesado O si existe el archivo subido
      const newStatus = {
        FICHA_RUC: !!ficha.data || hasUploadedDoc('FICHA_RUC'),
        SENTINEL: !!sentinel.data || hasUploadedDoc('SENTINEL'),
        REPORTE_TRIBUTARIO: (tributario.data?.length || 0) > 0 || hasUploadedDoc('REPORTE_TRIBUTARIO'),
        FACTURA: (facturasData.data?.length || 0) > 0 || hasUploadedDoc('FACTURA'),
        EEFF: (eeff.data?.length || 0) > 0 || hasUploadedDoc('EEFF'),
        VIGENCIA_PODER: hasUploadedDoc('VIGENCIA_PODER') // Este solo depende del archivo
      };

      setDocStatus(newStatus);
    } catch (error) {
      console.error("Error verificando documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDocuments();
  }, [ruc, solicitudId]); // Re-verificar si cambia el RUC o el ID

  // Validar cumplimiento y notificar al padre
  useEffect(() => {
    if (!tipoProducto) {
      onValidationChange(true); 
      return;
    }

    const reqs = PRODUCT_REQUIREMENTS[tipoProducto];
    const allRequiredMet = reqs.required.every(docType => docStatus[docType]);
    onValidationChange(allRequiredMet);
  }, [docStatus, tipoProducto, onValidationChange]);

  // Manejador de click en "Subir"
  const handleUploadClick = (key: DocumentTypeKey) => {
    if (!solicitudId) {
      showError("Debe guardar la solicitud antes de subir documentos.");
      return;
    }
    setSelectedDocKey(key);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset
      fileInputRef.current.click();
    }
  };

  // Manejador de cambio en el input file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocKey || !solicitudId) return;

    setUploadingKey(selectedDocKey);
    try {
      const docType = CHECKLIST_TO_DOC_TYPE[selectedDocKey];
      
      // 1. Subir usando el servicio
      const doc = await DocumentoService.uploadAndInsert(file, docType, undefined, false);

      // 2. Vincular explícitamente a la solicitud y asegurar el RUC
      const { error } = await supabase
        .from('documentos')
        .update({ 
          solicitud_id: solicitudId,
          ruc_extraido: ruc, // Aseguramos que quede vinculado al RUC también para el RIB
          estado: 'completed' // Lo marcamos como listo
        })
        .eq('id', doc.id);

      if (error) throw error;

      showSuccess(`Documento subido correctamente`);
      
      // 3. Actualizar estado local
      await checkDocuments();

    } catch (err: any) {
      console.error("Error subiendo:", err);
      showError(`Error al subir: ${err.message}`);
    } finally {
      setUploadingKey(null);
      setSelectedDocKey(null);
    }
  };

  // Renderizado si no hay producto
  if (!tipoProducto) {
    return (
      <Card className="bg-[#121212] border border-gray-800 opacity-50 h-full">
        <CardContent className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
          <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
          <p>Seleccione un Tipo de Producto para ver los requisitos.</p>
        </CardContent>
      </Card>
    );
  }

  const requirements = PRODUCT_REQUIREMENTS[tipoProducto];
  const missingCount = requirements.required.filter(k => !docStatus[k]).length;

  const renderItem = (key: DocumentTypeKey, isRequired: boolean) => {
    const exists = docStatus[key];
    const isUploading = uploadingKey === key;
    
    return (
      <div key={key} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-800 mb-2 hover:bg-gray-900/50 transition-colors">
        <div className="flex items-center gap-3">
          {loading || isUploading ? (
            <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
          ) : exists ? (
            <CheckCircle2 className="h-5 w-5 text-[#00FF80]" />
          ) : isRequired ? (
            <XCircle className="h-5 w-5 text-red-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-500/50" />
          )}
          
          <div>
            <p className={`text-sm font-medium ${exists ? 'text-white' : 'text-gray-400'}`}>
              {DOCUMENT_LABELS[key]}
            </p>
            {!exists && (
              <p className={`text-[10px] ${isRequired ? 'text-red-400/80' : 'text-gray-600'}`}>
                {isRequired ? 'IMPRESCINDIBLE' : 'Adicional / Opcional'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!exists && !isUploading && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10 gap-1"
              onClick={() => handleUploadClick(key)}
              disabled={!solicitudId} // Deshabilitado si no se ha creado el ID
              title={!solicitudId ? "Guarde la solicitud primero" : "Subir archivo"}
            >
              <Upload className="h-3 w-3" />
              Subir
            </Button>
          )}
          {isUploading && <span className="text-xs text-gray-500">Subiendo...</span>}
          
          {exists && (
             <div className="flex items-center gap-2">
               <Badge variant="outline" className="bg-[#00FF80]/10 text-[#00FF80] border-[#00FF80]/20 text-[10px] px-1.5">
                 OK
               </Badge>
               {/* Opcional: Botón para re-subir si se desea */}
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-500 hover:text-white"
                  onClick={() => handleUploadClick(key)}
                  title="Actualizar archivo"
                >
                  <RefreshCw className="h-3 w-3" />
               </Button>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`bg-[#121212] border transition-all ${missingCount > 0 ? 'border-red-500/20' : 'border-green-500/20'}`}>
      <CardHeader className="pb-3 border-b border-gray-800 bg-gray-900/20">
        <CardTitle className="text-base text-white flex justify-between items-center">
          <div className="flex flex-col">
            <span>Checklist Documentario</span>
            <span className={`text-xs font-normal ${missingCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {missingCount > 0 ? `${missingCount} documentos pendientes` : 'Documentación completa'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={checkDocuments} disabled={loading} className="h-8 w-8 text-gray-400 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Input oculto para carga de archivos */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls"
          onChange={handleFileChange}
        />

        <div className="space-y-1">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
              Imprescindibles ({tipoProducto})
            </p>
            {requirements.required.map(doc => renderItem(doc, true))}
          </div>
          
          {requirements.optional.length > 0 && (
            <div>
               <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center">
                 <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2"></span>
                 Adicionales
               </p>
               {requirements.optional.map(doc => renderItem(doc, false))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentChecklist;