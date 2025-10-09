import React, { useState } from 'react';
import { Search, FileText, Download, Building2, Loader2, AlertCircle, Eye, BarChart3, TrendingUp, ClipboardEdit, Shield } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface DossierRib {
  // 1. Solicitud de operación
  solicitudOperacion: any;
  riesgos: any[];
  fichaRuc: any;
  creatorInfo: any;
  
  // 2. Análisis RIB
  analisisRib: any;
  
  // 3. Comportamiento Crediticio
  comportamientoCrediticio: any;
  
  // 4. RIB - Reporte Tributario
  ribReporteTributario: any[];
  
  // 5. Ventas Mensuales
  ventasMensuales: any;
  
  // Datos adicionales
  top10kData: any;
}

const PlanillaRibPage = () => {
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<DossierRib | null>(null);

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }

    setSearching(true);
    setError(null);
    setDossier(null);

    try {
      console.log('Buscando RUC:', rucInput);

      // Buscar solicitud de operación (punto de partida)
      const { data: solicitudes, error: solicitudError } = await supabase
        .from('solicitudes_operacion')
        .select(`
          *,
          solicitud_operacion_riesgos(*),
          profiles(full_name, email)
        `)
        .eq('ruc', rucInput)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('Resultado solicitudes:', { solicitudes, solicitudError });

      if (solicitudError) {
        console.error('Error en consulta solicitud:', solicitudError);
        setError(`Error al buscar la solicitud: ${solicitudError.message}`);
        return;
      }

      if (!solicitudes || solicitudes.length === 0) {
        setError('No se encontró ninguna solicitud de operación para este RUC.');
        return;
      }

      const solicitud = solicitudes[0];
      console.log('Solicitud encontrada:', solicitud);

      // Cargar todos los datos del dossier en paralelo
      const [
        fichaRucResult,
        analisisRibResult,
        comportamientoCrediticioResult,
        ribReporteTributarioResult,
        ventasMensualesResult,
        top10kResult
      ] = await Promise.allSettled([
        // Ficha RUC
        supabase.from('ficha_ruc').select('*').eq('ruc', rucInput).single(),
        
        // Análisis RIB
        supabase.from('rib').select('*').eq('ruc', rucInput).single(),
        
        // Comportamiento Crediticio
        supabase.from('comportamiento_crediticio').select('*').eq('ruc', rucInput).single(),
        
        // RIB - Reporte Tributario
        supabase.from('rib_reporte_tributario').select('*').eq('ruc', rucInput),
        
        // Ventas Mensuales
        supabase.from('ventas_mensuales').select('*').eq('proveedor_ruc', rucInput).single(),
        
        // TOP 10K
        supabase.from('top_10k').select('*').eq('ruc', parseInt(rucInput)).single()
      ]);

      console.log('Resultados paralelos:', {
        fichaRucResult,
        analisisRibResult,
        comportamientoCrediticioResult,
        ribReporteTributarioResult,
        ventasMensualesResult,
        top10kResult
      });

      // Procesar resultados
      const getData = (result: PromiseSettledResult<any>) => {
        if (result.status === 'fulfilled' && !result.value.error) {
          return result.value.data;
        }
        return null;
      };

      const dossierData: DossierRib = {
        // 1. Solicitud de operación
        solicitudOperacion: solicitud,
        riesgos: solicitud.solicitud_operacion_riesgos || [],
        fichaRuc: getData(fichaRucResult),
        creatorInfo: solicitud.profiles ? {
          fullName: solicitud.profiles.full_name,
          email: solicitud.profiles.email
        } : null,
        
        // 2. Análisis RIB
        analisisRib: getData(analisisRibResult),
        
        // 3. Comportamiento Crediticio
        comportamientoCrediticio: getData(comportamientoCrediticioResult),
        
        // 4. RIB - Reporte Tributario
        ribReporteTributario: getData(ribReporteTributarioResult) || [],
        
        // 5. Ventas Mensuales
        ventasMensuales: getData(ventasMensualesResult),
        
        // Datos adicionales
        top10kData: getData(top10kResult)
      };

      console.log('Dossier final:', dossierData);
      setDossier(dossierData);
      showSuccess('Dossier RIB cargado exitosamente.');
      
    } catch (err) {
      console.error('Error inesperado:', err);
      setError(`Ocurrió un error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      showError('Error al cargar el dossier.');
    } finally {
      setSearching(false);
    }
  };

  const handleDownloadPDF = () => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-PE');
    } catch (error) {
      return 'N/A';
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
                Dossier Completo RIB
              </h1>
              <p className="text-gray-400">Visualizar y descargar el dossier completo de análisis RIB</p>
            </div>
          </div>

          {/* Búsqueda */}
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar Dossier por RUC</CardTitle>
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
                Buscar Dossier
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {dossier && (
            <div className="space-y-6">
              {/* Header del Dossier */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Dossier RIB - {dossier.fichaRuc?.nombre_empresa || 'Empresa'}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1">RUC: {dossier.solicitudOperacion.ruc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getStatusColor(dossier.solicitudOperacion.status || 'Borrador')}>
                        {dossier.solicitudOperacion.status || 'Borrador'}
                      </Badge>
                      <Button 
                        onClick={handleDownloadPDF}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Dossier PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-400">Fecha de Creación</Label>
                      <p className="text-white">{formatDate(dossier.solicitudOperacion.created_at)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Última Actualización</Label>
                      <p className="text-white">{formatDate(dossier.solicitudOperacion.updated_at)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Creado por</Label>
                      <p className="text-white">{dossier.creatorInfo?.fullName || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 1. SOLICITUD DE OPERACIÓN */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
                    1. Solicitud de Operación
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                      <div>
                        <Label className="text-gray-400">Deudor</Label>
                        <p className="text-white">{dossier.solicitudOperacion.deudor || 'N/A'}</p>
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
                      <div>
                        <Label className="text-gray-400">Tipo de Cambio</Label>
                        <p className="text-white">{dossier.solicitudOperacion.tipo_cambio || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Riesgos */}
                  {dossier.riesgos.length > 0 && (
                    <div className="mt-6">
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
                </CardContent>
              </Card>

              {/* 2. ANÁLISIS RIB */}
              {dossier.analisisRib && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      2. Análisis RIB
                    </CardTitle>
                    <Badge variant="outline" className={getStatusColor(dossier.analisisRib.status)}>
                      {dossier.analisisRib.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">Descripción de la Empresa</Label>
                          <p className="text-white">{dossier.analisisRib.descripcion_empresa || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Inicio de Actividades</Label>
                          <p className="text-white">{formatDate(dossier.analisisRib.inicio_actividades)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Grupo Económico</Label>
                          <p className="text-white">{dossier.analisisRib.grupo_economico || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">¿Cómo llegó a LCP?</Label>
                          <p className="text-white">{dossier.analisisRib.como_llego_lcp || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-400">Dirección</Label>
                          <p className="text-white">{dossier.analisisRib.direccion || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Teléfono</Label>
                          <p className="text-white font-mono">{dossier.analisisRib.telefono || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Visita</Label>
                          <p className="text-white">{dossier.analisisRib.visita || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Validado por</Label>
                          <p className="text-white">{dossier.analisisRib.validado_por || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3. COMPORTAMIENTO CREDITICIO */}
              {dossier.comportamientoCrediticio && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
                      3. Comportamiento Crediticio
                    </CardTitle>
                    <Badge variant="outline" className={getStatusColor(dossier.comportamientoCrediticio.status)}>
                      {dossier.comportamientoCrediticio.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">Proveedor - Equifax</h4>
                        <div>
                          <Label className="text-gray-400">Calificación</Label>
                          <p className="text-white">{dossier.comportamientoCrediticio.equifax_calificacion || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Score</Label>
                          <p className="text-white">{dossier.comportamientoCrediticio.equifax_score || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Deuda Directa</Label>
                          <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_directa)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Deuda Indirecta</Label>
                          <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_indirecta)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-white font-medium">Proveedor - Sentinel</h4>
                        <div>
                          <Label className="text-gray-400">Calificación</Label>
                          <p className="text-white">{dossier.comportamientoCrediticio.sentinel_calificacion || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Score</Label>
                          <p className="text-white">{dossier.comportamientoCrediticio.sentinel_score || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Deuda Directa</Label>
                          <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_directa)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Deuda Indirecta</Label>
                          <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_indirecta)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Información del Deudor si existe */}
                    {dossier.comportamientoCrediticio.deudor && (
                      <div className="mt-6 pt-6 border-t border-gray-800">
                        <h4 className="text-white font-medium mb-4">Información del Deudor</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-400">Deudor</Label>
                              <p className="text-white">{dossier.comportamientoCrediticio.deudor}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Calificación Equifax</Label>
                              <p className="text-white">{dossier.comportamientoCrediticio.deudor_equifax_calificacion || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Score Equifax</Label>
                              <p className="text-white">{dossier.comportamientoCrediticio.deudor_equifax_score || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-gray-400">Calificación Sentinel</Label>
                              <p className="text-white">{dossier.comportamientoCrediticio.deudor_sentinel_calificacion || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Score Sentinel</Label>
                              <p className="text-white">{dossier.comportamientoCrediticio.deudor_sentinel_score || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 4. RIB - REPORTE TRIBUTARIO */}
              {dossier.ribReporteTributario.length > 0 && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <ClipboardEdit className="h-5 w-5 mr-2 text-[#00FF80]" />
                      4. RIB - Reporte Tributario
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dossier.ribReporteTributario.map((reporte, index) => (
                        <div key={index} className="border border-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-medium">
                              Reporte {reporte.anio} - {reporte.tipo_entidad === 'proveedor' ? 'Proveedor' : 'Deudor'}
                            </h4>
                            <Badge variant="outline" className={getStatusColor(reporte.status)}>
                              {reporte.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-gray-400">Total Activos</Label>
                              <p className="text-white font-mono">{formatCurrency(reporte.total_activos)}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Total Pasivos</Label>
                              <p className="text-white font-mono">{formatCurrency(reporte.total_pasivos)}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Total Patrimonio</Label>
                              <p className="text-white font-mono">{formatCurrency(reporte.total_patrimonio)}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Ingreso Ventas</Label>
                              <p className="text-white font-mono">{formatCurrency(reporte.ingreso_ventas)}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Utilidad Bruta</Label>
                              <p className="text-white font-mono">{formatCurrency(reporte.utilidad_bruta)}</p>
                            </div>
                            <div>
                              <Label className="text-gray-400">Solvencia</Label>
                              <p className="text-white font-mono">{reporte.solvencia || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 5. VENTAS MENSUALES */}
              {dossier.ventasMensuales && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      5. Ventas Mensuales
                    </CardTitle>
                    <Badge variant="outline" className={getStatusColor(dossier.ventasMensuales.status)}>
                      {dossier.ventasMensuales.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Ventas del Proveedor */}
                      <div>
                        <h4 className="text-white font-medium mb-4">Ventas del Proveedor</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {[
                            { mes: 'Enero 2024', valor: dossier.ventasMensuales.enero_2024_proveedor },
                            { mes: 'Febrero 2024', valor: dossier.ventasMensuales.febrero_2024_proveedor },
                            { mes: 'Marzo 2024', valor: dossier.ventasMensuales.marzo_2024_proveedor },
                            { mes: 'Abril 2024', valor: dossier.ventasMensuales.abril_2024_proveedor },
                            { mes: 'Mayo 2024', valor: dossier.ventasMensuales.mayo_2024_proveedor },
                            { mes: 'Junio 2024', valor: dossier.ventasMensuales.junio_2024_proveedor }
                          ].map((item, index) => (
                            <div key={index}>
                              <Label className="text-gray-400 text-xs">{item.mes}</Label>
                              <p className="text-white font-mono text-sm">{formatCurrency(item.valor)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ventas del Deudor si existen */}
                      {dossier.ventasMensuales.deudor_ruc && (
                        <div className="pt-6 border-t border-gray-800">
                          <h4 className="text-white font-medium mb-4">Ventas del Deudor</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[
                              { mes: 'Enero 2024', valor: dossier.ventasMensuales.enero_2024_deudor },
                              { mes: 'Febrero 2024', valor: dossier.ventasMensuales.febrero_2024_deudor },
                              { mes: 'Marzo 2024', valor: dossier.ventasMensuales.marzo_2024_deudor },
                              { mes: 'Abril 2024', valor: dossier.ventasMensuales.abril_2024_deudor },
                              { mes: 'Mayo 2024', valor: dossier.ventasMensuales.mayo_2024_deudor },
                              { mes: 'Junio 2024', valor: dossier.ventasMensuales.junio_2024_deudor }
                            ].map((item, index) => (
                              <div key={index}>
                                <Label className="text-gray-400 text-xs">{item.mes}</Label>
                                <p className="text-white font-mono text-sm">{formatCurrency(item.valor)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información TOP 10K (Adicional) */}
              {dossier.top10kData && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Información Adicional - TOP 10K</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-gray-400">Sector</Label>
                        <p className="text-white">{dossier.top10kData.sector || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Ranking 2024</Label>
                        <p className="text-white font-mono">#{dossier.top10kData.ranking_2024 || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Facturado 2024 (Máx)</Label>
                        <p className="text-white font-mono">{formatCurrency(dossier.top10kData.facturado_2024_soles_maximo)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-400">Tamaño</Label>
                        <p className="text-white">{dossier.top10kData.tamano || 'N/A'}</p>
                      </div>
                    </div>
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