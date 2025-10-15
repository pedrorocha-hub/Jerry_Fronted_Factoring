import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, FilePlus, Loader2, AlertCircle, CheckCircle, FileText, ShieldCheck, User, Briefcase, XCircle, ArrowLeft, Calendar, RefreshCw, PlusCircle, Trash2, Plus, ClipboardCopy } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FichaRuc } from '@/types/ficha-ruc';
import { SolicitudOperacion, SolicitudOperacionRiesgo, SolicitudOperacionWithRiesgos, SolicitudStatus } from '@/types/solicitud-operacion';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

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

interface RiesgoRow {
  id?: string;
  lp: string;
  producto: string;
  deudor: string;
  lp_vigente_gve: string;
  riesgo_aprobado: string;
  propuesta_comercial: string;
  exposicion_total: string;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

const SolicitudOperacionCreateEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useSession();
  const isCreateMode = !id;

  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [top10kData, setTop10kData] = useState<Top10kData | null>(null);
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudOperacionWithRiesgos | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  
  const [riesgoRows, setRiesgoRows] = useState<Partial<RiesgoRow>[]>([
    { lp: '', producto: '', deudor: '', lp_vigente_gve: '', riesgo_aprobado: '', propuesta_comercial: '', exposicion_total: '0' }
  ]);

  const [solicitudFormData, setSolicitudFormData] = useState({
    status: 'Borrador' as SolicitudStatus,
    direccion: '',
    visita: '',
    contacto: '',
    comentarios: '',
    fianza: '',
    proveedor: '',
    exposicion_total: '',
    fecha_ficha: getTodayDate(),
    orden_servicio: '',
    factura: '',
    tipo_cambio: '',
    moneda_operacion: '',
    resumen_solicitud: '',
    garantias: '',
    condiciones_desembolso: '',
    validado_por: '', // <-- Inicialización del nuevo campo
  });

