import React from 'react';
import { DossierRib } from '@/types/dossier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Building2, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ComportamientoCrediticioSectionProps {
  dossier: DossierRib;
}

const ComportamientoCrediticioSection: React.FC<ComportamientoCrediticioSectionProps> = ({ dossier }) => {
  const data = dossier.comportamientoCrediticio;

  if (!data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-800/50 p-4 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-1">Sin información crediticia</h3>
        <p className="text-gray-400 max-w-sm">
          No se encontraron datos de comportamiento crediticio cargados para este expediente.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number | string | null | undefined, currency: string = 'PEN') => {
    if (amount === null || amount === undefined || amount === '') return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0.00';
    
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: currency 
    }).format(num);
  };

  const InfoRow = ({ label, equifax, sentinel, isCurrency = false }: { label: string, equifax: any, sentinel: any, isCurrency?: boolean }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-800 last:border-0 items-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-white font-medium text-right">
        {isCurrency ? formatCurrency(equifax) : (equifax || '-')}
      </span>
      <span className="text-white font-medium text-right">
        {isCurrency ? formatCurrency(sentinel) : (sentinel || '-')}
      </span>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proveedor / Cliente */}
        <Card className="bg-gray-900/30 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#00FF80]" />
              Análisis del Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-3 gap-4 mb-2 pb-2 border-b border-gray-700 font-semibold text-xs text-gray-500 uppercase">
                <div>Concepto</div>
                <div className="text-right text-blue-400">Equifax</div>
                <div className="text-right text-green-400">Sentinel</div>
             </div>
             
             <InfoRow label="Score" equifax={data.equifax_score} sentinel={data.sentinel_score} />
             <InfoRow label="Calificación" equifax={data.equifax_calificacion} sentinel={data.sentinel_calificacion} />
             <InfoRow label="Deuda Directa" equifax={data.equifax_deuda_directa} sentinel={data.sentinel_deuda_directa} isCurrency />
             <InfoRow label="Deuda Indirecta" equifax={data.equifax_deuda_indirecta} sentinel={data.sentinel_deuda_indirecta} isCurrency />
             <InfoRow label="Deuda SUNAT" equifax={data.equifax_deuda_sunat} sentinel={data.sentinel_deuda_sunat} isCurrency />
             <InfoRow label="Impagos" equifax={data.equifax_impagos} sentinel={data.sentinel_impagos} isCurrency />
             <InfoRow label="Protestos" equifax={data.equifax_protestos} sentinel={data.sentinel_protestos} isCurrency />
          </CardContent>
        </Card>

        {/* Deudor (si existe) */}
        {data.deudor && (
          <Card className="bg-gray-900/30 border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                Análisis del Deudor: {data.deudor}
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-3 gap-4 mb-2 pb-2 border-b border-gray-700 font-semibold text-xs text-gray-500 uppercase">
                  <div>Concepto</div>
                  <div className="text-right text-blue-400">Equifax</div>
                  <div className="text-right text-green-400">Sentinel</div>
               </div>
               
               <InfoRow label="Score" equifax={data.deudor_equifax_score} sentinel={data.deudor_sentinel_score} />
               <InfoRow label="Calificación" equifax={data.deudor_equifax_calificacion} sentinel={data.deudor_sentinel_calificacion} />
               <InfoRow label="Deuda Directa" equifax={data.deudor_equifax_deuda_directa} sentinel={data.deudor_sentinel_deuda_directa} isCurrency />
               <InfoRow label="Deuda Indirecta" equifax={data.deudor_equifax_deuda_indirecta} sentinel={data.deudor_sentinel_deuda_indirecta} isCurrency />
               <InfoRow label="Deuda SUNAT" equifax={data.deudor_equifax_deuda_sunat} sentinel={data.deudor_sentinel_deuda_sunat} isCurrency />
               <InfoRow label="Impagos" equifax={data.deudor_equifax_impagos} sentinel={data.deudor_sentinel_impagos} isCurrency />
               <InfoRow label="Protestos" equifax={data.deudor_equifax_protestos} sentinel={data.deudor_sentinel_protestos} isCurrency />
            </CardContent>
          </Card>
        )}
      </div>

      {/* APEFAC y Comentarios */}
      <div className="grid grid-cols-1 gap-6">
        {data.apefac_descripcion && (
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Reporte APEFAC
            </h4>
            <p className="text-gray-300 text-sm">{data.apefac_descripcion}</p>
          </div>
        )}

        {data.comentarios && (
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Comentarios del Analista
            </h4>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{data.comentarios}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Badge variant="outline" className={`
          ${data.status === 'Completado' ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'}
        `}>
          Estado: {data.status || 'Borrador'}
        </Badge>
      </div>
    </div>
  );
};

export default ComportamientoCrediticioSection;