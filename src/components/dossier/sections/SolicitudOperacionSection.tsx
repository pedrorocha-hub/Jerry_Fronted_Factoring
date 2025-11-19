import React from 'react';
import { Building2, User, Shield, Star, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DossierRib } from '@/types/dossier';

interface SolicitudOperacionSectionProps {
  dossier: DossierRib;
}

const SolicitudOperacionSection: React.FC<SolicitudOperacionSectionProps> = ({ dossier }) => {
  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'PEN', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(num);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-PE');
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
        
        {/* Bloque Destacado: Producto y Modalidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:border-[#00FF80]/50 transition-colors">
            <span className="text-[#00FF80] text-xs font-bold uppercase tracking-wider mb-1">TIPO DE PRODUCTO</span>
            <span className="text-white text-xl font-semibold">{dossier.solicitudOperacion.tipo_producto || 'FACTORING'}</span>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">MODALIDAD</span>
            <span className="text-white text-xl font-semibold">{dossier.solicitudOperacion.tipo_operacion || 'PUNTUAL'}</span>
          </div>
        </div>

        {/* Información TOP 10K integrada */}
        {dossier.top10kData && (
          <div className="mb-8 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center mb-4">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              <h4 className="text-white font-medium">Información TOP 10K Perú</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-400">Sector</Label>
                <p className="text-white font-medium">{dossier.top10kData.sector || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Ranking 2024</Label>
                <p className="text-white font-mono text-lg font-bold text-yellow-400">#{dossier.top10kData.ranking_2024 || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Facturado 2024 (Máx)</Label>
                <p className="text-white font-mono font-medium">{formatCurrency(dossier.top10kData.facturado_2024_soles_maximo)}</p>
              </div>
              <div>
                <Label className="text-gray-400">Tamaño Empresa</Label>
                <p className="text-white font-medium">{dossier.top10kData.tamano || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* INFORMACIÓN BÁSICA DE LA EMPRESA */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
            <h4 className="text-white font-medium text-lg">Información Básica de la Empresa</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Empresa</Label>
                <p className="text-white font-medium">{dossier.fichaRuc?.nombre_empresa || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">RUC</Label>
                <p className="text-white font-mono">{dossier.solicitudOperacion.ruc}</p>
              </div>
              <div>
                <Label className="text-gray-400">Producto</Label>
                <p className="text-white">{dossier.solicitudOperacion.producto || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Proveedor</Label>
                <p className="text-white">{dossier.solicitudOperacion.proveedor || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Exposición Total</Label>
                <p className="text-white font-mono">{dossier.solicitudOperacion.exposicion_total || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Propuesta Comercial</Label>
                <p className="text-white">{dossier.solicitudOperacion.propuesta_comercial || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Riesgo Aprobado</Label>
                <p className="text-white">{dossier.solicitudOperacion.riesgo_aprobado || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Moneda</Label>
                <p className="text-white">{dossier.solicitudOperacion.moneda_operacion || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN DE LA SOLICITUD */}
        <div className="border-t border-gray-800 pt-6 mb-8">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            <h4 className="text-white font-medium text-lg">Información de la Solicitud</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">L/P</Label>
                <p className="text-white">{dossier.solicitudOperacion.lp || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">L/P Vigente GVE</Label>
                <p className="text-white">{dossier.solicitudOperacion.lp_vigente_gve || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Fianza</Label>
                <p className="text-white">{dossier.solicitudOperacion.fianza || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Tipo de Cambio</Label>
                <p className="text-white">{dossier.solicitudOperacion.tipo_cambio || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Fecha Ficha</Label>
                <p className="text-white">{formatDate(dossier.solicitudOperacion.fecha_ficha)}</p>
              </div>
              <div>
                <Label className="text-gray-400">Orden de Servicio</Label>
                <p className="text-white">{dossier.solicitudOperacion.orden_servicio || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Factura</Label>
                <p className="text-white">{dossier.solicitudOperacion.factura || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Resumen Solicitud</Label>
                <p className="text-white">{dossier.solicitudOperacion.resumen_solicitud || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN DEL DEUDOR */}
        <div className="border-t border-gray-800 pt-6 mb-8">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 mr-2 text-purple-400" />
            <h4 className="text-white font-medium text-lg">Información del Deudor</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Deudor</Label>
                <p className="text-white font-medium">{dossier.solicitudOperacion.deudor || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Dirección</Label>
                <p className="text-white">{dossier.solicitudOperacion.direccion || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Visita</Label>
                <p className="text-white">{dossier.solicitudOperacion.visita || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-gray-400">Contacto</Label>
                <p className="text-white">{dossier.solicitudOperacion.contacto || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* GARANTÍAS Y CONDICIONES */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2 text-green-400" />
            <h4 className="text-white font-medium text-lg">Garantías y Condiciones</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-400">Garantías</Label>
              <div className="mt-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <p className="text-white text-sm">{dossier.solicitudOperacion.garantias || 'No especificadas'}</p>
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Condiciones de Desembolso</Label>
              <div className="mt-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <p className="text-white text-sm">{dossier.solicitudOperacion.condiciones_desembolso || 'No especificadas'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COMENTARIOS */}
        {dossier.solicitudOperacion.comentarios && (
          <div className="border-t border-gray-800 pt-6 mb-6">
            <Label className="text-gray-400 text-lg font-medium">Comentarios</Label>
            <div className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <p className="text-white">{dossier.solicitudOperacion.comentarios}</p>
            </div>
          </div>
        )}
        
        {/* RIESGOS */}
        {dossier.riesgos.length > 0 && (
          <div className="border-t border-gray-800 pt-6">
            <Label className="text-gray-400 text-lg font-medium">Riesgos del Proveedor</Label>
            <div className="overflow-x-auto mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">L/P</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Producto</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-medium">Deudor</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Riesgo Aprobado</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-medium">Propuesta Comercial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dossier.riesgos.map((riesgo, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4 text-white">{riesgo.lp || 'N/A'}</td>
                      <td className="py-3 px-4 text-white">{riesgo.producto || 'N/A'}</td>
                      <td className="py-3 px-4 text-white">{riesgo.deudor || 'N/A'}</td>
                      <td className="py-3 px-4 text-right text-white font-mono">
                        {formatCurrency(riesgo.riesgo_aprobado)}
                      </td>
                      <td className="py-3 px-4 text-right text-white font-mono">
                        {formatCurrency(riesgo.propuesta_comercial)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

export default SolicitudOperacionSection;