  const handleEditSolicitud = useCallback(async (solicitud: SolicitudOperacionWithRiesgos) => {
    setEditingSolicitud(solicitud);
    setRucInput(solicitud.ruc);

    const { data: riesgos, error } = await supabase
      .from('solicitud_operacion_riesgos')
      .select('*')
      .eq('solicitud_id', solicitud.id);

    if (error) {
      showError('Error al cargar los detalles de riesgo.');
      console.error(error);
    }

    if (riesgos && riesgos.length > 0) {
      setRiesgoRows(riesgos.map(r => ({
        id: r.id,
        lp: r.lp || '',
        producto: r.producto || '',
        deudor: r.deudor || '',
        lp_vigente_gve: r.lp_vigente_gve || '',
        riesgo_aprobado: r.riesgo_aprobado?.toString() || '',
        propuesta_comercial: r.propuesta_comercial?.toString() || '',
        exposicion_total: '0',
      })));
    } else {
      setRiesgoRows([{
        lp: solicitud.lp || '',
        producto: solicitud.producto || '',
        deudor: solicitud.deudor || '',
        lp_vigente_gve: solicitud.lp_vigente_gve || '',
        riesgo_aprobado: solicitud.riesgo_aprobado || '',
        propuesta_comercial: solicitud.propuesta_comercial || '',
        exposicion_total: '0',
      }]);
    }

    setSolicitudFormData({
      status: solicitud.status || 'Borrador',
      direccion: solicitud.direccion || '',
      visita: solicitud.visita || '',
      contacto: solicitud.contacto || '',
      comentarios: solicitud.comentarios || '',
      fianza: solicitud.fianza || '',
      proveedor: solicitud.proveedor || '',
      exposicion_total: solicitud.exposicion_total || '',
      fecha_ficha: solicitud.fecha_ficha || getTodayDate(),
      orden_servicio: solicitud.orden_servicio || '',
      factura: solicitud.factura || '',
      tipo_cambio: solicitud.tipo_cambio?.toString() || '',
      moneda_operacion: solicitud.moneda_operacion || '',
      resumen_solicitud: solicitud.resumen_solicitud || '',
      garantias: solicitud.garantias || '',
      condiciones_desembolso: solicitud.condiciones_desembolso || '',
      validado_por: solicitud.validado_por || '', // <-- Mapeo del campo
    });
    await handleSearch(solicitud.ruc);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (id) {
      const loadSolicitudForEdit = async () => {
        try {
          const solicitudData = await SolicitudOperacionService.getById(id);
          if (solicitudData) {
            await handleEditSolicitud(solicitudData);
            if (solicitudData.user_id) {
              const { data: creatorData, error: creatorError } = await supabase
                .rpc('get_user_details', { user_id_input: solicitudData.user_id });

              if (creatorError) {
                console.error("Error fetching creator details:", creatorError);
              } else if (creatorData && creatorData.length > 0) {
                const userDetails = creatorData[0] as { full_name: string; email: string };
                setCreatorInfo({
                  fullName: userDetails.full_name,
                  email: userDetails.email
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
  }, [id, navigate, handleEditSolicitud]);

  useEffect(() => {
    const grandTotal = riesgoRows.reduce((acc, row) => {
      const riesgo = parseFloat(row.riesgo_aprobado || '0') || 0;
      const propuesta = parseFloat(row.propuesta_comercial || '0') || 0;
      return acc + riesgo + propuesta;
    }, 0);
    const formattedGrandTotal = grandTotal % 1 === 0 ? grandTotal.toString() : grandTotal.toFixed(2);
    setSolicitudFormData(prev => ({ ...prev, exposicion_total: formattedGrandTotal }));
  }, [riesgoRows]);

  const resetStateAndForm = () => {
    setRucInput('');
    setSearching(false);
    setSaving(false);
    setError(null);
    setSearchedFicha(null);
    setTop10kData(null);
    setEditingSolicitud(null);
    setCreatorInfo(null);
    setRiesgoRows([{ lp: '', producto: '', deudor: '', lp_vigente_gve: '', riesgo_aprobado: '', propuesta_comercial: '', exposicion_total: '0' }]);
    setSolicitudFormData({
      status: 'Borrador',
      direccion: '',
      visita: '',
      contacto: '',
      comentarios: '',
      fianza: '',
      proveedor: '',
      exposicion_total: '',
      fecha_ficha: getTodayDate(),
      orden_servicio: '',
      factura: '',
      tipo_cambio: '',
      moneda_operacion: '',
      resumen_solicitud: '',
      garantias: '',
      condiciones_desembolso: '',
      validado_por: '', // <-- Reset del nuevo campo
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
        setSolicitudFormData(prev => ({ ...prev, proveedor: fichaData.nombre_empresa }));
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

  const handleCreateAndRedirect = async () => {
    if (!rucInput || rucInput.length !== 11) {
      showError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSaving(true);
    try {
      const newSolicitud = await SolicitudOperacionService.create({ ruc: rucInput, status: 'Borrador' });
      showSuccess('Expediente creado. Redirigiendo a la página de edición...');
      navigate(`/solicitudes-operacion/editar/${newSolicitud.id}`);
    } catch (err) {
      showError('No se pudo crear el nuevo expediente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
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
      const firstRiesgoRow = riesgoRows[0] || {};
      const dataToSave: Partial<SolicitudOperacion> = {
        ...solicitudFormData,
        ruc,
        tipo_cambio: parseFloat(solicitudFormData.tipo_cambio) || null,
        lp: firstRiesgoRow.lp || null,
        producto: firstRiesgoRow.producto || null,
        deudor: firstRiesgoRow.deudor || null,
        lp_vigente_gve: firstRiesgoRow.lp_vigente_gve || null,
        riesgo_aprobado: String(firstRiesgoRow.riesgo_aprobado || ''),
        propuesta_comercial: String(firstRiesgoRow.propuesta_comercial || ''),
      };

      if (editingSolicitud) {
        await SolicitudOperacionService.update(editingSolicitud.id, dataToSave);
        await supabase.from('solicitud_operacion_riesgos').delete().eq('solicitud_id', editingSolicitud.id);
        const riesgosToInsert = riesgoRows.map(row => ({
          solicitud_id: editingSolicitud.id,
          lp: row.lp,
          producto: row.producto,
          deudor: row.deudor,
          lp_vigente_gve: row.lp_vigente_gve,
          riesgo_aprobado: parseFloat(row.riesgo_aprobado || '0') || null,
          propuesta_comercial: parseFloat(row.propuesta_comercial || '0') || null,
        }));
        await supabase.from('solicitud_operacion_riesgos').insert(riesgosToInsert);
        showSuccess('Solicitud actualizada exitosamente.');
      } else {
        // This flow is now handled by handleCreateAndRedirect
        showError("Error: El modo de creación directa no debería ser accesible.");
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

  const handleRiesgoChange = (index: number, field: keyof RiesgoRow, value: string) => {
    const updatedRows = [...riesgoRows];
    const newRow = { ...updatedRows[index], [field]: value };
    updatedRows[index] = newRow;
    setRiesgoRows(updatedRows);
  };

  const handleAddRiesgoRow = () => {
    setRiesgoRows([...riesgoRows, { lp: '', producto: '', deudor: '', lp_vigente_gve: '', riesgo_aprobado: '', propuesta_comercial: '', exposicion_total: '0' }]);
  };

  const handleRemoveRiesgoRow = (index: number) => {
    if (riesgoRows.length > 1) {
      setRiesgoRows(riesgoRows.filter((_, i) => i !== index));
    }
  };

  const handleCancel = () => {
    resetStateAndForm();
    navigate('/solicitudes-operacion');
  };

  const handleCopyId = () => {
    if (editingSolicitud?.id) {
      navigator.clipboard.writeText(editingSolicitud.id);
      showSuccess('ID de expediente copiado al portapapeles.');
    }
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  if (isCreateMode) {
    return (
      <Layout>
        <div className="min-h-screen bg-black p-6 flex items-center justify-center">
          <Card className="bg-[#121212] border border-gray-800 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FilePlus className="h-6 w-6 mr-3 text-[#00FF80]" />
                Crear Nuevo Expediente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">
                Ingrese el RUC de la empresa para iniciar una nueva solicitud de operación.
                Esto creará un expediente único.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Ingrese RUC de 11 dígitos"
                  value={rucInput}
                  onChange={(e) => setRucInput(e.target.value)}
                  maxLength={11}
                  className="pl-10 bg-gray-900/50 border-gray-700"
                  autoFocus
                />
              </div>
              {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => navigate('/solicitudes-operacion')}>Cancelar</Button>
                <Button onClick={handleCreateAndRedirect} disabled={saving} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FilePlus className="h-4 w-4 mr-2" />}
                  Crear y Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/solicitudes-operacion')} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  {isAdmin ? 'Editar Solicitud de Operación' : 'Ver Solicitud de Operación'}
                </h1>
                <p className="text-gray-400">Reporte de Inicio Básico de empresa</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {searchedFicha && (
              <div className="space-y-6">
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="flex items-center text-white"><FileText className="h-5 w-5 mr-2 text-[#00FF80]" />Solicitud de Operación</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><Label htmlFor="fecha_ficha">Fecha del día</Label><Input id="fecha_ficha" type="date" value={solicitudFormData.fecha_ficha} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      <div><Label htmlFor="proveedor">Proveedor</Label><Input id="proveedor" value={searchedFicha?.nombre_empresa || ''} disabled className="bg-gray-800 border-gray-700 text-gray-400" /></div>
                      <div><Label htmlFor="ruc">Número de RUC</Label><Input id="ruc" value={searchedFicha?.ruc || ''} disabled className="bg-gray-800 border-gray-700 text-gray-400 font-mono" /></div>
                    </div>
                    <div><Label htmlFor="actividad">Actividad</Label><Input id="actividad" value={searchedFicha?.actividad_empresa || ''} disabled className="bg-gray-800 border-gray-700 text-gray-400" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor="orden_servicio">Orden de Servicio (Sí/No)</Label><Input id="orden_servicio" value={solicitudFormData.orden_servicio} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      <div><Label htmlFor="factura">Factura (Sí/No)</Label><Input id="factura" value={solicitudFormData.factura} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor="tipo_cambio">Tipo de Cambio</Label><Input id="tipo_cambio" type="number" step="0.01" value={solicitudFormData.tipo_cambio} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      <div>
                        <Label htmlFor="moneda_operacion">Moneda de la Operación</Label>
                        <Select value={solicitudFormData.moneda_operacion} onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, moneda_operacion: value }))} disabled={!isAdmin}>
                          <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue placeholder="Seleccionar moneda" /></SelectTrigger>
                          <SelectContent className="bg-[#121212] border-gray-800 text-white">
                            <SelectItem value="Soles" className="hover:bg-gray-800">Soles</SelectItem>
                            <SelectItem value="Dolares" className="hover:bg-gray-800">Dólares</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div><Label htmlFor="resumen_solicitud">Resumen de solicitud</Label><Textarea id="resumen_solicitud" value={solicitudFormData.resumen_solicitud} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="flex items-center text-white"><Briefcase className="h-5 w-5 mr-2 text-[#00FF80]" />Riesgo Vigente del Proveedor</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {riesgoRows.map((row, index) => (
                      <div key={index} className="p-4 border border-gray-800 rounded-lg space-y-4 relative">
                        {isAdmin && riesgoRows.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveRiesgoRow(index)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                          <div><Label>L/P</Label><Input value={row.lp || ''} onChange={(e) => handleRiesgoChange(index, 'lp', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                          <div><Label>Producto</Label><Input value={row.producto || ''} onChange={(e) => handleRiesgoChange(index, 'producto', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                          <div><Label>Deudor</Label><Input value={row.deudor || ''} onChange={(e) => handleRiesgoChange(index, 'deudor', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                          <div><Label>L/P Vigente (GVE)</Label><Input value={row.lp_vigente_gve || ''} onChange={(e) => handleRiesgoChange(index, 'lp_vigente_gve', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                          <div><Label>Riesgo Aprobado</Label><Input type="number" step="0.01" value={row.riesgo_aprobado || ''} onChange={(e) => handleRiesgoChange(index, 'riesgo_aprobado', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                          <div><Label>Propuesta Comercial</Label><Input type="number" step="0.01" value={row.propuesta_comercial || ''} onChange={(e) => handleRiesgoChange(index, 'propuesta_comercial', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                          <div><Label>Exposición Total</Label><Input value={((parseFloat(row.riesgo_aprobado || '0') || 0) + (parseFloat(row.propuesta_comercial || '0') || 0)).toFixed(2)} disabled className="bg-gray-800 border-gray-700 text-gray-400" /></div>
                        </div>
                      </div>
                    ))}
                    {isAdmin && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-right flex-1">
                          <Label className="text-gray-400 mr-2">Exposición Total (Soles):</Label>
                          <span className="font-bold text-lg text-white">{solicitudFormData.exposicion_total}</span>
                        </div>
                        <Button variant="outline" onClick={handleAddRiesgoRow} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Fila
                        </Button>
                      </div>
                    )}
                    <div className="space-y-4 pt-4 border-t border-gray-800 mt-4">
                      <div><Label htmlFor="garantias">Garantías</Label><Textarea id="garantias" value={solicitudFormData.garantias} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      <div><Label htmlFor="condiciones_desembolso">Condiciones de Desembolso</Label><Textarea id="condiciones_desembolso" value={solicitudFormData.condiciones_desembolso} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      <div><Label htmlFor="comentarios">Comentarios</Label><Textarea id="comentarios" value={solicitudFormData.comentarios} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="flex items-center text-white"><ShieldCheck className="h-5 w-5 mr-2 text-[#00FF80]" />Riesgo Vigente del Deudor</CardTitle></CardHeader>
                  <CardContent>
                    {top10kData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div><Label className="text-gray-400">RUC</Label><p className="font-mono text-white">{searchedFicha?.ruc}</p></div>
                        <div><Label className="text-gray-400">Sector</Label><p className="text-white">{top10kData.sector || 'N/A'}</p></div>
                        <div><Label className="text-gray-400">Facturado 2024 (Máx)</Label><p className="font-mono text-white">{formatCurrency(top10kData.facturado_2024_soles_maximo)}</p></div>
                        <div><Label className="text-gray-400">Facturado 2023 (Máx)</Label><p className="font-mono text-white">{formatCurrency(top10kData.facturado_2023_soles_maximo)}</p></div>
                        <div className="md:col-span-2"><Label className="text-gray-400">Giro (CIIU)</Label><p className="text-white text-sm">{top10kData.descripcion_ciiu_rev3 || 'N/A'}</p></div>
                        <div className="md:col-span-2"><Label className="text-gray-400">Ranking 2024</Label><p className="font-mono text-white text-lg">#{top10kData.ranking_2024 || 'N/A'}</p></div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500"><p>No se encontraron datos de riesgo en la base TOP 10K para este RUC.</p></div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="flex items-center text-white"><User className="h-5 w-5 mr-2 text-[#00FF80]" />Datos del deudor</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor="direccion">Dirección</Label><Input id="direccion" value={solicitudFormData.direccion} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      <div><Label htmlFor="visita">Visita</Label><Input id="visita" value={solicitudFormData.visita} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label htmlFor="contacto">Contacto</Label><Input id="contacto" value={solicitudFormData.contacto} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      <div><Label htmlFor="fianza">Fianza</Label><Input id="fianza" value={solicitudFormData.fianza} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">2. Completar Datos de la Solicitud</CardTitle></CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="status" className="text-gray-400">Estado de la Solicitud</Label>
                      <Select value={solicitudFormData.status} onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, status: value as SolicitudStatus }))} disabled={!isAdmin}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#121212] border-gray-800 text-white">
                          <SelectItem value="Borrador" className="hover:bg-gray-800">Borrador</SelectItem>
                          <SelectItem value="En Revisión" className="hover:bg-gray-800">En Revisión</SelectItem>
                          <SelectItem value="Completado" className="hover:bg-gray-800">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editingSolicitud && (
                      <CardFooter className="flex flex-col items-start space-y-4 text-sm text-gray-300 border-t border-gray-800 pt-4 mt-4">
                        <h4 className="font-semibold text-white">Detalles del Análisis Seleccionado</h4>
                        <div className="flex items-center gap-2">
                          <ClipboardCopy className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <span className="text-gray-400">ID de Expediente:</span>
                          <code className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{editingSolicitud.id}</code>
                          <Button variant="ghost" size="icon" onClick={handleCopyId} className="h-6 w-6 text-gray-400 hover:text-white">
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </div>
                        {creatorInfo && (
                          <div className="flex items-center gap-2"><User className="h-4 w-4 flex-shrink-0" /><span>Creado por: <strong className="text-gray-200">{creatorInfo.fullName || 'N/A'}</strong> ({creatorInfo.email || 'N/A'})</span></div>
                        )}
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4 flex-shrink-0" /><span>Fecha de creación: <strong className="text-gray-200">{new Date(editingSolicitud.created_at).toLocaleString('es-PE')}</strong></span></div>
                        <div className="flex items-center gap-2"><RefreshCw className="h-4 w-4 flex-shrink-0" /><span>Última modificación: <strong className="text-gray-200">{new Date(editingSolicitud.updated_at).toLocaleString('es-PE')}</strong></span></div>
                        <div className="w-full pt-2"><Label htmlFor="validado_por" className="font-semibold text-white">Validado por</Label><Input id="validado_por" value={solicitudFormData.validado_por || ''} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 mt-1" disabled={!isAdmin} /></div>
                        <div className="w-full pt-2"><Label htmlFor="status-edit" className="font-semibold text-white">Estado de Solicitud</Label><Select value={solicitudFormData.status} onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, status: value as SolicitudStatus }))} disabled={!isAdmin}><SelectTrigger id="status-edit" className="bg-gray-900/50 border-gray-700 mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Borrador">Borrador</SelectItem><SelectItem value="En Revisión">En Revisión</SelectItem><SelectItem value="Completado">Completado</SelectItem></SelectContent></Select></div>
                      </CardFooter>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={handleCancel} className="border-gray-700 text-gray-300"><XCircle className="h-4 w-4 mr-2" />Cancelar</Button>
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