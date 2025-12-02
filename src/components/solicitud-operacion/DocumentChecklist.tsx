import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw, Brain, Paperclip } from 'lucide-react';
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
}

// Keys for which the "Subir" button should be hidden (handled in Operation tab)
const HIDDEN_UPLOAD_KEYS: DocumentTypeKey[] = [];

// Keys that MUST be processed by AI (Brain button)
const AI_PROCESS_KEYS: DocumentTypeKey[] = ['FICHA_RUC', 'SENTINEL', 'REPORTE_TRIBUTARIO', 'EEFF'];

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ 
  ruc, 
  tipoProducto,
  onValidationChange,
  solicitudId
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<DocumentTypeKey | null>(null);
  
  // Usamos una referencia para saber qué documento se intentó subir sin renderizar/bloquear UI antes de tiempo
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

  // Función para verificar existencia de documentos en BD
  const checkDocuments = async () => {
    if (!ruc || ruc.length !== 11) return;
    
    setLoading(true);
    try {
      // Consultamos las tablas procesadas para ver si existe información para este RUC
      const [ficha, sentinel, tributario, facturas, eeff] = await Promise.all([
        supabase.from('ficha_ruc').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('sentinel').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('reporte_tributario').select('id').eq('ruc', ruc).limit(1),
        supabase.from('factura_negociar').select('id').eq('ruc', ruc).limit(1),
        supabase.from('eeff').select('id').eq('ruc', ruc).limit(1)
      ]);

      // Para documentos que no tienen tabla propia procesada o pueden estar solo como archivo
      // Buscamos cualquier documento vinculado a esta solicitud O que coincida por nombre/tipo si es histórico
      // Pero para el checklist actual, lo más importante es si existe la evidencia.
      
      // Consultas específicas para evidencias
      const [sustentosDoc, vigenciaDoc, evidenciaDoc, facturaDoc] = await Promise.all([
        supabase.from('documentos').select('id').eq('tipo', 'sustentos').ilike('nombre_archivo', `%${ruc}%`).limit(1),
        supabase.from('documentos').select('id').eq('tipo', 'vigencia_poder').ilike('nombre_archivo', `%${ruc}%`).limit(1),
        supabase.from('documentos').select('id').eq('tipo', 'evidencia_visita').ilike('nombre_archivo', `%${ruc}%`).limit(1),
        supabase.from('documentos').select('id').eq('tipo', 'factura_negociar').ilike('nombre_archivo', `%${ruc}%`).limit(1)
      ]);

      const newStatus = {
        FICHA_RUC: !!ficha.data,
        SENTINEL: !!sentinel.data,
        REPORTE_TRIBUTARIO: (tributario.data?.length || 0) > 0,
        // La factura cuenta si está procesada en factura_negociar O si existe el archivo en documentos
        FACTURA: (facturas.data?.length || 0) > 0 || (facturaDoc.data?.length || 0) > 0,
        EEFF: (eeff.data?.length || 0) > 0,
        VIGENCIA_PODER: (vigenciaDoc.data?.length || 0) > 0,
        SUSTENTOS: (sustentosDoc.data?.length || 0) > 0,
        EVIDENCIA_VISITA: (evidenciaDoc.data?.length || 0) > 0
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
  }, [ruc]);

  // Validar cumplimiento de requisitos y notificar al padre
  useEffect(() => {
    if (!tipoProducto) {
      onValidationChange(true); 
      return;
    }

    const reqs = PRODUCT_REQUIREMENTS[tipoProducto];
    const allRequiredMet = reqs.required.every(docType => docStatus[docType]);
    
    // Notificamos al componente padre si cumple los requisitos
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
    
    // Mapeo de tipos
    const tipoMap: Record<string, DocumentoTipo> = {
      'FICHA_RUC': 'ficha_ruc',
      'SENTINEL': 'sentinel',
      'REPORTE_TRIBUTARIO': 'reporte_tributario',
      'FACTURA': 'factura_negociar',
      'EEFF': 'eeff',
      'VIGENCIA_PODER': 'vigencia_poder',
      'SUSTENTOS': 'sustentos',
      'EVIDENCIA_VISITA': 'evidencia_visita'
    };
    
    // Si bien usamos tipos específicos, el usuario pidió que funcione "igual que el Label"
    // El Label sube todo como 'sustentos'.
    // Sin embargo, para mantener el checklist verde, es mejor usar el tipo específico si existe,
    // pero asegurando que se pase el solicitudId para que sea una "evidencia" y no dispare IA.
    // Todos estos tipos (factura, sustentos, vigencia, evidencia_visita) son considerados "sustentos"
    // en la lógica de negocio si tienen solicitudId.
    
    const tipo = tipoMap[key] || 'sustentos';

    try {
      // Subida directa vinculada a la solicitudId (evita webhook de IA)
      // Esta es la misma lógica que usa SolicitudDocumentManager
      await DocumentoService.uploadAndInsert(
        file, 
        tipo, 
        undefined, 
        false, 
        solicitudId 
      );
      showSuccess('Evidencia adjuntada correctamente');
      setTimeout(checkDocuments, 1000); 
    } catch (err: any) {
      console.error('Error subiendo evidencia:', err);
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
          {!exists && !HIDDEN_UPLOAD_KEYS.includes(key) && (
            <>
              {/* Botón para Documentos de IA (Redirige a /upload) */}
              {isAIProcess && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 gap-2"
                  onClick={() => window.open('/upload', '_blank')}
                  disabled={!!uploadingType}
                  title="Ir a procesar con IA"
                >
                  <Brain className="h-3 w-3" />
                  Subir
                </Button>
              )}

              {/* Botón para Evidencias (Subida directa - Ganchito) */}
              {!isAIProcess && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10 gap-2"
                  onClick={() => handleDirectUploadClick(key)}
                  disabled={!!uploadingType}
                  title="Adjuntar evidencia (sin procesar)"
                >
                  {isUploadingThis ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Paperclip className="h-3 w-3" />
                  )}
                  Subir
                </Button>
              )}
            </>
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