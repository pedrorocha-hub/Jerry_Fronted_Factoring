import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rib } from '@/types/rib';
import { ShieldCheck } from 'lucide-react';

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 text-sm">
    <p className="text-gray-400">{label}</p>
    <p className="col-span-2 text-white">{value || 'N/A'}</p>
  </div>
);

const AnalisisRibView: React.FC<{ data: Rib | null }> = ({ data }) => {
  if (!data) return <Card className="bg-[#121212] border-gray-800"><CardHeader><CardTitle>Análisis RIB</CardTitle></CardHeader><CardContent><p className="text-gray-500">No hay datos disponibles.</p></CardContent></Card>;

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <ShieldCheck className="h-5 w-5 mr-2 text-[#00FF80]" />
          2. Análisis RIB
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow label="Dirección" value={data.direccion} />
        <InfoRow label="Teléfono" value={data.telefono} />
        <InfoRow label="Grupo Económico" value={data.grupo_economico} />
        <InfoRow label="¿Cómo llegó a LCP?" value={data.como_llego_lcp} />
        <InfoRow label="Visita" value={data.visita} />
        <InfoRow label="Descripción de la Empresa" value={data.descripcion_empresa} />
        <InfoRow label="Relación Comercial con Deudor" value={data.relacion_comercial_deudor} />
      </CardContent>
    </Card>
  );
};

export default AnalisisRibView;