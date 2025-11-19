import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TipoProducto } from '@/types/solicitud-operacion';
import { DOCUMENT_LABELS, PRODUCT_REQUIREMENTS, DocumentTypeKey } from '@/config/documentRequirements';
import { supabase } from '@/integrations/supabase/client';

interface DocumentChecklistProps {
  ruc: string;
  tipoProducto: TipoProducto | null;
  onValidationChange: (isValid: boolean) => void;
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ 
  ruc, 
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
    VIGENCIA_PODER: false
  });

  // Función para verificar existencia de documentos en BD
  const checkDocuments = async () => {
    if (!ruc || ruc.length !== 11) return;
    
    setLoading(true);
    try {
      // Ejecutar consultas en paralelo para mayor velocidad
      const [ficha, sentinel, tributario, facturas, eeff] = await Promise.all([
        supabase.from('ficha_ruc').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('sentinel').select('id').eq('ruc', ruc).maybeSingle(),
        supabase.from('reporte_tributario').select('id').eq('ruc', ruc).limit(1),
        supabase.from('factura_negociar').select('id').eq('ruc', ruc).limit(1),
        supabase.from('eeff').select('id').eq('ruc', ruc).limit(1)
      ]);

      const newStatus = {
        FICHA_RUC: !!ficha.data,
        SENTINEL: !!sentinel.data,
        REPORTE_TRIBUTARIO: (tributario.data?.length || 0) > 0,
        FACTURA: (facturas.data?.length || 0) > 0,
        EEFF: (eeff.data?.length || 0) > 0,
        VIGENCIA_PODER: false // TODO: Implementar tabla de vigencia o lógica específica
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
      onValidationChange(true); // Si no hay producto seleccionado, no bloqueamos técnicamente
      return;
    }

    const reqs = PRODUCT_REQUIREMENTS[tipoProducto];
    const allRequiredMet = reqs.required.every(docType => docStatus[docType]);
    onValidationChange(allRequiredMet);
  }, [docStatus, tipoProducto, onValidationChange]);

  if (!tipoProducto) {
    return (
      <Card className="bg-[#121212] border border-gray-800 opacity-50">
        <CardContent className="p-6 text-center text-gray-500">
          Seleccione un Tipo de Producto para ver los requisitos documentarios.
        </CardContent>
      </Card>
    );
  }

  const requirements = PRODUCT_REQUIREMENTS[tipoProducto];

  const renderItem = (key: DocumentTypeKey, isRequired: boolean) => {
    const exists = docStatus[key];
    
    return (
      <div key={key} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-800 mb-2">
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
              <p className="text-xs text-gray-500">
                {isRequired ? 'Requerido para avanzar' : 'Opcional'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!exists && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10"
              onClick={() => window.open('/upload', '_blank')}
            >
              Subir
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
          {exists && (
             <Badge variant="outline" className="bg-[#00FF80]/10 text-[#00FF80] border-[#00FF80]/20 text-[10px]">
               DETECTADO
             </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white flex justify-between items-center">
          <span>Checklist Documentario ({requirements.required.filter(k => docStatus[k]).length}/{requirements.required.length})</span>
          <Button variant="ghost" size="sm" onClick={checkDocuments} disabled={loading}>
            <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Documentos Obligatorios</p>
          {requirements.required.map(doc => renderItem(doc, true))}
          
          {requirements.optional.length > 0 && (
            <>
               <p className="text-xs font-semibold text-gray-500 mt-4 mb-2 uppercase tracking-wider">Adicionales</p>
               {requirements.optional.map(doc => renderItem(doc, false))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentChecklist;