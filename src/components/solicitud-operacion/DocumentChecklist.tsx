import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw, Brain, Paperclip, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TipoProducto } from '@/types/solicitud-operacion';
import { DOCUMENT_LABELS, PRODUCT_REQUIREMENTS, DocumentTypeKey } from '@/config/documentRequirements';
import { supabase } from '@/integrations/supabase/client';
import { DocumentoService } from '@/services/documentoService';
import { showSuccess, showError } from '@/utils/toast';
import { DocumentoTipo } from '@/types/documento';

interface DocumentChecklistProps {
  ruc: string;
  tipoProducto: TipoProducto | null;
  onValidationChange: (isValid: boolean) => void;
  solicitudId?: string;
  onDocumentUploaded?: () => void;
}

// Keys that MUST be processed by AI (Brain button)
const AI_PROCESS_KEYS: DocumentTypeKey[] = ['FICHA_RUC', 'SENTINEL', 'REPORTE_TRIBUTARIO', 'EEFF'];

// Keys that allow multiple file uploads
const ALLOW_MULTIPLE_UPLOADS: DocumentTypeKey[] = ['FACTURA', 'EVIDENCIA_VISITA', 'SUSTENTOS', 'VIGENCIA_PODER'];

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ 
  ruc, 
  tipoProducto,
  onValidationChange,
  solicitudId,
  onDocumentUploaded
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<DocumentTypeKey | null>(null);
  
  const activeUploadKeyRef = useRef<DocumentTypeKey | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [docStatus, setDocStatus] = useState<Record<DocumentTypeKey, boolean>>({
    FICHA_RUC: false,
    SENTINEL: false,
    REPORTE_TRIBUTARIO: false,
    FACTURA: false,
    EEFF: false,
    VIGENCIA_PODER: false,
    SUSTENTOS: false,
    EVIDENCIA_VISITA: false
  });

  // Función para verificar existencia de documentos
  const checkDocuments = async () => {
    if (!ruc || ruc.length !== 11) return;
    
    setLoading(true);
    try {
      // 1. Verificar documentos procesados (tablas específicas)
      const [ficha, sentinel, tributario, facturasTable, eeff] = await Promise.all([
        supabase.from('ficha_ruc').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('sentinel').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('reporte_tributario').select('id').eq('ruc', ruc).limit(1),
        supabase.from('factura_negociar').select('id').eq('ruc', ruc).limit(1),
        supabase.from('eeff').select('id').eq('ruc', ruc).limit(1)
      ]);

      // 2. Verificar archivos subidos en la tabla 'documentos' vinculados a la solicitud (si existe)
      let uploadedDocs: { tipo: string }[] = [];
      if (solicitudId) {
        const { data } = await supabase
          .from('documentos')
          .select('tipo')
          .eq('solicitud_id', solicitudId);
        uploadedDocs = data || [];
      } else {
        // Fallback: buscar por nombre de archivo que contenga el RUC si no hay solicitudId (menos preciso)
        const { data } = await supabase
          .from('documentos')
          .select('tipo')
          .ilike('nombre_archivo', `%${ruc}%`);
        uploadedDocs = data || [];
      }

      // Helpers para verificar si existe en 'documentos'
      const hasUploadedType = (t: DocumentoTipo) => uploadedDocs.some(d => d.tipo === t);
      const hasSustentos = hasUploadedType('sustentos');

      const newStatus = {
        FICHA_RUC: !!ficha.data,
        SENTINEL: !!sentinel.data,
        REPORTE_TRIBUTARIO: (tributario.data?.length || 0) > 0,
        // Factura OK si está en tabla procesada O si se subió el archivo
        FACTURA: (facturasTable.data?.length || 0) > 0 || hasUploadedType('factura_negociar'), 
        EEFF: (eeff.data?.length || 0) > 0,
        // VALIDACIÓN ESTRICTA: Solo marcar si existe el tipo específico
        VIGENCIA_PODER: hasUploadedType('vigencia_poder'), 
        SUSTENTOS: hasSustentos,
        EVIDENCIA_VISITA: hasUploadedType('evidencia_visita')
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
  }, [ruc, solicitudId]); // Agregamos solicitudId a las dependencias

  // Validar cumplimiento
  useEffect(() => {
    if (!tipoProducto) {
      onValidationChange(true); 
      return;
    }

    const reqs = PRODUCT_REQUIREMENTS[tipoProducto];
    const allRequiredMet = reqs.required.every(docType => docStatus[docType]);
    
    onValidationChange(allRequiredMet);
  }, [docStatus, tipoProducto, onValidationChange]);

  const handleDirectUploadClick = (key: DocumentTypeKey) => {
    activeUploadKeyRef.current = key;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = activeUploadKeyRef.current;
    
    if (!file || !key) return;
    
    setUploadingType(key);
    
    // Mapear la Key del Checklist al Tipo de Documento de la BD
    let tipo: DocumentoTipo = 'sustentos';
    switch (key) {
      case 'FACTURA':
        tipo = 'factura_negociar';
        break;
      case 'EVIDENCIA_VISITA':
        tipo = 'evidencia_visita';
        break;
      case 'VIGENCIA_PODER':
        tipo = 'vigencia_poder';
        break;
      default:
        tipo = 'sustentos';
    }

    try {
      await DocumentoService.uploadAndInsert(
        file, 
        tipo, 
        undefined, 
        false, 
        solicitudId // Vinculación directa
      );
      showSuccess('Documento adjuntado correctamente');
      
      // Actualizar estado local y notificar al padre
      await checkDocuments();
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (err: any) {
      console.error('Error subiendo documento:', err);
      showError(`Error al subir: ${err.message}`);
    } finally {
      setUploadingType(null);
      activeUploadKeyRef.current = null;
    }
  };

  if (!tipoProducto) {
    return (
      <Card className="bg-[#121212] border border-gray-800 opacity-50 h-full">
        <CardContent className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
          <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
          <p>Seleccione un Tipo de Producto para ver los requisitos documentarios.</p>
        </CardContent>
      </Card>
    );
  }

  const requirements = PRODUCT_REQUIREMENTS[tipoProducto];
  const missingCount = requirements.required.filter(k => !docStatus[k]).length;

  const renderItem = (key: DocumentTypeKey, isRequired: boolean) => {
    const exists = docStatus[key];
    const isUploadingThis = uploadingType === key;
    const isAIProcess = AI_PROCESS_KEYS.includes(key);
    const allowMultiple = ALLOW_MULTIPLE_UPLOADS.includes(key);
    
    return (
      <div key={key} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-800 mb-2 hover:bg-gray-900/50 transition-colors">
        <div className="flex items-center gap-3">
          {loading ? (
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
          {isAIProcess ? (
            /* Botón "Cerebro" (Procesar con IA) - Solo aparece si es FICHA_RUC, SENTINEL, etc. y NO existe */
            !exists && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 gap-2"
                onClick={() => window.open('/upload', '_blank')}
                disabled={!!uploadingType}
                title="Ir a procesar con IA"
              >
                <Brain className="h-3 w-3" />
                Procesar
              </Button>
            )
          ) : (
            /* Botón "Gancho" (Adjuntar Manualmente) - Aparece si no existe O si permite múltiples */
            (!exists || allowMultiple) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10 gap-2"
                onClick={() => handleDirectUploadClick(key)}
                disabled={!!uploadingType}
                title="Adjuntar evidencia"
              >
                {isUploadingThis ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Paperclip className="h-3 w-3" />
                )}
                {exists && allowMultiple ? 'Agregar otro' : 'Adjuntar'}
              </Button>
            )
          )}

          {exists && (
             <Badge variant="outline" className="bg-[#00FF80]/10 text-[#00FF80] border-[#00FF80]/20 text-[10px] px-1.5">
               OK
             </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className={`bg-[#121212] border transition-all ${missingCount > 0 ? 'border-red-500/20' : 'border-green-500/20'}`}>
        <CardHeader className="pb-3 border-b border-gray-800 bg-gray-900/20">
          <CardTitle className="text-base text-white flex justify-between items-center">
            <div className="flex flex-col">
              <span>Checklist Documentario</span>
              <span className={`text-xs font-normal ${missingCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {missingCount > 0 ? `${missingCount} documentos pendientes` : 'Documentación completa'}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={checkDocuments} disabled={loading} className="h-8 w-8">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
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
      
      {/* Input oculto para la subida directa */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.png,.jpeg,.xlsx,.xls,.doc,.docx"
        onChange={handleFileChange}
      />
    </>
  );
};

export default DocumentChecklist;