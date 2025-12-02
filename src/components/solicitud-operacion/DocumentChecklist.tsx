import React, { useState } from 'react';
import { Check, Upload, AlertCircle, FileText, Loader2, Paperclip, ChevronRight, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DocumentoService } from '@/services/documentoService';
import { showSuccess, showError } from '@/utils/toast';

interface DocumentChecklistProps {
  solicitudId: string;
  checklist: Record<string, boolean>;
  onUpload: (type: string, file: File) => Promise<void>;
  readonly?: boolean;
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  solicitudId,
  checklist,
  onUpload,
  readonly = false
}) => {
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const items = [
    { key: 'factura_negociar', label: 'Factura a Negociar', required: true, ai: true },
    { key: 'orden_servicio', label: 'Orden de Servicio / Compra', required: false, ai: true }, // Opcional
    { key: 'conformidad_servicio', label: 'Conformidad de Servicio', required: false, ai: false }, // Opcional
    { key: 'detraccion', label: 'Constancia de Detracción', required: false, ai: false }, // Opcional
    { key: 'evidencia_correo', label: 'Evidencia de Correo', required: false, ai: false }, // Opcional
    { key: 'ficha_ruc', label: 'Ficha RUC', required: true, ai: true },
    { key: 'vigencia_poder', label: 'Vigencia de Poder', required: true, ai: false },
    { key: 'reporte_tributario', label: 'Reporte Tributario', required: true, ai: true },
    { key: 'declaracion_jurada', label: 'Declaración Jurada (EEFF)', required: true, ai: true },
    { key: 'sentinel', label: 'Reporte Sentinel', required: false, ai: true }, // Opcional
    { key: 'dni_representante', label: 'DNI Representantes', required: true, ai: false },
  ];

  const handleDirectUploadClick = (key: string) => {
    if (readonly) return;
    const inputId = `file-upload-${key}`;
    document.getElementById(inputId)?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resetear el input para permitir subir el mismo archivo nuevamente si es necesario
    e.target.value = '';

    setUploadingType(key);
    try {
      // Lógica de subida directa (sin IA)
      // REPLICANDO EXACTAMENTE LA LÓGICA DE SOLICITUDDOCUMENTMANAGER:
      // Usamos 'sustentos' como tipo unificado y pasamos el solicitudId.
      await DocumentoService.uploadAndInsert(
        file,
        'sustentos', // Forzamos 'sustentos' igual que en el Manager
        undefined,
        false,
        solicitudId // Vinculación crítica
      );
      
      // Notificamos al padre para actualizar el estado visual, aunque el documento ya se subió
      await onUpload(key, file);
      
      showSuccess(`Documento para ${items.find(i => i.key === key)?.label} subido correctamente.`);
    } catch (error: any) {
      console.error('Error uploading:', error);
      showError(`Error al subir documento: ${error.message}`);
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardContent className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#00FF80]" />
          Requisitos Documentarios
        </h3>
        
        <div className="space-y-1">
          {items.map(({ key, label, required, ai }) => {
            const isUploaded = checklist[key];
            const isUploadingThis = uploadingType === key;
            const isAIProcess = ai && !isUploaded; // Solo mostrar badge AI si no está subido

            return (
              <div 
                key={key}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md border transition-all text-xs",
                  isUploaded 
                    ? "bg-[#00FF80]/5 border-[#00FF80]/20" 
                    : "bg-gray-900/30 border-gray-800 hover:border-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center border transition-colors",
                    isUploaded
                      ? "bg-[#00FF80] border-[#00FF80] text-black"
                      : "border-gray-600 text-transparent"
                  )}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-medium",
                      isUploaded ? "text-gray-200" : "text-gray-400"
                    )}>
                      {label}
                    </span>
                    <div className="flex gap-2 text-[10px]">
                      {required && !isUploaded && (
                        <span className="text-orange-500 font-medium">Requerido</span>
                      )}
                      {!required && !isUploaded && (
                        <span className="text-gray-600">Opcional</span>
                      )}
                      {ai && !isUploaded && (
                        <span className="text-blue-500/70 flex items-center gap-1">
                          <Brain className="h-2 w-2" />
                          IA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id={`file-upload-${key}`}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, key)}
                    disabled={!!uploadingType || readonly}
                    accept=".pdf,.jpg,.jpeg,.png,.xml,.xlsx,.xls"
                  />

                  {/* Botón para Evidencias (Subida directa - Ganchito) */}
                  {/* Este botón ahora usa la lógica unificada de 'sustentos' */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2 text-xs text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10 gap-2"
                    onClick={() => handleDirectUploadClick(key)}
                    disabled={!!uploadingType || readonly}
                    title="Adjuntar evidencia (sin procesar)"
                  >
                    {isUploadingThis ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Paperclip className="h-3 w-3" />
                    )}
                    Adjuntar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentChecklist;