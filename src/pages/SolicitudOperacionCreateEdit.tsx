import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, FilePlus, Loader2, AlertCircle, CheckCircle, FileText, ShieldCheck, User, Briefcase, XCircle, ArrowLeft, Calendar, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FichaRuc } from '@/types/ficha-ruc';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';

interface Top10kData {
  descripcion_ciiu_rev3: string | null;
  sector: string | null;
  ranking_2024: number | null;
  facturado_2024_soles_maximo: number | null;
  facturado_2023_soles_maximo: string | null;
}

interface CreatorInfo {
  fullName: string | null;
  email: string | null;
}

type SolicitudStatus = 'Borrador' | 'Completado' | 'En revisión';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const SolicitudOperacionCreateEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useSession();

  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [top10kData, setTop10kData] = useState<Top10kData | null>(null);
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudOperacion | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [solicitudFormData, setSolicitudFormData] = useState({
    status: 'Borrador' as SolicitudStatus,
    direccion: '',
    visita: '',
    contacto: '',
    comentarios: '',
    fianza: '',
    lp: '',
    producto: '',
    proveedor: '',
    lp_vigente_gve: '',
    riesgo_aprobado: '',
    propuesta_comercial: '',
    exposicion_total: '',
    fecha_ficha: getTodayDate(),
    orden_servicio: '',
    factura: '',
    tipo_cambio: '',
    moneda_operacion: '',
    resumen_solicitud: '',
    deudor: '',
    garantias: '',
    condiciones_desembolso: '',
  });

  useEffect(() => {
    if (id) {
      const loadSolicitudForEdit = async () => {
        try {
          const solicitudData = await SolicitudOperacionService.getById(id);
          if (solicitudData) {
            handleEditSolicitud(solicitudData);
            if (solicitudData.user_id) {
              const { data: creatorData, error: creatorError } = await supabase
                .rpc('get_user_details', { user_id_input: solicitudData.user_id })
                .single();

              if (creatorError) {
                console.error("Error fetching creator details:", creatorError);
                showError("No se pudo cargar la información del creador.");
              } else if (creatorData) {
                setCreatorInfo({
                  fullName: creatorData.full_name,
                  email: creatorData.email
                });
              }
            }
          } else {
            showError('No se encontró la solicitud para editar.');
            navigate('/solicitudes-operacion');
          }
        } catch (err) {
          showError('Error al cargar la solicitud para editar.');
          navigate('/solicitudes-operacion');
        }
      };
      loadSolicitudForEdit();
    }
  }, [id, navigate]);

  useEffect(() => {
    const riesgo = parseFloat(solicitudFormData.riesgo_aprobado) || 0;
    const propuesta = parseFloat(solicitudFormData.propuesta_comercial) || 0;
    const total = riesgo + propuesta;
    const formattedTotal = total % 1 === 0 ? total.toString() : total.toFixed(2);
    setSolicitudFormData(prev => ({ ...prev, exposicion_total: formattedTotal }));
  }, [solicitudFormData.riesgo_aprobado, solicitudFormData.propuesta_comercial]);

  const resetStateAndForm = () => {
    setRucInput('');
    setSearching(false);
    setSaving(false);
    setError(null);
    setSearchedFicha(null);
    setTop10kData(null);
    setEditingSolicitud(null);
    setCreatorInfo(null);
    setSolicitudFormData({
      status: 'Borrador',
      direccion: '',
      visita: '',
      contacto: '',
      comentarios: '',
      fianza: '',
      lp: '',
      producto: '',
      proveedor: '',
      lp_vigente_gve: '',
      riesgo_aprobado: '',
      propuesta_comercial: '',
      exposicion_total: '',
      fecha_ficha: getTodayDate(),
      orden_servicio: '',
      factura: '',
      tipo_cambio: '',
      moneda_operacion: '',
      resumen_solicitud: '',
      deudor: '',
      garantias: '',
      condiciones_desembolso: '',
    });
  };

  const handleSearch = async (rucToSearch: string) => {
    if (!rucToSearch || rucToSearch.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setTop10kData(null);

    try {
      const fichaData = await FichaRucService.getByRuc(rucToSearch);
      if (fichaData) {
        setSearchedFicha(fichaData);
        setSolicitudFormData(prev => ({
            ...prev,
            proveedor: fichaData.nombre_empresa,
        }));
        if (!editingSolicitud) showSuccess('Ficha RUC encontrada.');

        const { data: topData, error: topError } = await supabase
          .from('top_10k')
          .select('descripcion_ciiu_rev3, sector, ranking_2024, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
          .eq('ruc', rucToSearch)
          .single();

        if (topError && topError.code !== 'PGRST116') throw topError;
        if (topData) setTop10kData(topData);

      } else {
        setError('Ficha RUC no encontrada. Asegúrese de que exista antes de crear una solicitud.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar los datos de la empresa.');
      showError('Error al buscar los datos.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showError('No tienes permisos para guardar la solicitud.');
      return;
    }
    const ruc = editingSolicitud?.ruc || searchedFicha?.ruc;
    if (!ruc) {
      showError('Debe haber una empresa seleccionada para guardar.');
      return;
    }
    setSaving(true);
    try {
      const parsedTipoCambio = parseFloat(solicitudFormData.tipo_cambio);
      const dataToSave = {
        ...solicitudFormData,
        tipo_cambio: isNaN(parsedTipoCambio) ? null : parsedTipoCambio,
      };

      if (editingSolicitud) {
        await SolicitudOperacionService.update(editingSolicitud.id, { ruc, ...dataToSave });
        showSuccess('Solicitud actualizada exitosamente.');
      } else {
        await SolicitudOperacionService.create({ ruc, ...dataToSave });
        showSuccess('Solicitud creada exitosamente.');
      }
      navigate('/solicitudes-operacion');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      showError(`No se pudo guardar la solicitud: ${errorMessage}`);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSolicitudFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEditSolicitud = (solicitud: SolicitudOperacion) => {
    setEditingSolicitud(solicitud);
    setRucInput(solicitud.ruc);
    setSolicitudFormData({
      status: (solicitud.status as SolicitudStatus) || 'Borrador',
      direccion: solicitud.direccion || '',
      visita: solicitud.visita || '',
      contacto: solicitud.contacto || '',
      comentarios: solicitud.comentarios || '',
      fianza: solicitud.fianza || '',
      lp: solicitud.lp || '',
      producto: solicitud.producto || '',
      proveedor: solicitud.proveedor || '',
      lp_vigente_gve: solicitud.lp_vigente_gve || '',
      riesgo_aprobado: solicitud.riesgo_aprobado || '',
      propuesta_comercial: solicitud.propuesta_comercial || '',
      exposicion_total: solicitud.exposicion_total || '',
      fecha_ficha: solicitud.fecha_ficha || getTodayDate(),
      orden_servicio: solicitud.orden_servicio || '',
      factura: solicitud.factura || '',
      tipo_cambio: solicitud.tipo_cambio?.toString() || '',
      moneda_operacion: solicitud.moneda_operacion || '',
      resumen_solicitud: solicitud.resumen_solicitud || '',
      deudor: solicitud.deudor || '',
      garantias: solicitud.garantias || '',
      condiciones_desembolso: solicitud.condiciones_desembolso || '',
    });
    handleSearch(solicitud.ruc);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    resetStateAndForm();
    navigate('/solicitudes-operacion');
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/solicitudes-operacion')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  {id ? (isAdmin ? 'Editar Solicitud de Operación' : 'Ver Solicitud de Operación') : 'Crear Solicitud de Operación'}
                </h1>
                <p className="text-gray-400">Reporte de Inicio Básico de empresa</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="text-white">1. Buscar Empresa por RUC</CardTitle></CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Ingrese RUC de 11 dígitos" 
                    value={rucInput} 
                    onChange={(e) => setRucInput(e.target.value)} 
                    maxLength={11} 
                    className="pl-10 bg-gray-900/50 border-gray-700" 
                    disabled={!!id}
                  />
                </div>
                <Button onClick={() => handleSearch(rucInput)} disabled={searching || !!id} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar Empresa
                </Button>
              </CardContent>
            </Card>

            {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

            {searchedFicha && (
              <div className="space-y-6">
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Solicitud de Operación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="fecha_ficha">Fecha del día</Label>
                        <Input id="fecha_ficha" type="date" value={solicitudFormData.fecha_ficha} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="proveedor">Proveedor</Label>
                        <Input id="proveedor" value={searchedFicha?.nombre_empresa || ''} disabled className="bg-gray-900/50 border-gray-700" />
                      </div>
                      <div>
                        <Label htmlFor="ruc">Número de RUC</Label>
                        <Input id="ruc" value={searchedFicha?.ruc || ''} disabled className="bg-gray-900/50 border-gray-700 font-mono" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="actividad">Actividad</Label>
                      <Input id="actividad" value={searchedFicha?.actividad_empresa || ''} disabled className="bg-gray-900/50 border-gray-700" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="orden_servicio">Orden de Servicio (Sí/No)</Label>
                        <Input id="orden_servicio" value={solicitudFormData.orden_servicio} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="factura">Factura (Sí/No)</Label>
                        <Input id="factura" value={solicitudFormData.factura} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo_cambio">Tipo de Cambio</Label>
                        <Input id="tipo_cambio" type="number" step="0.01" value={solicitudFormData.tipo_cambio} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="moneda_operacion">Moneda de la Operación</Label>
                        <Select value={solicitudFormData.moneda_operacion} onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, moneda_operacion: value }))} disabled={!isAdmin}>
                          <SelectTrigger className="bg-gray-900/50 border-gray-700">
                            <SelectValue placeholder="Seleccionar moneda" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#121212] border-gray-800 text-white">
                            <SelectItem value="Soles" className="hover:bg-gray-800">Soles</SelectItem>
                            <SelectItem value="Dolares" className="hover:bg-gray-800">Dólares</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="resumen_solicitud">Resumen de solicitud</Label>
                      <Textarea id="resumen_solicitud" value={solicitudFormData.resumen_solicitud} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Briefcase className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Riesgo Vigente del Proveedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lp">L/P</Label>
                        <Input id="lp" value={solicitudFormData.lp} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="producto">Producto</Label>
                        <Input id="producto" value={solicitudFormData.producto} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deudor">Deudor (es)</Label>
                      <Input id="deudor" value={solicitudFormData.deudor} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lp_vigente_gve">L/P Vigente (GVE)</Label>
                        <Input id="lp_vigente_gve" value={solicitudFormData.lp_vigente_gve} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="riesgo_aprobado">Riesgo Aprobado</Label>
                        <Input id="riesgo_aprobado" type="number" step="0.01" value={solicitudFormData.riesgo_aprobado} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propuesta_comercial">Propuesta Comercial</Label>
                        <Input id="propuesta_comercial" type="number" step="0.01" value={solicitudFormData.propuesta_comercial} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="exposicion_total">Exposición total (Soles)</Label>
                        <Input id="exposicion_total" value={solicitudFormData.exposicion_total} disabled className="bg-gray-800 border-gray-700 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="garantias">Garantías</Label>
                      <Textarea id="garantias" value={solicitudFormData.garantias} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                    <div>
                      <Label htmlFor="condiciones_desembolso">Condiciones de Desembolso</Label>
                      <Textarea id="condiciones_desembolso" value={solicitudFormData.condiciones_desembolso} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                    <div>
                      <Label htmlFor="comentarios">Comentarios</Label>
                      <Textarea id="comentarios" value={solicitudFormData.comentarios} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <ShieldCheck className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Riesgo Vigente del Deudor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {top10kData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-gray-400">RUC</Label>
                          <p className="font-mono text-white">{searchedFicha?.ruc}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Sector</Label>
                          <p className="text-white">{top10kData.sector || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Facturado 2024 (Máx)</Label>
                          <p className="font-mono text-white">{formatCurrency(top10kData.facturado_2024_soles_maximo)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Facturado 2023 (Máx)</Label>
                          <p className="font-mono text-white">{formatCurrency(top10kData.facturado_2023_soles_maximo)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-gray-400">Giro (CIIU)</Label>
                          <p className="text-white text-sm">{top10kData.descripcion_ciiu_rev3 || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-gray-400">Ranking 2024</Label>
                          <p className="font-mono text-white text-lg">#{top10kData.ranking_2024 || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>No se encontraron datos de riesgo en la base TOP 10K para este RUC.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <User className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Información del Pagador
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input id="direccion" value={solicitudFormData.direccion} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="visita">Visita</Label>
                        <Input id="visita" value={solicitudFormData.visita} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contacto">Contacto</Label>
                        <Input id="contacto" value={solicitudFormData.contacto} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="fianza">Fianza</Label>
                        <Input id="fianza" value={solicitudFormData.fianza} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">2. Completar Datos de la Solicitud</CardTitle></CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="status" className="text-gray-400">Estado de la Solicitud</Label>
                      <Select value={solicitudFormData.status} onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, status: value as SolicitudStatus }))} disabled={!isAdmin}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-gray-800 text-white">
                          <SelectItem value="Borrador" className="hover:bg-gray-800">Borrador</SelectItem>
                          <SelectItem value="En revisión" className="hover:bg-gray-800">En Revisión</SelectItem>
                          <SelectItem value="Completado" className="hover:bg-gray-800">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editingSolicitud && (
                      <div className="mt-6 border-t border-gray-800 pt-4 text-sm text-gray-400 space-y-3">
                        {creatorInfo && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span>Creado por: <strong className="text-gray-200">{creatorInfo.fullName || 'N/A'}</strong> ({creatorInfo.email || 'N/A'})</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Fecha de creación: <strong className="text-gray-200">{new Date(editingSolicitud.created_at).toLocaleString('es-PE')}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 flex-shrink-0" />
                          <span>Última modificación: <strong className="text-gray-200">{new Date(editingSolicitud.updated_at).toLocaleString('es-PE')}</strong></span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Información de Ficha RUC
                      </div>
                      <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Encontrada
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-gray-400">RUC</Label><Input value={searchedFicha.ruc} disabled className="bg-gray-900/50 border-gray-700 font-mono" /></div>
                      <div><Label className="text-gray-400">Razón Social</Label><Input value={searchedFicha.nombre_empresa} disabled className="bg-gray-900/50 border-gray-700" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-gray-400">Estado</Label><Input value={searchedFicha.estado_contribuyente || 'N/A'} disabled className="bg-gray-900/50 border-gray-700" /></div>
                      <div><Label className="text-gray-400">Inicio de Actividades</Label><Input value={searchedFicha.fecha_inicio_actividades ? new Date(searchedFicha.fecha_inicio_actividades).toLocaleDateString() : 'N/A'} disabled className="bg-gray-900/50 border-gray-700" /></div>
                    </div>
                    <div><Label className="text-gray-400">Domicilio Fiscal</Label><Textarea value={searchedFicha.domicilio_fiscal || 'N/A'} disabled rows={2} className="bg-gray-900/50 border-gray-700" /></div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleCancel} className="border-gray-700 text-gray-300">
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  {isAdmin && (
                    <Button onClick={handleSave} disabled={saving} size="lg" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FilePlus className="h-4 w-4 mr-2" />}
                      {id ? 'Actualizar Solicitud' : 'Confirmar y Crear Solicitud'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudOperacionCreateEditPage;