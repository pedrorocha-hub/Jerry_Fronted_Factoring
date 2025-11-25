import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ExternalLink, RefreshCw, Briefcase, Scale, Image, FileText, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TipoProducto } from '@/types/solicitud-operacion';
import { DOCUMENT_LABELS, PRODUCT_REQUIREMENTS, DocumentTypeKey } from '@/config/documentRequirements';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

interface DocumentChecklistProps {
  ruc: string;
  solicitudId?: string;
  tipoProducto: TipoProducto | null;
  onValidationChange: (isValid: boolean) => void;
}

// Definición de grupos de evidencia
const EVIDENCE_GROUPS = {
  OPERACION: {
    label: 'Operación',
    icon: Briefcase,
    keys: ['FACTURA', 'SUSTENTOS'] as DocumentTypeKey[]
  },
  LEGAL: {
    label: 'Legal',
    icon: Scale,
    keys: ['VIGENCIA_PODER'] as DocumentTypeKey[]
  },
  VISITA: {
    label: 'Visita / Otros',
    icon: Image,
    keys: ['FOTOS_VISITA'] as DocumentTypeKey[]
  }
};

// Keys que pertenecen al grupo de Análisis Financiero / Riesgos (Lo que queda arriba)
const ANALYSIS_KEYS: DocumentTypeKey[] = ['FICHA_RUC', 'SENTINEL', 'REPORTE_TRIBUTARIO', 'EEFF'];

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ 
  ruc, 
  solicitudId,
  tipoProducto,
  onValidationChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [docStatus, setDocStatus] = useState<Record<DocumentTypeKey, boolean>>({
    FICHA_RUC: false,
    SENTINEL: false,
    REPORTE_TRIBUTARIO: false,
    FACTURA: false,
    EEFF: false,
    VIGENCIA_PODER: false,
    SUSTENTOS: false,
    FOTOS_VISITA: false
  });

  const checkDocuments = async () => {
    if (!ruc || ruc.length !== 11) return;
    
    setLoading(true);
    try {
      // 1. Tablas Estructuradas
      const [ficha, sentinel, tributario, facturasTabla, eeff] = await Promise.all([
        supabase.from('ficha_ruc').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('sentinel').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('reporte_tributario').select('id').eq('ruc', ruc).limit(1),
        supabase.from('factura_negociar').select('id').eq('ruc', ruc).limit(1),
        supabase.from('eeff').select('id').eq('ruc', ruc).limit(1)
      ]);

      // 2. Documentos Adjuntos (Tabla 'documentos')
      // Buscamos por RUC o por Solicitud ID si existe
      let query = supabase.from('documentos').select('tipo');
      
      if (solicitudId) {
        // Si hay solicitud, buscamos documentos asociados a la solicitud O al RUC
        query = query.or(`solicitud_id.eq.${solicitudId},ruc_extraido.eq.${ruc}`);
      } else {
        query = query.eq('ruc_extraido', ruc);
      }

      const { data: adjuntos } = await query;

      const tiposAdjuntos = new Set(adjuntos?.map(d => d.tipo) || []);

      const newStatus = {
        FICHA_RUC: !!ficha.data,
        SENTINEL: !!sentinel.data,
        REPORTE_TRIBUTARIO: (tributario.data?.length || 0) > 0,
        EEFF: (eeff.data?.length || 0) > 0,
        
        // Factura: Puede estar estructurada o como adjunto
        FACTURA: (facturasTabla.data?.length || 0) > 0 || tiposAdjuntos.has('factura'),
        
        // Documentos que suelen ser solo adjuntos
        VIGENCIA_PODER: tiposAdjuntos.has('vigencia_poder') || tiposAdjuntos.has('vigencia'),
        SUSTENTOS: tiposAdjuntos.has('sustento_comercial') || tiposAdjuntos.has('guia_remision') || tiposAdjuntos.has('orden_compra') || tiposAdjuntos.has('conformidad'),
        FOTOS_VISITA: tiposAdjuntos.has('foto_visita') || tiposAdjuntos.has('evidencia_visita')
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
  }, [ruc, solicitudId]);

  useEffect(() => {
    if (!tipoProducto) {
      onValidationChange(true); 
      return;
    }

    const reqs = PRODUCT_REQUIREMENTS[tipoProducto];
    const allRequiredMet = reqs.required.every(docType => docStatus[docType]);
    
    onValidationChange(allRequiredMet);
  }, [docStatus, tipoProducto, onValidationChange]);

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
    
    return (
      <div key={key} className="flex items-center justify-between p-2.5 bg-gray-900/30 rounded-md border border-gray-800/50 mb-2 hover:bg-gray-900/50 transition-colors group">
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
          ) : exists ? (
            <CheckCircle2 className="h-4 w-4 text-[#00FF80]" />
          ) : isRequired ? (
            <XCircle className="h-4 w-4 text-red-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500/30" />
          )}
          
          <div>
            <p className={`text-sm font-medium ${exists ? 'text-white' : 'text-gray-400'}`}>
              {DOCUMENT_LABELS[key]}
            </p>
            {!exists && (
              <p className={`text-[10px] ${isRequired ? 'text-red-400/70' : 'text-gray-600'}`}>
                {isRequired ? 'Requerido' : 'Opcional'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!exists && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-[10px] text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => window.open('/upload', '_blank')}
            >
              Subir
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
          {exists && (
             <Badge variant="outline" className="bg-[#00FF80]/5 text-[#00FF80] border-[#00FF80]/20 text-[10px] px-1.5 h-5">
               OK
             </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderEvidenceGroup = (groupKey: keyof typeof EVIDENCE_GROUPS) => {
    const group = EVIDENCE_GROUPS[groupKey];
    // Filtrar solo los documentos que son relevantes para este producto (están en required o optional)
    const relevantKeys = group.keys.filter(k => requirements.required.includes(k) || requirements.optional.includes(k));
    
    if (relevantKeys.length === 0) return null;

    return (
      <div key={groupKey} className="mb-4">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <group.icon className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">{group.label}</span>
        </div>
        <div className="space-y-1 ml-1">
          {relevantKeys.map(key => renderItem(key, requirements.required.includes(key)))}
        </div>
      </div>
    );
  };

  // Filtrar documentos de análisis
  const analysisDocs = ANALYSIS_KEYS.filter(k => requirements.required.includes(k) || requirements.optional.includes(k));

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
          <Button variant="ghost" size="icon" onClick={checkDocuments} disabled={loading} className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        
        {/* 1. SECCIÓN DE ANÁLISIS FINANCIERO Y RIESGOS */}
        {analysisDocs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-[#00FF80]">
              <FileText className="h-4 w-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Análisis & Riesgos</h3>
            </div>
            <div className="space-y-1">
              {analysisDocs.map(key => renderItem(key, requirements.required.includes(key)))}
            </div>
          </div>
        )}

        {/* SEPARADOR */}
        {(analysisDocs.length > 0) && <Separator className="bg-gray-800 mb-6" />}

        {/* 2. SECCIÓN DE EVIDENCIA */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Paperclip className="h-4 w-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Evidencia</h3>
          </div>
          
          <div className="pl-2 border-l border-gray-800 ml-1.5">
            {renderEvidenceGroup('OPERACION')}
            {renderEvidenceGroup('LEGAL')}
            {renderEvidenceGroup('VISITA')}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default DocumentChecklist;