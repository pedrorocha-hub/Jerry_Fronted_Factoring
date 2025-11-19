import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, FilePlus, Loader2, AlertCircle, FileText, ShieldCheck, User, Briefcase, XCircle, ArrowLeft, Calendar, RefreshCw, Trash2, Plus, ClipboardCopy, Layers, Percent, Clock, Wallet, MapPin, Phone, UserCheck, DollarSign } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FichaRuc } from '@/types/ficha-ruc';
import { SolicitudOperacion, SolicitudOperacionRiesgo, SolicitudOperacionWithRiesgos, SolicitudStatus, TipoProducto, TipoOperacion } from '@/types/solicitud-operacion';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import AuditLogViewer from '@/components/audit/AuditLogViewer';
import { AsyncCombobox, ComboboxOption } from '@/components/ui/async-combobox';
import DocumentChecklist from '@/components/solicitud-operacion/DocumentChecklist';

interface Top10kData {
  ruc: string;
  razon_social: string | null;
  descripcion_ciiu_rev3: string | null;
  sector: string | null;
  ranking_2024: number | null;
  ranking_2023: number | null;
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
  const [createWithoutRuc, setCreateWithoutRuc] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSolicitudId, setCreatedSolicitudId] = useState<string | null>(null);

  const [rucInput, setRucInput] = useState('');
  const [createProductType, setCreateProductType] = useState<TipoProducto | null>(null); // Nuevo estado para creación
  const [deudorRucInput, setDeudorRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchingDeudor, setSearchingDeudor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [top10kData, setTop10kData] = useState<Top10kData | null>(null);
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudOperacionWithRiesgos | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  
  // Estado para validación de documentos
  const [isDocumentationComplete, setIsDocumentationComplete] = useState(true);

  const [riesgoRows, setRiesgoRows] = useState<Partial<RiesgoRow>[]>([
    { lp: '', producto: '', deudor: '', lp_vigente_gve: '', riesgo_aprobado: '', propuesta_comercial: '', exposicion_total: '0' }
  ]);

  const [solicitudFormData, setSolicitudFormData] = useState({
    status: 'Borrador' as SolicitudStatus,
    tipo_producto: null as TipoProducto | null,
    tipo_operacion: null as TipoOperacion | null,
    direccion: '',
    visita: '',
    contacto: '',
    visita_tipo: 'Presencial' as 'Presencial' | 'Virtual' | 'No Realizada' | null,
    visita_fecha: '',
    visita_contacto_nombre: '',
    visita_contacto_cargo: '',
    
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
    validado_por: '',
    deudor_ruc: '',
    
    // Nuevos campos financieros (Punto 8 - Excel)
    porcentaje_anticipo: '',      // % Adelanto
    comision_estructuracion: '',  // Comisión (mínima)
    plazo_dias: '',               // Plazo (días)
    tasa_minima: '',              // Tasa (mínima)
    monto_original: '',           // Monto Original
    tasa_tea: '',                 // Tasa Global (% anual)
    tipo_garantia: '',
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
      tipo_producto: solicitud.tipo_producto,
      tipo_operacion: solicitud.tipo_operacion,
      direccion: solicitud.direccion || '',
      visita: solicitud.visita || '',
      contacto: solicitud.contacto || '',
      
      visita_tipo: solicitud.visita_tipo || 'Presencial',
      visita_fecha: solicitud.visita_fecha || '',
      visita_contacto_nombre: solicitud.visita_contacto_nombre || solicitud.contacto || '',
      visita_contacto_cargo: solicitud.visita_contacto_cargo || '',

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
      validado_por: solicitud.validado_por || '',
      deudor_ruc: (solicitud as any).deudor_ruc || '',
      
      // Cargar campos financieros
      porcentaje_anticipo: solicitud.porcentaje_anticipo?.toString() || '',
      comision_estructuracion: solicitud.comision_estructuracion?.toString() || '',
      plazo_dias: solicitud.plazo_dias?.toString() || '',
      tasa_minima: solicitud.tasa_minima?.toString() || '',
      monto_original: solicitud.monto_original?.toString() || '',
      tasa_tea: solicitud.tasa_tea?.toString() || '', // Tasa Global
      tipo_garantia: solicitud.tipo_garantia || '',
    });

    try {
      const fichaData = await FichaRucService.getByRuc(solicitud.ruc);
      if (fichaData) {
        setSearchedFicha(fichaData);
      } else {
        setSearchedFicha({
          id: 0,
          ruc: solicitud.ruc,
          nombre_empresa: solicitud.proveedor || 'Empresa Manual',
          actividad_empresa: 'N/A',
          created_at: solicitud.created_at,
          updated_at: solicitud.updated_at,
        } as FichaRuc);
        setCreateWithoutRuc(true);
      }
    } catch (err) {
      setSearchedFicha({
        id: 0,
        ruc: solicitud.ruc,
        nombre_empresa: solicitud.proveedor || 'Empresa Manual',
        actividad_empresa: 'N/A',
        created_at: solicitud.created_at,
        updated_at: solicitud.updated_at,
      } as FichaRuc);
      setCreateWithoutRuc(true);
    }

    if ((solicitud as any).deudor_ruc) {
      setDeudorRucInput((solicitud as any).deudor_ruc);
      await handleSearchDeudor((solicitud as any).deudor_ruc);
    }

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
    setDeudorRucInput('');
    setSearching(false);
    setSearchingDeudor(false);
    setSaving(false);
    setError(null);
    setSearchedFicha(null);
    setTop10kData(null);
    setEditingSolicitud(null);
    setCreatorInfo(null);
    setCreateProductType(null); // Reset del nuevo estado
    setRiesgoRows([{ lp: '', producto: '', deudor: '', lp_vigente_gve: '', riesgo_aprobado: '', propuesta_comercial: '', exposicion_total: '0' }]);
    setSolicitudFormData({
      status: 'Borrador',
      tipo_producto: null,
      tipo_operacion: null,
      direccion: '',
      visita: '',
      contacto: '',
      visita_tipo: 'Presencial',
      visita_fecha: '',
      visita_contacto_nombre: '',
      visita_contacto_cargo: '',
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
      validado_por: '',
      deudor_ruc: '',
      tasa_tea: '',
      plazo_dias: '',
      porcentaje_anticipo: '',
      comision_estructuracion: '',
      tipo_garantia: '',
      monto_original: '',
      tasa_minima: '',
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

    try {
      const fichaData = await FichaRucService.getByRuc(rucToSearch);
      if (fichaData) {
        setSearchedFicha(fichaData);
        setSolicitudFormData(prev => ({ ...prev, proveedor: fichaData.nombre_empresa }));
        if (!editingSolicitud) showSuccess('Ficha RUC encontrada.');
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

  const handleSearchDeudor = async (rucToSearch: string) => {
    if (!rucToSearch || rucToSearch.length !== 11) {
      showError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearchingDeudor(true);
    setTop10kData(null);

    try {
      const { data: topData, error: topError } = await supabase
        .from('top_10k')
        .select('ruc, razon_social, descripcion_ciiu_rev3, sector, ranking_2024, ranking_2023, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
        .eq('ruc', rucToSearch)
        .single();

      if (topError && topError.code !== 'PGRST116') {
        throw topError;
      }

      if (topData) {
        setTop10kData(topData);
        setSolicitudFormData(prev => ({ ...prev, deudor_ruc: rucToSearch }));
        showSuccess('Datos del deudor encontrados en TOP 10K.');
      } else {
        showError('No se encontraron datos para este RUC en la base TOP 10K.');
      }
    } catch (err) {
      showError('Error al buscar los datos del deudor.');
      console.error(err);
    } finally {
      setSearchingDeudor(false);
    }
  };

  const handleCreateAndRedirect = async () => {
    if (!rucInput || rucInput.length !== 11) {
      showError('Por favor, seleccione una empresa válida.');
      return;
    }
    if (!createProductType) {
      showError('Por favor, seleccione el Tipo de Producto (Factoring/Confirming).');
      return;
    }

    setSaving(true);
    try {
      const newSolicitud = await SolicitudOperacionService.create({ 
        ruc: rucInput, 
        status: 'Borrador',
        tipo_producto: createProductType // Incluimos el tipo seleccionado
      });
      showSuccess('Expediente creado. Redirigiendo a la página de edición...');
      navigate(`/solicitudes-operacion/edit/${newSolicitud.id}`);
    } catch (err) {
      console.error("Error creating solicitud:", err);
      showError('No se pudo crear el nuevo expediente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateWithoutRuc = () => {
    setCreateWithoutRuc(true);
    setSearchedFicha({} as FichaRuc);
    setSolicitudFormData(prev => ({
      ...prev,
      proveedor: '',
    }));
  };

  const handleSave = async () => {
    if (saving) return;
    if (!isAdmin) {
      showError('No tienes permisos para guardar la solicitud.');
      return;
    }

    // VALIDACIÓN DE DOCUMENTOS
    if (!isDocumentationComplete && solicitudFormData.status !== 'Borrador') {
      showError(
        `Faltan documentos imprescindibles para ${solicitudFormData.tipo_producto || 'el producto'}. ` +
        `Suba los documentos faltantes o mantenga el estado como Borrador.`
      );
      return;
    }

    const ruc = editingSolicitud?.ruc || searchedFicha?.ruc || rucInput;
    if (!ruc) {
      showError('Debe ingresar un RUC para guardar la solicitud.');
      return;
    }
    if (ruc.length !== 11) {
      showError('El RUC debe tener 11 dígitos.');
      return;
    }
    setSaving(true);
    try {
      const firstRiesgoRow = riesgoRows[0] || {};
      
      const { actividad, ...cleanFormData } = solicitudFormData as any;

      const dataToSave: Partial<SolicitudOperacion> & { deudor_ruc?: string } = {
        ...cleanFormData,
        ruc,
        // Asegurar que fecha vacía se envíe como null
        visita_fecha: solicitudFormData.visita_fecha || null,
        fecha_ficha: solicitudFormData.fecha_ficha || null,
        
        // Resto de campos
        tipo_cambio: parseFloat(solicitudFormData.tipo_cambio) || null,
        lp: firstRiesgoRow.lp || null,
        producto: firstRiesgoRow.producto || null,
        deudor: firstRiesgoRow.deudor || null,
        lp_vigente_gve: firstRiesgoRow.lp_vigente_gve || null,
        riesgo_aprobado: String(firstRiesgoRow.riesgo_aprobado || ''),
        propuesta_comercial: String(firstRiesgoRow.propuesta_comercial || ''),
        deudor_ruc: solicitudFormData.deudor_ruc || null,
        contacto: solicitudFormData.visita_contacto_nombre, 
        
        // Campos Financieros Numéricos
        porcentaje_anticipo: parseFloat(solicitudFormData.porcentaje_anticipo) || null,
        comision_estructuracion: parseFloat(solicitudFormData.comision_estructuracion) || null,
        plazo_dias: parseInt(solicitudFormData.plazo_dias) || null,
        tasa_minima: parseFloat(solicitudFormData.tasa_minima) || null,
        monto_original: parseFloat(solicitudFormData.monto_original) || null,
        tasa_tea: parseFloat(solicitudFormData.tasa_tea) || null, // Tasa Global
        tipo_garantia: solicitudFormData.tipo_garantia || null,
        
        // Asegurar que los tipos sean null si no están seleccionados (Borrador)
        tipo_producto: solicitudFormData.tipo_producto || null,
        tipo_operacion: solicitudFormData.tipo_operacion || null,
      };

      if (editingSolicitud) {
        await SolicitudOperacionService.update(editingSolicitud.id, dataToSave);
      } else if (createWithoutRuc) {
        const newSolicitud = await SolicitudOperacionService.create(dataToSave as any);
        setCreatedSolicitudId(newSolicitud.id);
        setShowSuccessModal(true);
        return;
      } else {
        const { data: existingRiesgos } = await supabase.from('solicitud_operacion_riesgos').select('id').eq('solicitud_id', editingSolicitud.id);
        const existingIds = existingRiesgos?.map(r => r.id) || [];
        const currentIds = riesgoRows.map(r => r.id).filter((id): id is string => !!id);
        const idsToDelete = existingIds.filter(id => !currentIds.includes(id));

        if (idsToDelete.length > 0) {
          await supabase.from('solicitud_operacion_riesgos').delete().in('id', idsToDelete);
        }

        const riesgosToUpsert = riesgoRows.map(row => {
          const record = {
            solicitud_id: editingSolicitud.id,
            lp: row.lp,
            producto: row.producto,
            deudor: row.deudor,
            lp_vigente_gve: row.lp_vigente_gve,
            riesgo_aprobado: parseFloat(row.riesgo_aprobado || '0') || null,
            propuesta_comercial: parseFloat(row.propuesta_comercial || '0') || null,
          };
          if (row.id) {
            return { ...record, id: row.id };
          }
          return record;
        });

        if (riesgosToUpsert.length > 0) {
          const { error: upsertError } = await supabase.from('solicitud_operacion_riesgos').upsert(riesgosToUpsert);
          if (upsertError) throw upsertError;
        }

        showSuccess('Solicitud actualizada exitosamente.');
        navigate('/solicitudes-operacion');
      }
    } catch (err: any) {
      console.error("Save error:", err);
      const errorMessage = err.message || (err instanceof Error ? err.message : 'Ocurrió un error desconocido al guardar.');
      showError(`No se pudo guardar: ${errorMessage}`);
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

  const searchFichas = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_ficha_ruc', {
      search_term: query,
    });
    if (error) {
      console.error('Error searching fichas ruc:', error);
      return [];
    }
    return data || [];
  };

  const searchTop10k = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_top_10k', {
      search_term: query,
    });
    if (error) {
      console.error('Error searching top 10k:', error);
      return [];
    }
    return (data || []).map((item: any) => ({
      value: item.ruc,
      label: `${item.razon_social} (${item.ruc})`
    }));
  };

  if (isCreateMode && !createWithoutRuc) {
    return (
      <Layout>
        <div className="min-h-screen bg-black p-6 flex items-center justify-center">
          <Card className="bg-[#121212] border border-gray-800 w-full max-w-2xl">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-white flex items-center text-xl">
                <FilePlus className="h-6 w-6 mr-3 text-[#00FF80]" />
                Crear Nuevo Expediente
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Seleccione cómo desea crear la solicitud de operación
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#00FF80] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <h3 className="text-white font-semibold">Buscar Empresa Existente</h3>
                  </div>
                  <p className="text-gray-400 text-sm ml-8">
                    Busque el RUC o nombre del proveedor en el sistema.
                  </p>
                  <div className="ml-8 space-y-3">
                    <AsyncCombobox
                      value={rucInput}
                      onChange={(value) => setRucInput(value || '')}
                      onSearch={searchFichas}
                      placeholder="Buscar por RUC o nombre de empresa..."
                      searchPlaceholder="Escriba para buscar..."
                      emptyMessage="No se encontraron empresas."
                    />
                    
                    {/* Selector de Producto Agregado Aquí */}
                    <div className="mt-3">
                      <Label className="text-gray-400 mb-1 block">Tipo de Producto *</Label>
                      <Select value={createProductType || undefined} onValueChange={(val) => setCreateProductType(val as TipoProducto)}>
                        <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                          <SelectValue placeholder="Seleccione Factoring o Confirming" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-gray-800 text-white">
                          <SelectItem value="FACTORING">Factoring</SelectItem>
                          <SelectItem value="CONFIRMING">Confirming</SelectItem>
                          <SelectItem value="LINEA">Línea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      onClick={handleCreateAndRedirect} 
                      disabled={saving || !rucInput || !createProductType} 
                      className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black w-full mt-4"
                      size="lg"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FilePlus className="h-4 w-4 mr-2" />
                      )}
                      Crear con Empresa Seleccionada
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#121212] text-gray-500">O</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <h3 className="text-white font-semibold">Crear Manualmente</h3>
                  </div>
                  <p className="text-gray-400 text-sm ml-8">
                    Complete el formulario sin necesidad de tener el RUC en el sistema.
                  </p>
                  <div className="ml-8">
                    <Button 
                      variant="outline" 
                      onClick={handleCreateWithoutRuc} 
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                      size="lg"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Llenar Formulario Manualmente
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/solicitudes-operacion')} 
                  className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  Cancelar
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
                  {createWithoutRuc ? 'Crear Solicitud de Operación (Sin RUC)' : (isAdmin ? 'Editar Solicitud de Operación' : 'Ver Solicitud de Operación')}
                </h1>
                <p className="text-gray-400">Reporte de Inicio Básico de empresa</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Columna izquierda: Checklist de documentos */}
            <div className="xl:col-span-1 order-2 xl:order-1">
               <DocumentChecklist 
                 ruc={searchedFicha?.ruc || rucInput}
                 tipoProducto={solicitudFormData.tipo_producto}
                 onValidationChange={setIsDocumentationComplete}
               />
            </div>

            {/* Columna derecha: Formulario */}
            <div className="xl:col-span-2 order-1 xl:order-2 space-y-6">
              {searchedFicha && (
                <div className="space-y-6">
                  {/* Tarjeta de Tipo de Operación y Producto */}
                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Layers className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Configuración de la Operación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tipo_producto" className="font-semibold text-white mb-2 block">Tipo de Producto</Label>
                          <Select 
                            value={solicitudFormData.tipo_producto || ''} 
                            onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, tipo_producto: value as TipoProducto }))}
                            disabled={!isAdmin}
                          >
                            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                              <SelectValue placeholder="Seleccionar Producto" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#121212] border-gray-800 text-white">
                              <SelectItem value="FACTORING">Factoring</SelectItem>
                              <SelectItem value="CONFIRMING">Confirming</SelectItem>
                              <SelectItem value="LINEA">Línea</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tipo_operacion" className="font-semibold text-white mb-2 block">Tipo de Operación</Label>
                          <Select 
                            value={solicitudFormData.tipo_operacion || ''} 
                            onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, tipo_operacion: value as TipoOperacion }))}
                            disabled={!isAdmin}
                          >
                            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                              <SelectValue placeholder="Seleccionar Tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#121212] border-gray-800 text-white">
                              <SelectItem value="PUNTUAL">Puntual</SelectItem>
                              <SelectItem value="LINEA">Línea</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader><CardTitle className="flex items-center text-white"><FileText className="h-5 w-5 mr-2 text-[#00FF80]" />Datos de la Solicitud</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label htmlFor="fecha_ficha">Fecha del día</Label><Input id="fecha_ficha" type="date" value={solicitudFormData.fecha_ficha} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                        <div>
                          <Label htmlFor="proveedor">Proveedor</Label>
                          <Input 
                            id="proveedor" 
                            value={createWithoutRuc ? solicitudFormData.proveedor : (searchedFicha?.nombre_empresa || '')} 
                            onChange={createWithoutRuc ? handleFormChange : undefined}
                            disabled={!createWithoutRuc} 
                            className={createWithoutRuc ? "bg-gray-900/50 border-gray-700" : "bg-gray-800 border-gray-700 text-gray-400"} 
                          />
                        </div>
                        <div>
                          <Label htmlFor="ruc_manual">Número de RUC</Label>
                          <Input 
                            id="ruc_manual" 
                            value={createWithoutRuc ? rucInput : (searchedFicha?.ruc || '')} 
                            onChange={createWithoutRuc ? (e) => setRucInput(e.target.value) : undefined}
                            disabled={!createWithoutRuc} 
                            className={createWithoutRuc ? "bg-gray-900/50 border-gray-700 font-mono" : "bg-gray-800 border-gray-700 text-gray-400 font-mono"}
                            maxLength={11}
                            placeholder="11 dígitos"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="actividad">Actividad</Label>
                        <Input 
                          id="actividad" 
                          value={createWithoutRuc ? (solicitudFormData as any).actividad || '' : (searchedFicha?.actividad_empresa || '')} 
                          onChange={createWithoutRuc ? (e) => setSolicitudFormData(prev => ({ ...prev, actividad: e.target.value } as any)) : undefined}
                          disabled={!createWithoutRuc} 
                          className={createWithoutRuc ? "bg-gray-900/50 border-gray-700" : "bg-gray-800 border-gray-700 text-gray-400"} 
                        />
                      </div>
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

                  {/* Nueva Tarjeta: CONDICIONES COMERCIALES (Ajustada al Excel) */}
                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Wallet className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Condiciones Comerciales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Fila 1: Campos del Excel en orden */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. % Adelanto */}
                        <div>
                          <Label htmlFor="porcentaje_anticipo" className="text-gray-300 flex items-center gap-2">
                            <Percent className="h-3 w-3" /> % Adelanto
                          </Label>
                          <Input 
                            id="porcentaje_anticipo" 
                            type="number" 
                            step="0.01"
                            max="100"
                            value={solicitudFormData.porcentaje_anticipo} 
                            onChange={handleFormChange} 
                            placeholder="Ej: 90"
                            className="bg-gray-900/50 border-gray-700" 
                            disabled={!isAdmin} 
                          />
                        </div>
                        {/* 2. Comisión (Mínima) */}
                        <div>
                          <Label htmlFor="comision_estructuracion" className="text-gray-300 flex items-center gap-2">
                            <Percent className="h-3 w-3" /> Comisión (Mínima)
                          </Label>
                          <Input 
                            id="comision_estructuracion" 
                            type="number" 
                            step="0.01"
                            value={solicitudFormData.comision_estructuracion} 
                            onChange={handleFormChange} 
                            placeholder="Ej: 0.30"
                            className="bg-gray-900/50 border-gray-700" 
                            disabled={!isAdmin} 
                          />
                        </div>
                        {/* 3. Plazo (Días) */}
                        <div>
                          <Label htmlFor="plazo_dias" className="text-gray-300 flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Plazo (Días)
                          </Label>
                          <Input 
                            id="plazo_dias" 
                            type="number" 
                            value={solicitudFormData.plazo_dias} 
                            onChange={handleFormChange} 
                            placeholder="Ej: 90"
                            className="bg-gray-900/50 border-gray-700" 
                            disabled={!isAdmin} 
                          />
                        </div>
                      </div>

                      {/* Fila 2: Resto de campos del Excel */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 4. Tasa (Mínima) */}
                        <div>
                          <Label htmlFor="tasa_minima" className="text-gray-300 flex items-center gap-2">
                            <Percent className="h-3 w-3" /> Tasa (Mínima)
                          </Label>
                          <Input 
                            id="tasa_minima" 
                            type="number" 
                            step="0.0001"
                            value={solicitudFormData.tasa_minima} 
                            onChange={handleFormChange} 
                            placeholder="Ej: 1.70"
                            className="bg-gray-900/50 border-gray-700" 
                            disabled={!isAdmin} 
                          />
                        </div>
                        {/* 5. Monto Original (USD/PEN) */}
                        <div>
                          <Label htmlFor="monto_original" className="text-gray-300 flex items-center gap-2">
                            <DollarSign className="h-3 w-3" /> Monto Original
                          </Label>
                          <Input 
                            id="monto_original" 
                            type="number" 
                            step="0.01"
                            value={solicitudFormData.monto_original} 
                            onChange={handleFormChange} 
                            placeholder="0.00"
                            className="bg-gray-900/50 border-gray-700" 
                            disabled={!isAdmin} 
                          />
                        </div>
                        {/* 6. Tasa Global (% anual) - Usamos tasa_tea */}
                        <div>
                          <Label htmlFor="tasa_tea" className="text-gray-300 flex items-center gap-2">
                            <Percent className="h-3 w-3" /> Tasa Global (% anual)
                          </Label>
                          <Input 
                            id="tasa_tea" 
                            type="number" 
                            step="0.0001"
                            value={solicitudFormData.tasa_tea} 
                            onChange={handleFormChange} 
                            placeholder="Ej: 20.50"
                            className="bg-gray-900/50 border-gray-700" 
                            disabled={!isAdmin} 
                          />
                        </div>
                      </div>

                      {/* Otras condiciones */}
                      <div className="pt-2">
                        <Label htmlFor="condiciones_desembolso" className="text-gray-300">Otras Condiciones (Texto Libre)</Label>
                        <Textarea 
                          id="condiciones_desembolso" 
                          value={solicitudFormData.condiciones_desembolso} 
                          onChange={handleFormChange} 
                          placeholder="Detalles adicionales sobre el desembolso..."
                          className="bg-gray-900/50 border-gray-700 min-h-[80px] mt-2" 
                          disabled={!isAdmin} 
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Riesgos Vigentes */}
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
                        <div><Label htmlFor="comentarios">Comentarios Generales</Label><Textarea id="comentarios" value={solicitudFormData.comentarios} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Datos del Deudor */}
                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader><CardTitle className="flex items-center text-white"><ShieldCheck className="h-5 w-5 mr-2 text-[#00FF80]" />Riesgo Vigente del Deudor</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-400">Buscar Deudor en TOP 10K</Label>
                        <div className="flex gap-2">
                          <AsyncCombobox
                            value={deudorRucInput}
                            onChange={(value) => setDeudorRucInput(value || '')}
                            onSearch={searchTop10k}
                            placeholder="Buscar por RUC o razón social..."
                            searchPlaceholder="Escriba para buscar..."
                            emptyMessage="No se encontraron empresas en TOP 10K."
                            className="flex-1"
                            disabled={!isAdmin}
                          />
                          <Button
                            onClick={() => handleSearchDeudor(deudorRucInput)}
                            disabled={searchingDeudor || !deudorRucInput || !isAdmin}
                            className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                          >
                            {searchingDeudor ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {top10kData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-800">
                          <div><Label className="text-gray-400">RUC</Label><p className="font-mono text-white">{top10kData.ruc}</p></div>
                          <div className="lg:col-span-3"><Label className="text-gray-400">Razón Social</Label><p className="text-white">{top10kData.razon_social || 'N/A'}</p></div>
                          <div><Label className="text-gray-400">Sector</Label><p className="text-white">{top10kData.sector || 'N/A'}</p></div>
                          <div><Label className="text-gray-400">Ranking 2024</Label><p className="font-mono text-white text-lg">#{top10kData.ranking_2024 || 'N/A'}</p></div>
                          <div><Label className="text-gray-400">Ranking 2023</Label><p className="font-mono text-white text-lg">#{top10kData.ranking_2023 || 'N/A'}</p></div>
                          <div><Label className="text-gray-400">Facturado 2024 (Máx)</Label><p className="font-mono text-white">{formatCurrency(top10kData.facturado_2024_soles_maximo)}</p></div>
                          <div><Label className="text-gray-400">Facturado 2023 (Máx)</Label><p className="font-mono text-white">{formatCurrency(top10kData.facturado_2023_soles_maximo)}</p></div>
                          <div className="md:col-span-2"><Label className="text-gray-400">Giro (CIIU)</Label><p className="text-white text-sm">{top10kData.descripcion_ciiu_rev3 || 'N/A'}</p></div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 border-t border-gray-800">
                          <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>Busque una empresa para ver sus datos de riesgo en TOP 10K</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader><CardTitle className="flex items-center text-white"><User className="h-5 w-5 mr-2 text-[#00FF80]" />Datos de Contacto y Visita Comercial</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      {/* Sección 1: Dirección Física */}
                      <div className="space-y-2">
                         <Label htmlFor="direccion" className="flex items-center gap-2 text-gray-300">
                           <MapPin className="h-4 w-4 text-[#00FF80]" /> Dirección Física
                         </Label>
                         <Input id="direccion" value={solicitudFormData.direccion} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} placeholder="Dirección completa de la empresa" />
                      </div>

                      {/* Sección 2: Detalles de la Visita (Reemplaza input simple 'visita') */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                         <div>
                           <Label htmlFor="visita_tipo" className="flex items-center gap-2 text-gray-300 mb-2">
                             <UserCheck className="h-4 w-4 text-[#00FF80]" /> Tipo de Visita
                           </Label>
                           <Select 
                             value={solicitudFormData.visita_tipo || 'Presencial'} 
                             onValueChange={(value: any) => setSolicitudFormData(prev => ({ ...prev, visita_tipo: value }))}
                             disabled={!isAdmin}
                           >
                             <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="bg-[#121212] border-gray-800 text-white">
                               <SelectItem value="Presencial">Presencial</SelectItem>
                               <SelectItem value="Virtual">Virtual (Zoom/Meet)</SelectItem>
                               <SelectItem value="No Realizada">No Realizada</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <Label htmlFor="visita_fecha" className="flex items-center gap-2 text-gray-300 mb-2">
                             <Calendar className="h-4 w-4 text-[#00FF80]" /> Fecha de Visita
                           </Label>
                           <Input 
                             id="visita_fecha" 
                             type="date" 
                             value={solicitudFormData.visita_fecha} 
                             onChange={handleFormChange} 
                             className="bg-gray-900/50 border-gray-700" 
                             disabled={!isAdmin} 
                           />
                         </div>
                      </div>

                      {/* Sección 3: Detalles del Contacto (Reemplaza input simple 'contacto') */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <div>
                          <Label htmlFor="visita_contacto_nombre" className="flex items-center gap-2 text-gray-300">
                            <User className="h-4 w-4 text-[#00FF80]" /> Nombre del Entrevistado
                          </Label>
                          <Input 
                            id="visita_contacto_nombre" 
                            value={solicitudFormData.visita_contacto_nombre} 
                            onChange={handleFormChange} 
                            className="bg-gray-900/50 border-gray-700 mt-2" 
                            disabled={!isAdmin} 
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div>
                          <Label htmlFor="visita_contacto_cargo" className="flex items-center gap-2 text-gray-300">
                            <Briefcase className="h-4 w-4 text-[#00FF80]" /> Cargo del Entrevistado
                          </Label>
                          <Input 
                            id="visita_contacto_cargo" 
                            value={solicitudFormData.visita_contacto_cargo} 
                            onChange={handleFormChange} 
                            className="bg-gray-900/50 border-gray-700 mt-2" 
                            disabled={!isAdmin} 
                            placeholder="Gerente General, Administrador, etc."
                          />
                        </div>
                      </div>

                      {/* Sección 4: Fianza (mantenida en este bloque temático) */}
                      <div className="pt-4 border-t border-gray-800">
                        <Label htmlFor="fianza">Fianza</Label>
                        <Input id="fianza" value={solicitudFormData.fianza} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 mt-2" disabled={!isAdmin} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader><CardTitle className="text-white">Gestión</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {editingSolicitud ? (
                        <>
                          <div className="flex flex-col space-y-4 text-sm text-gray-300">
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

                            <div className="w-full pt-4 border-t border-gray-800">
                              <AuditLogViewer solicitudId={editingSolicitud.id} />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-800">
                            <Label htmlFor="validado_por" className="font-semibold text-white">Validado por</Label>
                            <Input id="validado_por" value={solicitudFormData.validado_por || ''} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 mt-1" disabled={!isAdmin} />
                          </div>

                          <div>
                            <Label htmlFor="status-edit" className="font-semibold text-white">Estado de Solicitud</Label>
                            <Select value={solicitudFormData.status} onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, status: value as SolicitudStatus }))} disabled={!isAdmin}>
                              <SelectTrigger id="status-edit" className="bg-gray-900/50 border-gray-700 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#121212] border-gray-800 text-white">
                                <SelectItem value="Borrador" className="hover:bg-gray-800">Borrador</SelectItem>
                                <SelectItem value="En Revisión" className="hover:bg-gray-800">En Revisión</SelectItem>
                                <SelectItem value="Completado" className="hover:bg-gray-800">Completado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <Label htmlFor="validado_por_new" className="font-semibold text-white">Validado por</Label>
                            <Input id="validado_por_new" value={solicitudFormData.validado_por || ''} onChange={(e) => setSolicitudFormData(prev => ({ ...prev, validado_por: e.target.value }))} className="bg-gray-900/50 border-gray-700 mt-1" disabled={!isAdmin} placeholder="Nombre de quien valida" />
                          </div>

                          <div>
                            <Label htmlFor="status-new" className="font-semibold text-white">Estado de Solicitud</Label>
                            <Select value={solicitudFormData.status} onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, status: value as SolicitudStatus }))} disabled={!isAdmin}>
                              <SelectTrigger id="status-new" className="bg-gray-900/50 border-gray-700 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#121212] border-gray-800 text-white">
                                <SelectItem value="Borrador" className="hover:bg-gray-800">Borrador</SelectItem>
                                <SelectItem value="En Revisión" className="hover:bg-gray-800">En Revisión</SelectItem>
                                <SelectItem value="Completado" className="hover:bg-gray-800">Completado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
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
      </div>

      {/* Modal de éxito con ID */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-[#121212] border border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <FilePlus className="h-6 w-6 mr-3 text-[#00FF80]" />
              ¡Solicitud Creada Exitosamente!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Se ha generado una nueva solicitud de operación. Guarde el ID para futuras referencias.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <Label className="text-gray-400 text-sm">ID de Expediente</Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 text-sm bg-gray-800 text-[#00FF80] px-3 py-2 rounded font-mono break-all">
                  {createdSolicitudId}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (createdSolicitudId) {
                      navigator.clipboard.writeText(createdSolicitudId);
                      showSuccess('ID copiado al portapapeles');
                    }
                  }}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white shrink-0"
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Puede copiar este ID ahora o acceder a él más tarde desde la lista de solicitudes.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/solicitudes-operacion');
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Volver a la Lista
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (createdSolicitudId) {
                  navigate(`/solicitudes-operacion/edit/${createdSolicitudId}`);
                }
              }}
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
            >
              <FileText className="h-4 w-4 mr-2" />
              Editar Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SolicitudOperacionCreateEditPage;