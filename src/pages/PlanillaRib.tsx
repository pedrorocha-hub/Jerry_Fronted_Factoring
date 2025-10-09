import React, { useState } from 'react';
import { Search, FileText, Download, Building2, Loader2, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface RiesgoData {
  lp: string;
  producto: string;
  deudor: string;
  lp_vigente_gve: string;
  riesgo_aprobado: number | null;
  propuesta_comercial: number | null;
}

interface Top10kData {
  descripcion_ciiu_rev3: string | null;
  sector: string | null;
  ranking_2024: number | null;
  facturado_2024_soles_maximo: number | null;
  facturado_2023_soles_maximo: string | null;
}

interface RibData {
  id: string;
  ruc: string;
  direccion: string | null;
  como_llego_lcp: string | null;
  telefono: string | null;
  grupo_economico: string | null;
  visita: string | null;
  status: string;
  descripcion_empresa: string | null;
  inicio_actividades: string | null;
  relacion_comercial_deudor: string | null;
  validado_por: string | null;
  created_at: string;
  updated_at: string;
}

const PlanillaRibPage = () => {
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solicitud, setSolicitud] = useState<SolicitudOperacion | null>(null);
  const [fichaRuc, setFichaRuc] = useState<any>(null);
  const [riesgos, setRiesgos] = useState<RiesgoData[]>([]);
  const [top10kData, setTop10kData] = useState<Top10kData | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<{ fullName: string; email: string } | null>(null);
  const [ribData, setRibData] = useState<RibData | null>(null);

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }

    setSearching(true);
    setError(null);
    setSolicitud(null);
    setFichaRuc(null);
    setRiesgos([]);
    setTop10kData(null);
    setCreatorInfo(null);
    setRibData(null);

    try {
      // Buscar solicitud de operación
      const solicitudes = await SolicitudOperacionService.getByRuc(rucInput);
      if (!solicitudes || solicitudes.length === 0) {
        setError('No se encontró ninguna solicitud de operación para este RUC.');
        return;
      }

      const solicitudData = solicitudes[0]; // Tomar la primera solicitud
      setSolicitud(solicitudData);

      // Buscar ficha RUC
      const fichaData = await FichaRucService.getByRuc(rucInput);
      setFichaRuc(fichaData);

      // Buscar datos de riesgo
      const { data: riesgosData, error: riesgosError } = await supabase
        .from('solicitud_operacion_riesgos')
        .select('*')
        .eq('solicitud_id', solicitudData.id);

      if (riesgosError) {
        console.error('Error cargando riesgos:', riesgosError);
      } else if (riesgosData && riesgosData.length > 0) {
        setRiesgos(riesgosData.map(r => ({
          lp: r.lp || '',
          producto: r.producto || '',
          deudor: r.deudor || '',
          lp_vigente_gve: r.lp_vigente_gve || '',
          riesgo_aprobado: r.riesgo_aprobado,
          propuesta_comercial: r.propuesta_comercial,
        })));
      }

      // Buscar datos TOP 10K
      const { data: topData, error: topError } = await supabase
        .from('top_10k')
        .select('descripcion_ciiu_rev3, sector, ranking_2024, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
        .eq('ruc', rucInput)
        .single();

      if (topError && topError.code !== 'PGRST116') {
        console.error('Error cargando TOP 10K:', topError);
      } else if (topData) {
        setTop10kData(topData);
      }

      // Buscar información del creador
      if (solicitudData.user_id) {
        const { data: creatorData, error: creatorError } = await supabase
          .rpc('get_user_details', { user_id_input: solicitudData.user_id })
          .single();

        if (creatorError) {
          console.error("Error fetching creator details:", creatorError);
        } else if (creatorData) {
          setCreatorInfo({
            fullName: creatorData.full_name,
            email: creatorData.email
          });
        }
      }

      // Buscar datos del RIB
      const { data: ribDataResult, error: ribError } = await supabase
        .from('rib')
        .select('*')
        .eq('ruc', rucInput)
        .single();

      if (ribError && ribError.code !== 'PGRST116') {
        console.error('Error cargando RIB:', ribError);
      } else if (ribDataResult) {
        setRibData(ribDataResult);
      }

      showSuccess('Solicitud de operación encontrada.');
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Ocurrió un error al buscar la solicitud de operación.');
      showError('Error al buscar la solicitud.');
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadPDF = () => {
    // Aquí implementarías la lógica para generar y descargar el PDF
    showSuccess('Funcionalidad de descarga PDF en desarrollo.');
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Borrador':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-[#00FF80]" />
                Planilla del RIB
              </h1>
              <p className="text-gray-400">Visualizar y descargar solicitudes de operación</p>
            </div>
          </div>

          {/* Búsqueda */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar Solicitud por RUC</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Ingrese RUC de 11 dígitos"
                  value={rucInput}
                  onChange={(e) => setRucInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={11}
                  className="pl-10 bg-gray-900/50 border-gray-700"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={searching} 
                className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
              >
                {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {solicitud && (
            <div className="space-y-6">
              {/* Header con información básica y botón de descarga */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Solicitud de Operación - {fichaRuc?.nombre_empresa || 'Empresa'}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">RUC: {solicitud.ruc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getStatusColor(solicitud.status || 'Borrador')}>
                        {solicitud.status || 'Borrador'}
                      </Badge>
                      <Button 
                        onClick={handleDownloadPDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-400">Fecha de Creación</Label>
                      <p className="text-white">{new Date(solicitud.created_at).toLocaleDateString('es-PE')}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Última Actualización</Label>
                      <p className="text-white">{new Date(solicitud.updated_at).toLocaleDateString('es-PE')}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Creado por</Label>
                      <p className="text-white">{creatorInfo?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información de la empresa */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Información de la Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Nombre de la Empresa</Label>
                        <p className="text-white font-medium">{fichaRuc?.nombre_empresa || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">RUC</Label>
                        <p className="text-white font-mono">{solicitud.ruc}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Actividad</Label>
                        <p className="text-white">{fichaRuc?.actividad_empresa || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Estado del Contribuyente</Label>
                        <p className="text-white">{fichaRuc?.estado_contribuyente || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Fecha de Inicio de Actividades</Label>
                        <p className="text-white">{fichaRuc?.fecha_inicio_actividades || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Domicilio Fiscal</Label>
                        <p className="text-white">{fichaRuc?.domicilio_fiscal || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Representante Legal</Label>
                        <p className="text-white">{fichaRuc?.nombre_representante_legal || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Datos de la solicitud */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Datos de la Solicitud</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Fecha de la Ficha</Label>
                        <p className="text-white">{solicitud.fecha_ficha || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Orden de Servicio</Label>
                        <p className="text-white">{solicitud.orden_servicio || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Factura</Label>
                        <p className="text-white">{solicitud.factura || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Tipo de Cambio</Label>
                        <p className="text-white">{solicitud.tipo_cambio || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Moneda de Operación</Label>
                        <p className="text-white">{solicitud.moneda_operacion || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Dirección</Label>
                        <p className="text-white">{solicitud.direccion || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Visita</Label>
                        <p className="text-white">{solicitud.visita || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Contacto</Label>
                        <p className="text-white">{solicitud.contacto || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Fianza</Label>
                        <p className="text-white">{solicitud.fianza || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Exposición Total</Label>
                        <p className="text-white font-mono">{solicitud.exposicion_total || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {solicitud.resumen_solicitud && (
                    <div className="mt-6">
                      <Label className="text-gray-400">Resumen de Solicitud</Label>
                      <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{solicitud.resumen_solicitud}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Riesgos */}
              {riesgos.length > 0 && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Riesgos del Proveedor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">L/P</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Producto</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">Deudor</th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">L/P Vigente (GVE)</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-medium">Riesgo Aprobado</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-medium">Propuesta Comercial</th>
                            <th className="text-right py-3 px-4 text-gray-300 font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {riesgos.map((riesgo, index) => (
                            <tr key={index}>
                              <td className="py-3 px-4 text-white">{riesgo.lp}</td>
                              <td className="py-3 px-4 text-white">{riesgo.producto}</td>
                              <td className="py-3 px-4 text-white">{riesgo.deudor}</td>
                              <td className="py-3 px-4 text-white">{riesgo.lp_vigente_gve}</td>
                              <td className="py-3 px-4 text-right text-white font-mono">
                                {riesgo.riesgo_aprobado ? formatCurrency(riesgo.riesgo_aprobado) : 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-right text-white font-mono">
                                {riesgo.propuesta_comercial ? formatCurrency(riesgo.propuesta_comercial) : 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-right text-white font-mono font-semibold">
                                {formatCurrency((riesgo.riesgo_aprobado || 0) + (riesgo.propuesta_comercial || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Análisis RIB */}
              {ribData && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Análisis RIB
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(ribData.status)}>
                        {ribData.status}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        Creado: {new Date(ribData.created_at).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">Descripción de la Empresa</Label>
                          <p className="text-white">{ribData.descripcion_empresa || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Inicio de Actividades</Label>
                          <p className="text-white">{ribData.inicio_actividades || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Dirección</Label>
                          <p className="text-white">{ribData.direccion || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Teléfono</Label>
                          <p className="text-white font-mono">{ribData.telefono || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Grupo Económico</Label>
                          <p className="text-white">{ribData.grupo_economico || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">¿Cómo llegó a LCP?</Label>
                          <p className="text-white">{ribData.como_llego_lcp || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Visita</Label>
                          <p className="text-white">{ribData.visita || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Relación Comercial con Deudor</Label>
                          <p className="text-white">{ribData.relacion_comercial_deudor || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Validado por</Label>
                          <p className="text-white">{ribData.validado_por || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Última Actualización</Label>
                          <p className="text-white">{new Date(ribData.updated_at).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Datos TOP 10K */}
              {top10kData && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Información TOP 10K</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-400">Sector</Label>
                        <p className="text-white">{top10kData.sector || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Ranking 2024</Label>
                        <p className="text-white font-mono">#{top10kData.ranking_2024 || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Facturado 2024 (Máx)</Label>
                        <p className="text-white font-mono">{formatCurrency(top10kData.facturado_2024_soles_maximo)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Facturado 2023 (Máx)</Label>
                        <p className="text-white font-mono">{formatCurrency(top10kData.facturado_2023_soles_maximo)}</p>
                      </div>
                      <div className="md:col-span-2 lg:col-span-4">
                        <Label className="text-gray-400">Descripción CIIU</Label>
                        <p className="text-white">{top10kData.descripcion_ciiu_rev3 || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comentarios y garantías */}
              {(solicitud.comentarios || solicitud.garantias || solicitud.condiciones_desembolso) && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Información Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {solicitud.garantias && (
                      <div>
                        <Label className="text-gray-400">Garantías</Label>
                        <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{solicitud.garantias}</p>
                      </div>
                    )}
                    {solicitud.condiciones_desembolso && (
                      <div>
                        <Label className="text-gray-400">Condiciones de Desembolso</Label>
                        <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{solicitud.condiciones_desembolso}</p>
                      </div>
                    )}
                    {solicitud.comentarios && (
                      <div>
                        <Label className="text-gray-400">Comentarios</Label>
                        <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{solicitud.comentarios}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlanillaRibPage;