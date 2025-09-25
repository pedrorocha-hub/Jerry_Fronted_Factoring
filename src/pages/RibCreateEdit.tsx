import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, FilePlus, Loader2, AlertCircle, CheckCircle, FileText, ShieldCheck, User, Briefcase, XCircle, ArrowLeft } from 'lucide-react';
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
import { Rib } from '@/types/rib';
import { RibService } from '@/services/ribService';
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

const getTodayDate = () => new Date().toISOString().split('T')[0];

const RibCreateEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useSession();

  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [top10kData, setTop10kData] = useState<Top10kData | null>(null);
  const [editingRib, setEditingRib] = useState<Rib | null>(null);
  const [ribFormData, setRibFormData] = useState({
    status: 'draft' as 'draft' | 'completed' | 'in_review',
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
      const loadRibForEdit = async () => {
        try {
          const ribData = await RibService.getById(id);
          if (ribData) {
            handleEditRib(ribData);
          } else {
            showError('No se encontró la ficha Rib para editar.');
            navigate('/rib');
          }
        } catch (err) {
          showError('Error al cargar la ficha Rib para editar.');
          navigate('/rib');
        }
      };
      loadRibForEdit();
    }
  }, [id, navigate]);

  useEffect(() => {
    const riesgo = parseFloat(ribFormData.riesgo_aprobado) || 0;
    const propuesta = parseFloat(ribFormData.propuesta_comercial) || 0;
    const total = riesgo + propuesta;
    const formattedTotal = total % 1 === 0 ? total.toString() : total.toFixed(2);
    setRibFormData(prev => ({ ...prev, exposicion_total: formattedTotal }));
  }, [ribFormData.riesgo_aprobado, ribFormData.propuesta_comercial]);

  const resetStateAndForm = () => {
    setRucInput('');
    setSearching(false);
    setSaving(false);
    setError(null);
    setSearchedFicha(null);
    setTop10kData(null);
    setEditingRib(null);
    setRibFormData({
      status: 'draft',
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
        setRibFormData(prev => ({
            ...prev,
            proveedor: fichaData.nombre_empresa,
        }));
        if (!editingRib) showSuccess('Ficha RUC encontrada.');

        const { data: topData, error: topError } = await supabase
          .from('top_10k')
          .select('descripcion_ciiu_rev3, sector, ranking_2024, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
          .eq('ruc', rucToSearch)
          .single();

        if (topError && topError.code !== 'PGRST116') throw topError;
        if (topData) setTop10kData(topData);

      } else {
        setError('Ficha RUC no encontrada. Asegúrese de que exista antes de crear un Rib.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar los datos de la empresa.');
      showError('Error al buscar los datos.');
    } finally {
      setSearching(false);
    }
  };

  const handleSaveRib = async () => {
    if (!isAdmin) {
      showError('No tienes permisos para guardar la ficha Rib.');
      return;
    }
    const ruc = editingRib?.ruc || searchedFicha?.ruc;
    if (!ruc) {
      showError('Debe haber una empresa seleccionada para guardar.');
      return;
    }
    setSaving(true);
    try {
      const parsedTipoCambio = parseFloat(ribFormData.tipo_cambio);
      const dataToSave = {
        ...ribFormData,
        tipo_cambio: isNaN(parsedTipoCambio) ? null : parsedTipoCambio,
      };

      if (editingRib) {
        await RibService.update(editingRib.id, { ruc, ...dataToSave });
        showSuccess('Ficha Rib actualizada exitosamente.');
      } else {
        await RibService.create({ ruc, ...dataToSave });
        showSuccess('Ficha Rib creada exitosamente.');
      }
      navigate('/rib');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      showError(`No se pudo guardar la ficha Rib: ${errorMessage}`);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setRibFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEditRib = (rib: Rib) => {
    setEditingRib(rib);
    setRucInput(rib.ruc);
    setRibFormData({
      status: rib.status,
      direccion: rib.direccion || '',
      visita: rib.visita || '',
      contacto: rib.contacto || '',
      comentarios: rib.comentarios || '',
      fianza: rib.fianza || '',
      lp: rib.lp || '',
      producto: rib.producto || '',
      proveedor: rib.proveedor || '',
      lp_vigente_gve: rib.lp_vigente_gve || '',
      riesgo_aprobado: rib.riesgo_aprobado || '',
      propuesta_comercial: rib.propuesta_comercial || '',
      exposicion_total: rib.exposicion_total || '',
      fecha_ficha: rib.fecha_ficha || getTodayDate(),
      orden_servicio: rib.orden_servicio || '',
      factura: rib.factura || '',
      tipo_cambio: rib.tipo_cambio?.toString() || '',
      moneda_operacion: rib.moneda_operacion || '',
      resumen_solicitud: rib.resumen_solicitud || '',
      deudor: rib.deudor || '',
      garantias: rib.garantias || '',
      condiciones_desembolso: rib.condiciones_desembolso || '',
    });
    handleSearch(rib.ruc);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    resetStateAndForm();
    navigate('/rib');
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
                onClick={() => navigate('/rib')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  {id ? 'Editar Ficha Rib' : 'Crear Ficha Rib'}
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
                        <Input id="fecha_ficha" type="date" value={ribFormData.fecha_ficha} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
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
                        <Input id="orden_servicio" value={ribFormData.orden_servicio} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="factura">Factura (Sí/No)</Label>
                        <Input id="factura" value={ribFormData.factura} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo_cambio">Tipo de Cambio</Label>
                        <Input id="tipo_cambio" type="number" step="0.01" value={ribFormData.tipo_cambio} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="moneda_operacion">Moneda de la Operación</Label>
                        <Select value={ribFormData.moneda_operacion} onValueChange={(value) => setRibFormData(prev => ({ ...prev, moneda_operacion: value }))} disabled={!isAdmin}>
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
                      <Textarea id="resumen_solicitud" value={ribFormData.resumen_solicitud} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
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
                        <Input id="lp" value={ribFormData.lp} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="producto">Producto</Label>
                        <Input id="producto" value={ribFormData.producto} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="deudor">Deudor (es)</Label>
                      <Input id="deudor" value={ribFormData.deudor} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lp_vigente_gve">L/P Vigente (GVE)</Label>
                        <Input id="lp_vigente_gve" value={ribFormData.lp_vigente_gve} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="riesgo_aprobado">Riesgo Aprobado</Label>
                        <Input id="riesgo_aprobado" type="number" step="0.01" value={ribFormData.riesgo_aprobado} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="propuesta_comercial">Propuesta Comercial</Label>
                        <Input id="propuesta_comercial" type="number" step="0.01" value={ribFormData.propuesta_comercial} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="exposicion_total">Exposición total (Soles)</Label>
                        <Input id="exposicion_total" value={ribFormData.exposicion_total} disabled className="bg-gray-800 border-gray-700 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="garantias">Garantías</Label>
                      <Textarea id="garantias" value={ribFormData.garantias} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                    <div>
                      <Label htmlFor="condiciones_desembolso">Condiciones de Desembolso</Label>
                      <Textarea id="condiciones_desembolso" value={ribFormData.condiciones_desembolso} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                    <div>
                      <Label htmlFor="comentarios">Comentarios</Label>
                      <Textarea id="comentarios" value={ribFormData.comentarios} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
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
                        <Input id="direccion" value={ribFormData.direccion} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="visita">Visita</Label>
                        <Input id="visita" value={ribFormData.visita} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contacto">Contacto</Label>
                        <Input id="contacto" value={ribFormData.contacto} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="fianza">Fianza</Label>
                        <Input id="fianza" value={ribFormData.fianza} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">2. Completar Datos del Rib</CardTitle></CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="status" className="text-gray-400">Estado de la Ficha Rib</Label>
                      <Select value={ribFormData.status} onValueChange={(value) => setRibFormData(prev => ({ ...prev, status: value as 'draft' | 'completed' | 'in_review' }))} disabled={!isAdmin}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-gray-800 text-white">
                          <SelectItem value="draft" className="hover:bg-gray-800">Borrador</SelectItem>
                          <SelectItem value="in_review" className="hover:bg-gray-800">En Revisión</SelectItem>
                          <SelectItem value="completed" className="hover:bg-gray-800">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    <Button onClick={handleSaveRib} disabled={saving} size="lg" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FilePlus className="h-4 w-4 mr-2" />}
                      {id ? 'Actualizar Ficha Rib' : 'Confirmar y Crear Ficha Rib'}
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

export default RibCreateEditPage;