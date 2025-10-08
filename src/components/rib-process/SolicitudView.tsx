import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { FileText } from 'lucide-react';

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 text-sm">
    <p className="text-gray-400">{label}</p>
    <p className="col-span-2 text-white">{value || 'N/A'}</p>
  </div>
);

const SolicitudView: React.FC<{ data: SolicitudOperacion | null }> = ({ data }) => {
  if (!data) return <Card className="bg-[#121212] border-gray-800"><CardHeader><CardTitle>Solicitud de Operación</CardTitle></CardHeader><CardContent><p className="text-gray-500">No hay datos disponibles.</p></CardContent></Card>;

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
          1. Solicitud de Operación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow label="Proveedor" value={data.proveedor} />
        <InfoRow label="Deudor" value={data.deudor} />
        <InfoRow label="Fecha de Ficha" value={data.fecha_ficha ? new Date(data.fecha_ficha).toLocaleDateString('es-ES') : 'N/A'} />
        <InfoRow label="Moneda" value={data.moneda_operacion} />
        <InfoRow label="Tipo de Cambio" value={data.tipo_cambio} />
        <InfoRow label="Resumen" value={data.resumen_solicitud} />
        <InfoRow label="Garantías" value={data.garantias} />
        <InfoRow label="Condiciones de Desembolso" value={data.condiciones_desembolso} />
      </CardContent>
    </Card>
  );
};

export default SolicitudView;