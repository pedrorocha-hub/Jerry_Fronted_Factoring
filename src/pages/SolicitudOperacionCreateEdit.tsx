import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, FilePlus, Loader2, AlertCircle, FileText, ShieldCheck, User, Briefcase, XCircle, ArrowLeft, Calendar, RefreshCw, Trash2, Plus, Minus, ClipboardCopy, Layers, Percent, Clock, Wallet, MapPin, Phone, UserCheck, DollarSign, Handshake, History, Camera, ArrowRightLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import SolicitudDocumentManager from '@/components/solicitud-operacion/SolicitudDocumentManager';
import RibProcessWizard from '@/components/solicitud-operacion/RibProcessWizard';

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

// Helper function to format currency safely
const formatCurrency = (amount: number | string | null | undefined) => {
  if (amount === null || amount === undefined) return 'N/A';
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num)) return 'N/A';
  return new Intl.NumberFormat('es-PE', { 
    style: 'currency', 
    currency: 'PEN', 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(num);
};

const SolicitudOperacionCreateEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useSession();
  const isCreateMode = !id;
  const [createWithoutRuc, setCreateWithoutRuc] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSolicitudId, setCreatedSolicitudId] = useState<string | null>(null);

  const [rucInput, setRucInput] = useState('');
  const [searchSource, setSearchSource] = useState<'FICHA' | 'REPORTE'>('FICHA');
  const [createProductType, setCreateProductType] = useState<TipoProducto | null>(null);
  const [deudorRucInput, setDeudorRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchingDeudor, setSearchingDeudor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [top10kData, setTop10kData] = useState<Top10kData | null>(null);
  const [editingSolicitud, setEditingSolicitud] = useState<SolicitudOperacionWithRiesgos | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [primaryRole, setPrimaryRole] = useState<'PROVEEDOR' | 'DEUDOR'>('PROVEEDOR');
  
  const [isDocumentationComplete, setIsDocumentationComplete] = useState(true);
  const [docsRefreshTrigger, setDocsRefreshTrigger] = useState(0);

  // Estados de visibilidad de las secciones (Colapsables)
  const [isDatosSolicitudOpen, setIsDatosSolicitudOpen] = useState(false);
  const [isCondicionesOpen, setIsCondicionesOpen] = useState(false);
  const [isRelacionOpen, setIsRelacionOpen] = useState(false);
  const [isExperienciaOpen, setIsExperienciaOpen] = useState(false);
  const [isRiesgoProveedorOpen, setIsRiesgoProveedorOpen] = useState(false);
  const [isRiesgoDeudorOpen, setIsRiesgoDeudorOpen] = useState(false);
  const [isContactoOpen, setIsContactoOpen] = useState(false);

  const [riesgoRows, setRiesgoRows] = useState<Partial<RiesgoRow>[]>([
    { lp: '', producto: '', deudor: '', lp_vigente_gve: '', riesgo_aprobado: '', propuesta_comercial: '', exposicion_total: '0' }
  ]);

  const [solicitudFormData, setSolicitudFormData] = useState({
    status: 'Borrador' as SolicitudStatus,
    tipo_producto: null as TipoProducto | null,
    tipo_operacion: 'PUNTUAL' as TipoOperacion | null,
    direccion: '',
    visita: '',
    contacto: '',
    visita_tipo: 'Presencial' as 'Presencial' | 'Virtual' | 'No Realizada' | null,
    visita_fecha: '',
    visita_contacto_nombre: '',
    visita_contacto_cargo: '',
    
    actividad_manual: '',

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
    deudor: '', // Added deudor field
    
    // Campos financieros
    porcentaje_anticipo: '',
    comision_estructuracion: '',
    plazo_dias: '',
    tasa_minima: '',
    monto_original: '',
    tasa_tea: '',
    tipo_garantia: '',
    
    // NUEVOS CAMPOS RIB (Solicitados)
    valor_neto: '',
    vigencia_aprobacion: '',
    antiguedad_vinculo: '',
    volumen_estimado: '',
    condicion_pago_dias: '',
    experiencia_lcp: '' as 'Nueva' | 'Recurrente' | 'Con Mora' | '',
    check_pagos_observados: false,
    detalle_pagos_observados: ''
  });

  const handleDocumentUploaded = () => {
    // Increment trigger to reload document list
    setDocsRefreshTrigger(prev => prev + 1);
  };

  const handleEditSolicitud = useCallback(async (solicitud: SolicitudOperacionWithRiesgos) => {
    setEditingSolicitud(solicitud);
    setRucInput(solicitud.ruc);

    // Detectar rol: Si el campo proveedor está vacío O (deudor_ruc es igual al RUC principal), asumimos que el rol principal es DEUDOR
    // Ojo: En algunos casos podría tener ambos llenos si se completaron después. 
    // Una lógica simple: Si deudor_ruc == ruc, entonces el RUC principal actúa como deudor.
    if ((solicitud as any).deudor_ruc === solicitud.ruc) {
      setPrimaryRole('DEUDOR');
    } else {
      setPrimaryRole('PROVEEDOR');
    }

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
      // Abrir sección si tiene datos
      setIsRiesgoProveedorOpen(true);
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

    // Intentar cargar la ficha para obtener la actividad
    let actividadInicial = '';
    try {
      const fichaData = await FichaRucService.getByRuc(solicitud.ruc);
      if (fichaData) {
        setSearchedFicha(fichaData);
        actividadInicial = fichaData.actividad_empresa || '';
      } else {
        const nombreEmpresa = solicitud.proveedor || solicitud.deudor || 'Empresa Manual';
        setSearchedFicha({
          id: 0,
          ruc: solicitud.ruc,
          nombre_empresa: nombreEmpresa,
          actividad_empresa: 'N/A',
          created_at: solicitud.created_at,
          updated_at: solicitud.updated_at,
        } as FichaRuc);
        setCreateWithoutRuc(true);
      }
    } catch (err) {
      setCreateWithoutRuc(true);
    }

    setSolicitudFormData({
      status: solicitud.status || 'Borrador',
      tipo_producto: solicitud.tipo_producto,
      tipo_operacion: solicitud.tipo_operacion || 'PUNTUAL',
      direccion: solicitud.direccion || '',
      visita: solicitud.visita || '',
      contacto: solicitud.contacto || '',
      
      visita_tipo: solicitud.visita_tipo || 'Presencial',
      visita_fecha: solicitud.visita_fecha || '',
      visita_contacto_nombre: solicitud.visita_contacto_nombre || solicitud.contacto || '',
      visita_contacto_cargo: solicitud.visita_contacto_cargo || '',
      
      actividad_manual: actividadInicial,

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
      deudor: solicitud.deudor || '',
      
      porcentaje_anticipo: solicitud.porcentaje_anticipo?.toString() || '',
      comision_estructuracion: solicitud.comision_estructuracion?.toString() || '',
      plazo_dias: solicitud.plazo_dias?.toString() || '',
      tasa_minima: solicitud.tasa_minima?.toString() || '',
      monto_original: solicitud.monto_original?.toString() || '',
      tasa_tea: solicitud.tasa_tea?.toString() || '',
      tipo_garantia: solicitud.tipo_garantia || '',
      
      // NUEVOS CAMPOS
      valor_neto: solicitud.valor_neto?.toString() || '',
      vigencia_aprobacion: solicitud.vigencia_aprobacion || '',
      antiguedad_vinculo: solicitud.antiguedad_vinculo || '',
      volumen_estimado: solicitud.volumen_estimado?.toString() || '',
      condicion_pago_dias: solicitud.condicion_pago_dias?.toString() || '',
      experiencia_lcp: (solicitud.experiencia_lcp as any) || '',
      check_pagos_observados: solicitud.check_pagos_observados || false,
      detalle_pagos_observados: solicitud.detalle_pagos_observados || ''
    });

    // Abrir secciones si tienen datos relevantes
    if (solicitud.resumen_solicitud || solicitud.tipo_cambio || solicitud.moneda_operacion || solicitud.orden_servicio || solicitud.factura) {
      setIsDatosSolicitudOpen(true);
    }
    
    if (solicitud.monto_original || solicitud.tasa_tea || solicitud.comision_estructuracion) {
      setIsCondicionesOpen(true);
    }

    if (solicitud.antiguedad_vinculo || solicitud.volumen_estimado) {
      setIsRelacionOpen(true);
    }

    if (solicitud.experiencia_lcp) {
      setIsExperienciaOpen(true);
    }

    if (solicitud.direccion || solicitud.visita_contacto_nombre) {
      setIsContactoOpen(true);
    }

    if ((solicitud as any).deudor_ruc) {
      // Si el rol es DEUDOR, el RUC principal ya es el deudor, no necesitamos buscarlo de nuevo en la sección de riesgo deudor
      if (primaryRole !== 'DEUDOR') {
         setDeudorRucInput((solicitud as any).deudor_ruc);
         setIsRiesgoDeudorOpen(true);
         await handleSearchDeudor((solicitud as any).deudor_ruc);
      }
    }

    window.scrollTo(0, 0);
  }, [primaryRole]);

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

              if (!creatorError && creatorData && creatorData.length > 0) {
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
        
        // Rellenar datos según el rol seleccionado
        const newFormData = { ...solicitudFormData };
        if (primaryRole === 'PROVEEDOR') {
            newFormData.proveedor = fichaData.nombre_empresa;
        } else {
            newFormData.deudor = fichaData.nombre_empresa;
            newFormData.deudor_ruc = rucToSearch;
            newFormData.proveedor = ''; // Limpiar proveedor si se cambia a Deudor
        }
        newFormData.actividad_manual = fichaData.actividad_empresa || '';
        
        setSolicitudFormData(newFormData);
        if (!editingSolicitud) showSuccess('Ficha RUC encontrada.');
      } else {
        // Permitir flujo aunque no exista la ficha (para evitar bloqueos)
        setSearchedFicha({
            id: 0,
            ruc: rucToSearch,
            nombre_empresa: '',
            actividad_empresa: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as FichaRuc);
        setCreateWithoutRuc(true);
        showSuccess('Empresa no encontrada en BD, puede ingresar datos manualmente.');
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
      return; // Silently fail on invalid length to avoid spam
    }
    setSearchingDeudor(true);
    setTop10kData(null);

    try {
      const { data: topData, error: topError } = await supabase
        .from('top_10k')
        .select('ruc, razon_social, descripcion_ciiu_rev3, sector, ranking_2024, ranking_2023, facturado_2024_soles_maximo, facturado_2023_soles_maximo')
        .eq('ruc', rucToSearch)
        .limit(1)
        .maybeSingle();

      if (topError) {
        console.error("Top 10k search error:", topError);
        return;
      }

      if (topData) {
        setTop10kData(topData);
        setSolicitudFormData(prev => ({ ...prev, deudor_ruc: rucToSearch }));
        showSuccess('Datos del deudor encontrados en TOP 10K.');
      } else {
        // Optionally try to fetch from ficha_ruc if not in top 10k
        const ficha = await FichaRucService.getByRuc(rucToSearch);
        if (ficha) {
           setSolicitudFormData(prev => ({ ...prev, deudor_ruc: rucToSearch }));
        }
      }
    } catch (err) {
      console.error('Error al buscar los datos del deudor:', err);
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
      // Prepare data based on role
      const initialData: any = { 
        ruc: rucInput, 
        status: 'Borrador',
        tipo_producto: createProductType,
        tipo_operacion: 'PUNTUAL'
      };

      if (searchedFicha) {
        if (primaryRole === 'PROVEEDOR') {
           initialData.proveedor = searchedFicha.nombre_empresa || '';
        } else {
           initialData.deudor = searchedFicha.nombre_empresa || '';
           initialData.deudor_ruc = rucInput;
        }
      }

      const newSolicitud = await SolicitudOperacionService.create(initialData);
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
      actividad_manual: ''
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
      
      const { actividad_manual, ...cleanFormData } = solicitudFormData;

      // Guardar la actividad en Ficha RUC si es diferente
      if (actividad_manual && ruc) {
        try {
            const fichaData = {
                ruc: ruc,
                nombre_empresa: primaryRole === 'PROVEEDOR' ? cleanFormData.proveedor : cleanFormData.deudor,
                actividad_empresa: actividad_manual
            };
            const { error: fichaError } = await supabase
                .from('ficha_ruc')
                .upsert(fichaData, { onConflict: 'ruc' });
            if (fichaError) console.warn("Error updating ficha activity:", fichaError);
        } catch (e) {
            console.warn("Failed to update ficha activity", e);
        }
      }
      
      // Helper para convertir strings vacíos a null para campos numéricos
      const parseNumber = (value: string | number | null) => {
        if (value === '' || value === null || value === undefined) return null;
        const parsed = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(parsed) ? null : parsed;
      };
      
      const parseIntNullable = (value: string | number | null) => {
        if (value === '' || value === null || value === undefined) return null;
        const parsed = typeof value === 'string' ? parseInt(value, 10) : value;
        return isNaN(parsed) ? null : parsed;
      };

      const dataToSave: Partial<SolicitudOperacion> & { deudor_ruc?: string, observacion_pagos?: string } = {
        ...cleanFormData,
        ruc,
        visita_fecha: solicitudFormData.visita_fecha || null,
        fecha_ficha: solicitudFormData.fecha_ficha || null,
        
        tipo_cambio: parseNumber(solicitudFormData.tipo_cambio),
        lp: firstRiesgoRow.lp || null,
        producto: firstRiesgoRow.producto || null,
        
        // Use form data if not empty (manual overrides), otherwise risk row
        deudor: solicitudFormData.deudor || firstRiesgoRow.deudor || null,
        
        lp_vigente_gve: firstRiesgoRow.lp_vigente_gve || null,
        riesgo_aprobado: String(firstRiesgoRow.riesgo_aprobado || ''),
        propuesta_comercial: String(firstRiesgoRow.propuesta_comercial || ''),
        deudor_ruc: solicitudFormData.deudor_ruc || null,
        contacto: solicitudFormData.visita_contacto_nombre, 
        
        porcentaje_anticipo: parseNumber(solicitudFormData.porcentaje_anticipo),
        comision_estructuracion: parseNumber(solicitudFormData.comision_estructuracion),
        plazo_dias: parseIntNullable(solicitudFormData.plazo_dias),
        tasa_minima: parseNumber(solicitudFormData.tasa_minima),
        monto_original: parseNumber(solicitudFormData.monto_original),
        tasa_tea: parseNumber(solicitudFormData.tasa_tea), 
        tipo_garantia: solicitudFormData.tipo_garantia || null,
        
        valor_neto: parseNumber(solicitudFormData.valor_neto),
        vigencia_aprobacion: solicitudFormData.vigencia_aprobacion || null,
        antiguedad_vinculo: solicitudFormData.antiguedad_vinculo || null,
        volumen_estimado: parseNumber(solicitudFormData.volumen_estimado),
        condicion_pago_dias: parseIntNullable(solicitudFormData.condicion_pago_dias),
        experiencia_lcp: solicitudFormData.experiencia_lcp || null,
        check_pagos_observados: solicitudFormData.check_pagos_observados,
        observacion_pagos: solicitudFormData.detalle_pagos_observados || null,
        detalle_pagos_observados: solicitudFormData.detalle_pagos_observados || null,

        tipo_producto: solicitudFormData.tipo_producto || null,
        tipo_operacion: solicitudFormData.tipo_operacion || 'PUNTUAL',
      };

      if (editingSolicitud) {
        await SolicitudOperacionService.update(editingSolicitud.id, dataToSave);
      } else if (createWithoutRuc) {
        const newSolicitud = await SolicitudOperacionService.create(dataToSave as any);
        setCreatedSolicitudId(newSolicitud.id);
        setShowSuccessModal(true);
        return;
      } else {
        showSuccess('Solicitud actualizada exitosamente.');
        navigate('/solicitudes-operacion');
      }
      
      // Update risks if editing
      if (editingSolicitud) {
         const riesgosToUpsert = riesgoRows.map(row => ({
            id: row.id,
            solicitud_id: editingSolicitud.id,
            lp: row.lp,
            producto: row.producto,
            deudor: row.deudor,
            lp_vigente_gve: row.lp_vigente_gve,
            riesgo_aprobado: parseNumber(row.riesgo_aprobado),
            propuesta_comercial: parseNumber(row.propuesta_comercial),
          }));
          
          if (riesgosToUpsert.length > 0) {
             await supabase.from('solicitud_operacion_riesgos').upsert(riesgosToUpsert);
          }
      }

    } catch (err: any) {
      console.error("Save error:", err);
      showError(`No se pudo guardar: ${err.message}`);
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

  const searchFichas = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_ficha_ruc', {
      search_term: query,
    });
    if (error) return [];
    return data || [];
  };

  const searchReporteTributario = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_reporte_tributario', {
      search_term: query,
    });
    if (error) return [];
    return data || [];
  };

  const searchTop10k = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_top_10k', {
      search_term: query,
    });
    if (error) return [];
    return (data || []).map((item: any) => ({
      value: item.ruc,
      label: `${item.razon_social} (${item.ruc})`
    }));
  };

  const handleCancel = () => {
      navigate('/solicitudes-operacion');
  };

  const handleCopyId = () => {
      if (createdSolicitudId) {
          navigator.clipboard.writeText(createdSolicitudId);
          showSuccess('ID copiado');
      }
  };

  // Renders for create mode
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
                Seleccione cómo desea buscar la empresa o ingrese los datos manualmente
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#00FF80] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <h3 className="text-white font-semibold">Buscar Empresa Existente</h3>
                  </div>
                  
                  <div className="ml-8 space-y-4">
                    {/* NEW ROLE SELECTOR */}
                    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg mb-4">
                      <Label className="text-gray-400 mb-2 block">¿Qué rol cumple esta empresa?</Label>
                      <div className="flex gap-4">
                        <div 
                          className={`flex-1 cursor-pointer border rounded-md p-3 flex items-center justify-center gap-2 transition-colors ${primaryRole === 'PROVEEDOR' ? 'bg-[#00FF80]/10 border-[#00FF80] text-[#00FF80]' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                          onClick={() => { 
                            setPrimaryRole('PROVEEDOR'); 
                            setSolicitudFormData(prev => ({...prev, proveedor: searchedFicha?.nombre_empresa || '', deudor: ''})); 
                          }}
                        >
                          <Briefcase className="h-4 w-4" />
                          <span>Es Proveedor</span>
                        </div>
                        <div 
                          className={`flex-1 cursor-pointer border rounded-md p-3 flex items-center justify-center gap-2 transition-colors ${primaryRole === 'DEUDOR' ? 'bg-[#00FF80]/10 border-[#00FF80] text-[#00FF80]' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                          onClick={() => { 
                            setPrimaryRole('DEUDOR'); 
                            setSolicitudFormData(prev => ({...prev, deudor: searchedFicha?.nombre_empresa || '', proveedor: ''})); 
                          }}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span>Es Deudor</span>
                        </div>
                      </div>
                    </div>

                    <Tabs 
                      defaultValue="FICHA" 
                      value={searchSource} 
                      onValueChange={(val) => { 
                        setSearchSource(val as 'FICHA' | 'REPORTE'); 
                        setRucInput(''); 
                      }} 
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800">
                        <TabsTrigger 
                          value="FICHA" 
                          className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black text-gray-400"
                        >
                          En Fichas RUC
                        </TabsTrigger>
                        <TabsTrigger 
                          value="REPORTE" 
                          className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black text-gray-400"
                        >
                          En Reportes Trib.
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="mt-4">
                        {searchSource === 'FICHA' ? (
                          <AsyncCombobox
                            key="search-ficha"
                            value={rucInput}
                            onChange={(value) => setRucInput(value || '')}
                            onSearch={searchFichas}
                            placeholder="Buscar por RUC o Nombre en Fichas RUC..."
                            searchPlaceholder="Escriba RUC o Razón Social..."
                            emptyMessage="No se encontraron en Fichas RUC."
                          />
                        ) : (
                          <AsyncCombobox
                            key="search-reporte"
                            value={rucInput}
                            onChange={(value) => setRucInput(value || '')}
                            onSearch={searchReporteTributario}
                            placeholder="Buscar por RUC o Razón Social en Reportes..."
                            searchPlaceholder="Escriba RUC o Razón Social..."
                            emptyMessage="No se encontraron en Reportes Tributarios."
                          />
                        )}
                      </div>
                    </Tabs>
                    
                    <div className="mt-4 p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
                      <Label className="text-gray-400 mb-2 block">Tipo de Producto *</Label>
                      <Select value={createProductType || undefined} onValueChange={(val) => setCreateProductType(val as TipoProducto)}>
                        <SelectTrigger className="bg-gray-900 border-gray-700 text-white w-full">
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
                      className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black w-full mt-2"
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
                   <div className="ml-8">
                    <Button variant="outline" onClick={handleCreateWithoutRuc} className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white" size="lg">
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
                  {createWithoutRuc ? 'Crear Solicitud (Manual)' : (isAdmin ? 'Editar Solicitud' : 'Ver Solicitud')}
                </h1>
                <p className="text-gray-400">Reporte de Inicio Básico de empresa</p>
              </div>
            </div>
          </div>
          
          {/* WIZARD PROCESS INDICATOR */}
          <RibProcessWizard solicitudId={id} currentStep="solicitud" />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Columna izquierda: Checklist y Documentos */}
            <div className="xl:col-span-1 order-2 xl:order-1 space-y-6">
               <DocumentChecklist 
                 ruc={searchedFicha?.ruc || rucInput}
                 tipoProducto={solicitudFormData.tipo_producto}
                 onValidationChange={setIsDocumentationComplete}
                 solicitudId={id || createdSolicitudId || undefined} 
                 onDocumentUploaded={handleDocumentUploaded}
               />

               {editingSolicitud && (
                 <SolicitudDocumentManager 
                   solicitudId={editingSolicitud.id}
                   readonly={!isAdmin}
                   refreshTrigger={docsRefreshTrigger}
                 />
               )}
               {!editingSolicitud && (
                 <Card className="bg-[#121212] border border-gray-800 opacity-70">
                    <CardContent className="p-6 text-center text-gray-500">
                      <p className="text-sm">Guarde la solicitud primero para adjuntar documentos, sustentos y fotos de visita.</p>
                    </CardContent>
                 </Card>
               )}
            </div>

            {/* Columna derecha: Formulario Principal */}
            <div className="xl:col-span-2 order-1 xl:order-2 space-y-6">
              {searchedFicha && (
                <div className="space-y-6">
                  
                  {/* Configuración de la Operación */}
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
                            value={solicitudFormData.tipo_operacion || 'PUNTUAL'} 
                            onValueChange={(value) => setSolicitudFormData(prev => ({ ...prev, tipo_operacion: value as TipoOperacion }))}
                            disabled={!isAdmin}
                          >
                            <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                              <SelectValue placeholder="Seleccionar Tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#121212] border-gray-800 text-white">
                              <SelectItem value="PUNTUAL">Puntual (Factura)</SelectItem>
                              <SelectItem value="LINEA">Línea (Contrato)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Datos de la Solicitud */}
                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="flex items-center text-white">
                        <FileText className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Datos de la Solicitud
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsDatosSolicitudOpen(!isDatosSolicitudOpen)} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        {isDatosSolicitudOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {isDatosSolicitudOpen && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div><Label htmlFor="fecha_ficha">Fecha del día</Label><Input id="fecha_ficha" type="date" value={solicitudFormData.fecha_ficha} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label htmlFor="proveedor">
                                  {primaryRole === 'PROVEEDOR' ? 'Proveedor (Principal)' : 'Deudor (Principal)'}
                                </Label>
                                {isAdmin && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-4 px-1 text-xs text-[#00FF80] hover:text-[#00FF80]"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setPrimaryRole(current => {
                                          const next = current === 'PROVEEDOR' ? 'DEUDOR' : 'PROVEEDOR';
                                          
                                          setSolicitudFormData(prev => {
                                              const mainName = searchedFicha?.nombre_empresa || '';
                                              
                                              if (next === 'DEUDOR') {
                                                  // Switching to Deudor Mode
                                                  return {
                                                      ...prev,
                                                      deudor: mainName,
                                                      proveedor: (prev as any).deudor || '', // Move current counterparty to proveedor field
                                                      deudor_ruc: rucInput
                                                  };
                                              } else {
                                                  // Switching to Proveedor Mode
                                                  return {
                                                      ...prev,
                                                      proveedor: mainName,
                                                      deudor: prev.proveedor || '', // Move current counterparty to deudor field
                                                      deudor_ruc: '' // Clear main RUC from deudor_ruc
                                                  };
                                              }
                                          });
                                          return next;
                                      });
                                    }}
                                    title="Cambiar rol principal"
                                  >
                                    <ArrowRightLeft className="h-3 w-3 mr-1" />
                                    Cambiar Rol
                                  </Button>
                                )}
                            </div>
                            <Input 
                              id={primaryRole === 'PROVEEDOR' ? 'proveedor' : 'deudor'} 
                              value={createWithoutRuc ? (primaryRole === 'PROVEEDOR' ? solicitudFormData.proveedor : (solicitudFormData as any).deudor) : (searchedFicha?.nombre_empresa || '')} 
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

                        {/* Si el rol principal es Deudor, permitir agregar Proveedor manualmente o viceversa */}
                        {primaryRole === 'DEUDOR' && (
                           <div className="pt-2">
                             <Label htmlFor="proveedor">Contraparte (Proveedor)</Label>
                             <Input 
                                id="proveedor"
                                value={solicitudFormData.proveedor || ''}
                                onChange={handleFormChange}
                                placeholder="Ingrese el nombre del proveedor..."
                                className="bg-gray-900/50 border-gray-700 mt-1"
                                disabled={!isAdmin}
                             />
                           </div>
                        )}

                        <div>
                          <Label htmlFor="actividad_manual">Actividad Empresarial</Label>
                          <Input 
                            id="actividad_manual" 
                            value={solicitudFormData.actividad_manual} 
                            onChange={handleFormChange} 
                            placeholder="Giro del negocio"
                            className="bg-gray-900/50 border-gray-700 text-white"
                          />
                        </div>
                        {/* Moneda y Cambio */}
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
                    )}
                  </Card>

                  {/* Condiciones Comerciales */}
                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="flex items-center text-white">
                        <Wallet className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Condiciones Comerciales
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsCondicionesOpen(!isCondicionesOpen)} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        {isCondicionesOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {isCondicionesOpen && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="monto_original" className="text-gray-300 flex items-center gap-2">
                              <DollarSign className="h-3 w-3" /> Monto Original (Valor Facial)
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
                          <div>
                            <Label htmlFor="valor_neto" className="text-gray-300 flex items-center gap-2">
                              <DollarSign className="h-3 w-3" /> Valor Neto a Financiar
                            </Label>
                            <Input 
                              id="valor_neto" 
                              type="number" 
                              step="0.01"
                              value={solicitudFormData.valor_neto} 
                              onChange={handleFormChange} 
                              placeholder="Valor Facial - Detracciones"
                              className="bg-gray-900/50 border-gray-700" 
                              disabled={!isAdmin} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="vigencia_aprobacion" className="text-gray-300 flex items-center gap-2">
                              <Clock className="h-3 w-3" /> Vigencia Aprobación
                            </Label>
                            <Input 
                              id="vigencia_aprobacion" 
                              value={solicitudFormData.vigencia_aprobacion} 
                              onChange={handleFormChange} 
                              placeholder="30 días / 12 meses"
                              className="bg-gray-900/50 border-gray-700" 
                              disabled={!isAdmin} 
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="porcentaje_anticipo" className="text-gray-300 text-xs mb-1 block">% Anticipo</Label>
                            <Input id="porcentaje_anticipo" type="number" value={solicitudFormData.porcentaje_anticipo} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" />
                          </div>
                          <div>
                            <Label htmlFor="tasa_minima" className="text-gray-300 text-xs mb-1 block">Tasa (%)</Label>
                            <Input id="tasa_minima" type="number" step="0.01" value={solicitudFormData.tasa_minima} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" />
                          </div>
                          <div>
                            <Label htmlFor="plazo_dias" className="text-gray-300 text-xs mb-1 block">Plazo (Días)</Label>
                            <Input id="plazo_dias" type="number" value={solicitudFormData.plazo_dias} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" />
                          </div>
                          <div>
                            <Label htmlFor="comision_estructuracion" className="text-gray-300 text-xs mb-1 block">Comisión (%)</Label>
                            <Input id="comision_estructuracion" type="number" step="0.01" value={solicitudFormData.comision_estructuracion} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" />
                          </div>
                        </div>

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
                    )}
                  </Card>
                  
                  {/* Relación Comercial */}
                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="flex items-center text-white">
                        <Handshake className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Relación Comercial
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsRelacionOpen(!isRelacionOpen)} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        {isRelacionOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {isRelacionOpen && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="antiguedad_vinculo" className="text-gray-300">Antigüedad del Vínculo</Label>
                              <Input id="antiguedad_vinculo" value={solicitudFormData.antiguedad_vinculo} onChange={handleFormChange} placeholder="Ej: 3 años" className="bg-gray-900/50 border-gray-700" />
                            </div>
                            <div>
                              <Label htmlFor="volumen_estimado" className="text-gray-300">Volumen Estimado (Facturación)</Label>
                              <Input id="volumen_estimado" type="number" value={solicitudFormData.volumen_estimado} onChange={handleFormChange} placeholder="0.00" className="bg-gray-900/50 border-gray-700" />
                            </div>
                            <div>
                              <Label htmlFor="condicion_pago_dias" className="text-gray-300">Condición de Pago (Días)</Label>
                              <Input id="condicion_pago_dias" type="number" value={solicitudFormData.condicion_pago_dias} onChange={handleFormChange} placeholder="Ej: 45" className="bg-gray-900/50 border-gray-700" />
                            </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Experiencia de Pago */}
                   <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="flex items-center text-white">
                        <History className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Experiencia de Pago
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsExperienciaOpen(!isExperienciaOpen)} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        {isExperienciaOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {isExperienciaOpen && (
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="experiencia_lcp" className="text-gray-300">Experiencia en LCP</Label>
                              <Select 
                                  value={solicitudFormData.experiencia_lcp || ''} 
                                  onValueChange={(val) => setSolicitudFormData(prev => ({...prev, experiencia_lcp: val as any}))}
                              >
                                <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                <SelectContent className="bg-[#121212] border-gray-800">
                                  <SelectItem value="Nueva">Primera Operación</SelectItem>
                                  <SelectItem value="Recurrente">Recurrente</SelectItem>
                                  <SelectItem value="Con Mora">Con Mora</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center space-x-2 pt-4">
                                  <Checkbox 
                                    id="check_pagos_observados" 
                                    checked={solicitudFormData.check_pagos_observados}
                                    onCheckedChange={(checked) => setSolicitudFormData(prev => ({...prev, check_pagos_observados: checked as boolean}))}
                                  />
                                  <Label htmlFor="check_pagos_observados" className="text-white">Pagos observados con sustento</Label>
                              </div>
                              {solicitudFormData.check_pagos_observados && (
                                <Input 
                                  id="detalle_pagos_observados" 
                                  value={solicitudFormData.detalle_pagos_observados} 
                                  onChange={handleFormChange}
                                  placeholder="Detalle breve de la observación..."
                                  className="bg-gray-900/50 border-gray-700"
                                />
                              )}
                            </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="flex items-center text-white"><Briefcase className="h-5 w-5 mr-2 text-[#00FF80]" />Riesgo Vigente del Proveedor</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsRiesgoProveedorOpen(!isRiesgoProveedorOpen)} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        {isRiesgoProveedorOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {isRiesgoProveedorOpen && (
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
                          <div><Label htmlFor="comentarios">Comentarios Generales</Label><Textarea id="comentarios" value={solicitudFormData.comentarios} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} /></div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Datos del Deudor */}
                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="flex items-center text-white"><ShieldCheck className="h-5 w-5 mr-2 text-[#00FF80]" />Riesgo Vigente del Deudor</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsRiesgoDeudorOpen(!isRiesgoDeudorOpen)} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        {isRiesgoDeudorOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {isRiesgoDeudorOpen && (
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
                    )}
                  </Card>

                  <Card className="bg-[#121212] border border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="flex items-center text-white"><User className="h-5 w-5 mr-2 text-[#00FF80]" />Datos de Contacto y Visita Comercial</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setIsContactoOpen(!isContactoOpen)} className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        {isContactoOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </CardHeader>
                    {isContactoOpen && (
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

                        {/* Sección 3: Detalles del Contacto */}
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
                        
                        {/* Sección 4: Evidencia (Fotos) - Placeholder para el Upload Manager */}
                        {editingSolicitud && (
                          <div className="pt-4 border-t border-gray-800">
                             <Label className="flex items-center gap-2 text-gray-300 mb-2">
                               <Camera className="h-4 w-4 text-[#00FF80]" /> Evidencia de Visita (Fotos/Actas)
                             </Label>
                             <div className="bg-gray-900/30 border border-dashed border-gray-700 p-4 rounded-lg">
                               <p className="text-sm text-gray-500 mb-2">
                                 Utilice el panel de "Documentación y Evidencias" a la izquierda para subir fotos de la visita.
                                 Seleccione el tipo "Fotos/Evidencia Visita".
                               </p>
                             </div>
                          </div>
                        )}

                      </CardContent>
                    )}
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
      
       {/* Modal de éxito */}
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