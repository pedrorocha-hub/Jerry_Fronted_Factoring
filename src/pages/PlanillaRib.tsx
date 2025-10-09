import React, { useState } from 'react';
import { Search, FileText, Download, Building2, Loader2, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface PlanillaData {
  // Solicitud de operación
  solicitud: any;
  // Ficha RUC
  fichaRuc: any;
  // Riesgos
  riesgos: any[];
  // TOP 10K
  top10kData: any;
  // Información del creador
  creatorInfo: any;
  // RIB Data
  ribData: any;
}

const PlanillaRibPage = () => {
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planillaData, setPlanillaData] = useState<PlanillaData | null>(null);

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }

    setSearching(true);
    setError(null);
    setPlanillaData(null);

    try {
      // Una sola consulta para obtener toda la información necesaria
      const { data: solicitudes, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`
          *,
          solicitud_operacion_riesgos(*),
          profiles!solicitudes_operacion_user_id_fkey(full_name)
        `)
        .eq('ruc', rucInput)
        .order('created_at', { ascending: false })
        .limit(1);

      if (solicitudError) {
        console.error('Error buscando solicitud:', solicitudError);
        setError('Error al buscar la solicitud de operación.');
        return;
      }

      if (!solicitudes || solicitudes.length === 0) {
        setError('No se encontró ninguna solicitud de operación para este RUC.');
        return;
      }

      const solicitud = solicitudes[0];

      // Consultas paralelas para el resto de la información
      const [
        fichaRucResult,
        top10kResult,
        ribResult,
        creatorResult
      ] = await Promise.allSettled([
        // Ficha RUC
        supabase
          .from('ficha_ruc')
          .select('*')
          .eq('ruc', rucInput)
          .single(),
        
        // TOP 10K
        supabase
          .from('top_10k')
          .select('descripcion_ciiu_rev3, sector, ranking_2024, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
          .eq('ruc', rucInput)
          .single(),
        
        // RIB
        supabase
          .from('rib')
          .select('*')
          .eq('ruc', rucInput)
          .single(),
        
        // Información del creador
        solicitud.user_id ? supabase
          .rpc('get_user_details', { user_id_input: solicitud.user_id })
          .single() : Promise.resolve({ data: null, error: null })
      ]);

      // Procesar resultados
      const fichaRuc = fichaRucResult.status === 'fulfilled' && !fichaRucResult.value.error 
        ? fichaRucResult.value.data : null;
      
      const top10kData = top10kResult.status === 'fulfilled' && !top10kResult.value.error 
        ? top10kResult.value.data : null;
      
      const ribData = ribResult.status === 'fulfilled' && !ribResult.value.error 
        ? ribResult.value.data : null;
      
      const creatorInfo = creatorResult.status === 'fulfilled' && !creatorResult.value.error && creatorResult.value.data
        ? {
            fullName: creatorResult.value.data.full_name,
            email: creatorResult.value.data.email
          } : null;

      // Procesar riesgos
      const riesgos = solicitud.solicitud_operacion_riesgos?.map((r: any) => ({
        lp: r.lp || '',
        producto: r.producto || '',
        deudor: r.deudor || '',
        lp_vigente_gve: r.lp_vigente_gve || '',
        riesgo_aprobado: r.riesgo_aprobado,
        propuesta_comercial: r.propuesta_comercial,
      })) || [];

      setPlanillaData({
        solicitud,
        fichaRuc,
        riesgos,
        top10kData,
        creatorInfo,
        ribData
      });

      showSuccess('Planilla RIB cargada exitosamente.');
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Ocurrió un error al cargar la planilla RIB.');
      showError('Error al cargar la planilla.');
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

          {planillaData && (
            <div className="space-y-6">
              {/* Header con información básica y botón de descarga */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Solicitud de Operación - {planillaData.fichaRuc?.nombre_empresa || 'Empresa'}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">RUC: {planillaData.solicitud.ruc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getStatusColor(planillaData.solicitud.status || 'Borrador')}>
                        {planillaData.solicitud.status || 'Borrador'}
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
                      <p className="text-white">{new Date(planillaData.solicitud.created_at).toLocaleDateString('es-PE')}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Última Actualización</Label>
                      <p className="text-white">{new Date(planillaData.solicitud.updated_at).toLocaleDateString('es-PE')}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Creado por</Label>
                      <p className="text-white">{planillaData.creatorInfo?.fullName || 'N/A'}</p>
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
                        <p className="text-white font-medium">{planillaData.fichaRuc?.nombre_empresa || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">RUC</Label>
                        <p className="text-white font-mono">{planillaData.solicitud.ruc}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Actividad</Label>
                        <p className="text-white">{planillaData.fichaRuc?.actividad_empresa || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Estado del Contribuyente</Label>
                        <p className="text-white">{planillaData.fichaRuc?.estado_contribuyente || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Fecha de Inicio de Actividades</Label>
                        <p className="text-white">{planillaData.fichaRuc?.fecha_inicio_actividades || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Domicilio Fiscal</Label>
                        <p className="text-white">{planillaData.fichaRuc?.domicilio_fiscal || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Representante Legal</Label>
                        <p className="text-white">{planillaData.fichaRuc?.nombre_representante_legal || 'N/A'}</p>
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
                        <p className="text-white">{planillaData.solicitud.fecha_ficha || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Orden de Servicio</Label>
                        <p className="text-white">{planillaData.solicitud.orden_servicio || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Factura</Label>
                        <p className="text-white">{planillaData.solicitud.factura || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Tipo de Cambio</Label>
                        <p className="text-white">{planillaData.solicitud.tipo_cambio || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Moneda de Operación</Label>
                        <p className="text-white">{planillaData.solicitud.moneda_operacion || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Dirección</Label>
                        <p className="text-white">{planillaData.solicitud.direccion || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Visita</Label>
                        <p className="text-white">{planillaData.solicitud.visita || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Contacto</Label>
                        <p className="text-white">{planillaData.solicitud.contacto || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Fianza</Label>
                        <p className="text-white">{planillaData.solicitud.fianza || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Exposición Total</Label>
                        <p className="text-white font-mono">{planillaData.solicitud.exposicion_total || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {planillaData.solicitud.resumen_solicitud && (
                    <div className="mt-6">
                      <Label className="text-gray-400">Resumen de Solicitud</Label>
                      <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{planillaData.solicitud.resumen_solicitud}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Riesgos */}
              {planillaData.riesgos.length > 0 && (
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
                          {planillaData.riesgos.map((riesgo, index) => (
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
              {planillaData.ribData && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Análisis RIB
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getStatusColor(planillaData.ribData.status)}>
                        {planillaData.ribData.status}
                      </Badge>
                      <span className="text-sm text-gray-400">
                        Creado: {new Date(planillaData.ribData.created_at).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">Descripción de la Empresa</Label>
                          <p className="text-white">{planillaData.ribData.descripcion_empresa || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Inicio de Actividades</Label>
                          <p className="text-white">{planillaData.ribData.inicio_actividades || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Dirección</Label>
                          <p className="text-white">{planillaData.ribData.direccion || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Teléfono</Label>
                          <p className="text-white font-mono">{planillaData.ribData.telefono || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Grupo Económico</Label>
                          <p className="text-white">{planillaData.ribData.grupo_economico || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">¿Cómo llegó a LCP?</Label>
                          <p className="text-white">{planillaData.ribData.como_llego_lcp || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Visita</Label>
                          <p className="text-white">{planillaData.ribData.visita || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Relación Comercial con Deudor</Label>
                          <p className="text-white">{planillaData.ribData.relacion_comercial_deudor || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Validado por</Label>
                          <p className="text-white">{planillaData.ribData.validado_por || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Última Actualización</Label>
                          <p className="text-white">{new Date(planillaData.ribData.updated_at).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Datos TOP 10K */}
              {planillaData.top10kData && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Información TOP 10K</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-400">Sector</Label>
                        <p className="text-white">{planillaData.top10kData.sector || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Ranking 2024</Label>
                        <p className="text-white font-mono">#{planillaData.top10kData.ranking_2024 || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Facturado 2024 (Máx)</Label>
                        <p className="text-white font-mono">{formatCurrency(planillaData.top10kData.facturado_2024_soles_maximo)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Facturado 2023 (Máx)</Label>
                        <p className="text-white font-mono">{formatCurrency(planillaData.top10kData.facturado_2023_soles_maximo)}</p>
                      </div>
                      <div className="md:col-span-2 lg:col-span-4">
                        <Label className="text-gray-400">Descripción CIIU</Label>
                        <p className="text-white">{planillaData.top10kData.descripcion_ciiu_rev3 || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comentarios y garantías */}
              {(planillaData.solicitud.comentarios || planillaData.solicitud.garantias || planillaData.solicitud.condiciones_desembolso) && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Información Adicional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {planillaData.solicitud.garantias && (
                      <div>
                        <Label className="text-gray-400">Garantías</Label>
                        <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{planillaData.solicitud.garantias}</p>
                      </div>
                    )}
                    {planillaData.solicitud.condiciones_desembolso && (
                      <div>
                        <Label className="text-gray-400">Condiciones de Desembolso</Label>
                        <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{planillaData.solicitud.condiciones_desembolso}</p>
                      </div>
                    )}
                    {planillaData.solicitud.comentarios && (
                      <div>
                        <Label className="text-gray-400">Comentarios</Label>
                        <p className="text-white mt-2 p-3 bg-gray-900/50 rounded-lg">{planillaData.solicitud.comentarios}</p>
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