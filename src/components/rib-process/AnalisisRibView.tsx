import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Rib } from '@/types/rib';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const InfoRow: React.FC<{ label: string; value?: string | number | null; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div className="grid grid-cols-3 gap-4 text-sm">
    <p className="text-gray-400">{label}</p>
    <div className="col-span-2 text-white break-words">
      {children || value || 'N/A'}
    </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="RUC" value={data.ruc} />
          <InfoRow label="Estado">
            <Badge variant={data.status === 'Validado' ? 'default' : 'secondary'}>{data.status}</Badge>
          </InfoRow>
          <InfoRow label="Dirección" value={data.direccion} />
          <InfoRow label="Teléfono" value={data.telefono} />
          <InfoRow label="Grupo Económico" value={data.grupo_economico} />
          <InfoRow label="Inicio de Actividades" value={data.inicio_actividades ? new Date(data.inicio_actividades).toLocaleDateString('es-ES') : 'N/A'} />
          <InfoRow label="¿Cómo llegó a LCP?" value={data.como_llego_lcp} />
          <InfoRow label="Visita" value={data.visita} />
          <InfoRow label="Validado por" value={data.validado_por} />
        </div>
        <div className="pt-4 border-t border-gray-800">
          <InfoRow label="Descripción de la Empresa" value={data.descripcion_empresa} />
        </div>
        <div className="pt-4 border-t border-gray-800">
          <InfoRow label="Relación Comercial con Deudor" value={data.relacion_comercial_deudor} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalisisRibView;