import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { FileText } from 'lucide-react';

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 text-sm">
    <p className="text-gray-400">{label}</p>
    <p className="col-span-2 text-white break-words">{value || 'N/A'}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Proveedor" value={data.proveedor} />
          <InfoRow label="Deudor" value={data.deudor} />
          <InfoRow label="Fecha de Ficha" value={data.fecha_ficha ? new Date(data.fecha_ficha).toLocaleDateString('es-ES') : 'N/A'} />
          <InfoRow label="Moneda" value={data.moneda_operacion} />
          <InfoRow label="Tipo de Cambio" value={data.tipo_cambio} />
          <InfoRow label="Producto" value={data.producto} />
          <InfoRow label="LP" value={data.lp} />
          <InfoRow label="LP Vigente GVE" value={data.lp_vigente_gve} />
          <InfoRow label="Riesgo Aprobado" value={data.riesgo_aprobado} />
          <InfoRow label="Propuesta Comercial" value={data.propuesta_comercial} />
          <InfoRow label="Exposición Total" value={data.exposicion_total} />
          <InfoRow label="Orden de Servicio" value={data.orden_servicio} />
          <InfoRow label="Factura" value={data.factura} />
          <InfoRow label="Dirección" value={data.direccion} />
          <InfoRow label="Visita" value={data.visita} />
          <InfoRow label="Contacto" value={data.contacto} />
          <InfoRow label="Fianza" value={data.fianza} />
        </div>
        <div className="pt-4 border-t border-gray-800">
          <InfoRow label="Resumen de la Solicitud" value={data.resumen_solicitud} />
        </div>
        <div className="pt-4 border-t border-gray-800">
          <InfoRow label="Garantías" value={data.garantias} />
        </div>
        <div className="pt-4 border-t border-gray-800">
          <InfoRow label="Condiciones de Desembolso" value={data.condiciones_desembolso} />
        </div>
        <div className="pt-4 border-t border-gray-800">
          <InfoRow label="Comentarios" value={data.comentarios} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SolicitudView;