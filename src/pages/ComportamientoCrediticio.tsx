import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, TrendingUp, Plus, Edit, Trash2, ArrowLeft, User, Calendar, Clock, FileText, Check } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FichaRuc } from '@/types/ficha-ruc';
import { ComportamientoCrediticio, ComportamientoCrediticioInsert, ComportamientoCrediticioUpdate, CrediticioStatus } from '@/types/comportamientoCrediticio';
import { FichaRucService } from '@/services/fichaRucService';
import { ComportamientoCrediticioService } from '@/services/comportamientoCrediticioService';
import { Sentinel } from '@/services/sentinelService';
import { showSuccess, showError } from '@/utils/toast';
import { toast } from 'sonner';
import { useSession } from '@/contexts/SessionContext';
import ComportamientoCrediticioTable from '@/components/comportamiento-crediticio/ComportamientoCrediticioTable';
import { supabase } from '@/integrations/supabase/client';
import ExperienciaPagoManager from '@/components/comportamiento-crediticio/ExperienciaPagoManager';
import { AsyncCombobox, ComboboxOption } from '@/components/ui/async-combobox';
import ComportamientoCrediticioAuditLogViewer from '@/components/audit/ComportamientoCrediticioAuditLogViewer';
import { cn } from '@/lib/utils';

interface ReporteWithDetails extends ComportamientoCrediticio {
  nombre_empresa?: string;
  creator_name?: string;
}

const getStatusColor = (status: CrediticioStatus | null | undefined) => {
  switch (status) {
    case 'Aprobado': return 'bg-green-500/20 text-green-400';
    case 'En revisión': return 'bg-yellow-500/20 text-yellow-400';
    case 'Rechazado': return 'bg-red-500/20 text-red-400';
    case 'Borrador': default: return 'bg-gray-500/20 text-gray-400';
  }
};

const ComportamientoCrediticioPage = () => {
  const { isAdmin } = useSession();
  const [view, setView] = useState<'list' | 'search_results' | 'form' | 'create_mode'>('list');
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createWithoutRuc, setCreateWithoutRuc] = useState(false);
  
  const [allReports, setAllReports] = useState<ReporteWithDetails[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [existingReports, setExistingReports] = useState<ReporteWithDetails[]>([]);
  const [selectedReport, setSelectedReport] = useState<ComportamientoCrediticio | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<{ fullName: string | null; email: string | null } | null>(null);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  // Estados para el dropdown de sugerencias del proveedor
  const [searchSuggestions, setSearchSuggestions] = useState<FichaRuc[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const modalSearchInputRef = useRef<HTMLInputElement>(null);
  const modalSuggestionsRef = useRef<HTMLDivElement>(null);

  // Estados para el dropdown de sugerencias del deudor
  const [deudorSearchSuggestions, setDeudorSearchSuggestions] = useState<FichaRuc[]>([]);
  const [showDeudorSuggestions, setShowDeudorSuggestions] = useState(false);
  const [loadingDeudorSuggestions, setLoadingDeudorSuggestions] = useState(false);
  const [selectedDeudorSuggestionIndex, setSelectedDeudorSuggestionIndex] = useState(-1);
  const deudorSearchInputRef = useRef<HTMLInputElement>(null);
  const deudorSuggestionsRef = useRef<HTMLDivElement>(null);

  const emptyForm = {
    proveedor: '', deudor: '', equifax_score: '', sentinel_score: '', equifax_calificacion: '',
    sentinel_calificacion: '', equifax_deuda_directa: '', sentinel_deuda_directa: '',
    equifax_deuda_indirecta: '', sentinel_deuda_indirecta: '', equifax_impagos: '',
    sentinel_impagos: '', equifax_deuda_sunat: '', sentinel_deuda_sunat: '',
    equifax_protestos: '', sentinel_protestos: '', validado_por: '',
    status: 'Borrador' as CrediticioStatus, apefac_descripcion: '', comentarios: '',
    solicitud_id: null as string | null,
  };

  const emptyDeudorForm = {
    proveedor: '', deudor: '', equifax_score: '', sentinel_score: '', equifax_calificacion: '',
    sentinel_calificacion: '', equifax_deuda_directa: '', sentinel_deuda_directa: '',
    equifax_deuda_indirecta: '', sentinel_deuda_indirecta: '', equifax_impagos: '',
    sentinel_impagos: '', equifax_deuda_sunat: '', sentinel_deuda_sunat: '',
    equifax_protestos: '', sentinel_protestos: '', validado_por: '',
    status: 'Borrador' as CrediticioStatus, apefac_descripcion: '',
  };

  const [formData, setFormData] = useState(emptyForm);
  const [initialFormData, setInitialFormData] = useState(emptyForm);
  const [formDataDeudor, setFormDataDeudor] = useState(emptyDeudorForm);
  const [initialFormDataDeudor, setInitialFormDataDeudor] = useState(emptyDeudorForm);
  const [isDirty, setIsDirty] = useState(false);
  
  // Estados iniciales para detectar cambios en modo manual
  const [initialSearchedFicha, setInitialSearchedFicha] = useState<{ ruc: string; nombre_empresa: string } | null>(null);

  useEffect(() => {
    loadAllReports();
  }, []);

  useEffect(() => {
    let hasChanges = 
      JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      JSON.stringify(formDataDeudor) !== JSON.stringify(initialFormDataDeudor);
    
    // Si estamos en modo manual, también verificar cambios en RUC y nombre_empresa
    if (createWithoutRuc && searchedFicha && initialSearchedFicha) {
      hasChanges = hasChanges || 
        searchedFicha.ruc !== initialSearchedFicha.ruc ||
        searchedFicha.nombre_empresa !== initialSearchedFicha.nombre_empresa;
    }
    
    setIsDirty(hasChanges);
  }, [formData, initialFormData, formDataDeudor, initialFormDataDeudor, createWithoutRuc, searchedFicha, initialSearchedFicha]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideMain = 
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node);

      const isOutsideModal = 
        modalSuggestionsRef.current &&
        !modalSuggestionsRef.current.contains(event.target as Node) &&
        modalSearchInputRef.current &&
        !modalSearchInputRef.current.contains(event.target as Node);

      const isOutsideDeudor =
        deudorSuggestionsRef.current &&
        !deudorSuggestionsRef.current.contains(event.target as Node) &&
        deudorSearchInputRef.current &&
        !deudorSearchInputRef.current.contains(event.target as Node);

      if (isOutsideMain && isOutsideModal) {
        setShowSuggestions(false);
      }
      
      if (isOutsideDeudor) {
        setShowDeudorSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda de sugerencias en tiempo real para proveedor
  useEffect(() => {
    const searchSuggestionsDebounced = async () => {
      const trimmedInput = rucInput.trim();
      
      if (trimmedInput.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase
          .from('ficha_ruc')
          .select('*')
          .or(`ruc.ilike.%${trimmedInput}%,nombre_empresa.ilike.%${trimmedInput}%`)
          .limit(5);

        if (error) throw error;
        setSearchSuggestions(data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error buscando sugerencias:', err);
        setSearchSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchSuggestionsDebounced, 300);
    return () => clearTimeout(debounceTimer);
  }, [rucInput]);

  // Búsqueda de sugerencias en tiempo real para deudor
  useEffect(() => {
    const searchDeudorSuggestionsDebounced = async () => {
      const trimmedInput = formDataDeudor.deudor.trim();
      
      if (trimmedInput.length < 2) {
        setDeudorSearchSuggestions([]);
        setShowDeudorSuggestions(false);
        return;
      }

      setLoadingDeudorSuggestions(true);
      try {
        const { data, error } = await supabase
          .from('ficha_ruc')
          .select('*')
          .or(`ruc.ilike.%${trimmedInput}%,nombre_empresa.ilike.%${trimmedInput}%`)
          .limit(5);

        if (error) throw error;
        setDeudorSearchSuggestions(data || []);
        setShowDeudorSuggestions(true);
      } catch (err) {
        console.error('Error buscando sugerencias de deudor:', err);
        setDeudorSearchSuggestions([]);
      } finally {
        setLoadingDeudorSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchDeudorSuggestionsDebounced, 300);
    return () => clearTimeout(debounceTimer);
  }, [formDataDeudor.deudor]);

  const loadAllReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await ComportamientoCrediticioService.getAll();
      if (reports.length > 0) {
        const rucs = [...new Set(reports.map(r => r.ruc))];
        const { data: fichasData, error: fichasError } = await supabase.from('ficha_ruc').select('ruc, nombre_empresa').in('ruc', rucs);
        if (fichasError) throw fichasError;
        const rucToNameMap = new Map(fichasData.map(f => [f.ruc, f.nombre_empresa]));

        const userIds = [...new Set(reports.map(r => r.user_id).filter((id): id is string => !!id))];
        let userMap = new Map<string, string>();
        if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
            if (profilesError) throw profilesError;
            profilesData.forEach(p => userMap.set(p.id, p.full_name || ''));
        }

        const enrichedReports = reports.map(report => ({
          ...report,
          // Usar nombre_empresa del reporte si existe (creado manualmente), sino buscar en ficha_ruc
          nombre_empresa: report.nombre_empresa || rucToNameMap.get(report.ruc) || 'Razón Social no encontrada',
          creator_name: report.user_id ? userMap.get(report.user_id) || 'Desconocido' : 'Sistema',
        }));
        setAllReports(enrichedReports);
      } else {
        setAllReports([]);
      }
    } catch (err) {
      showError('No se pudieron cargar los reportes.');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim() === '') {
      setError('Por favor, ingrese un RUC o nombre de empresa para buscar.');
      return;
    }
    
    setSearching(true);
    setError(null);
    
    try {
      let fichaData: FichaRuc | null = null;
      const trimmedSearch = searchTerm.trim();
      
      // Intentar buscar por RUC si es numérico y tiene 11 dígitos
      if (/^\d{11}$/.test(trimmedSearch)) {
        fichaData = await FichaRucService.getByRuc(trimmedSearch);
      }
      
      // Si no se encontró por RUC o no es un RUC válido, buscar por nombre
      if (!fichaData) {
        const { data, error } = await supabase
          .from('ficha_ruc')
          .select('*')
          .ilike('nombre_empresa', `%${trimmedSearch}%`)
          .limit(1)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        fichaData = data;
      }
      
      if (fichaData) {
        setSearchedFicha(fichaData);
        const reports = await ComportamientoCrediticioService.getByRuc(fichaData.ruc);
        
        // Enriquecer datos de los reportes
        if (reports.length > 0) {
          const userIds = [...new Set(reports.map(r => r.user_id).filter((id): id is string => !!id))];
          let userMap = new Map<string, string>();
          if (userIds.length > 0) {
            const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
            profilesData?.forEach(p => userMap.set(p.id, p.full_name || ''));
          }

          const enrichedReports = reports.map(report => ({
            ...report,
            nombre_empresa: fichaData.nombre_empresa,
            creator_name: report.user_id ? userMap.get(report.user_id) || 'Desconocido' : 'Sistema',
          }));
          setExistingReports(enrichedReports);
        } else {
          setExistingReports([]);
        }
        
        setView('search_results');
      } else {
        setError('No se encontró ninguna empresa con ese RUC o nombre. Puede crear un reporte manualmente.');
        showError('Empresa no encontrada en el sistema.');
      }
    } catch (err) {
      setError('Error al buscar la empresa.');
      showError('Error al buscar la empresa.');
      console.error('Error en búsqueda:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateNew = async () => {
    if (!searchedFicha) return;
    
    const { data: sentinelData } = await supabase.from('sentinel').select('*').eq('ruc', searchedFicha.ruc).order('created_at', { ascending: false }).limit(1).maybeSingle();
    
    if (sentinelData) {
      toast.success('Datos de Sentinel encontrados para autocompletar.');
    } else {
      toast.info('No se encontraron datos de Sentinel para autocompletar.');
    }

    const newReport: ComportamientoCrediticio = {
      id: '',
      ruc: searchedFicha.ruc,
      proveedor: searchedFicha.nombre_empresa,
      status: 'Borrador',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: null,
      solicitud_id: null,
      equifax_score: null, sentinel_score: null, equifax_calificacion: null, sentinel_calificacion: null,
      equifax_deuda_directa: null, sentinel_deuda_directa: null, equifax_deuda_indirecta: null, sentinel_deuda_indirecta: null,
      equifax_impagos: null, sentinel_impagos: null, equifax_deuda_sunat: null, sentinel_deuda_sunat: null,
      equifax_protestos: null, sentinel_protestos: null, validado_por: null, apefac_descripcion: null, comentarios: null,
      deudor: null, deudor_equifax_score: null, deudor_sentinel_score: null, deudor_equifax_calificacion: null,
      deudor_sentinel_calificacion: null, deudor_equifax_deuda_directa: null, deudor_sentinel_deuda_directa: null,
      deudor_equifax_deuda_indirecta: null, deudor_sentinel_deuda_indirecta: null, deudor_equifax_impagos: null,
      deudor_sentinel_impagos: null, deudor_equifax_deuda_sunat: null, deudor_sentinel_deuda_sunat: null,
      deudor_equifax_protestos: null, deudor_sentinel_protestos: null, deudor_apefac_descripcion: null, deudor_comentarios: null,
    };

    await handleSelectReport(newReport, sentinelData);
    setView('form');
  };

  const handleEditFromSearchResults = async (report: ComportamientoCrediticio) => {
    await handleSelectReport(report, null);
    setView('form');
  };

  const handleSelectReport = async (report: ComportamientoCrediticio, sentinelData?: Sentinel | null) => {
    setSelectedReport(report);
    
    const formatSentinelScore = (score: string | null | undefined) => {
      if (!score) return '';
      // Si ya tiene /1000, no lo agregues de nuevo
      const scoreStr = score.toString();
      if (scoreStr.includes('/1000')) return scoreStr;
      return `${scoreStr}/1000`;
    };

    setInitialSolicitudLabel(null);
    if (report.solicitud_id) {
        const { data: solicitud } = await supabase
            .from('solicitudes_operacion')
            .select('id, ruc, created_at')
            .eq('id', report.solicitud_id)
            .single();
        if (solicitud) {
            const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).single();
            setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
        }
    }

    const newFormData = {
      proveedor: report.proveedor || '',
      deudor: '',
      equifax_score: report.equifax_score || '',
      sentinel_score: formatSentinelScore(sentinelData?.score || report.sentinel_score),
      equifax_calificacion: report.equifax_calificacion || '',
      sentinel_calificacion: sentinelData?.comportamiento_calificacion || report.sentinel_calificacion || '',
      equifax_deuda_directa: report.equifax_deuda_directa?.toString() || '',
      sentinel_deuda_directa: (sentinelData?.deuda_directa ?? report.sentinel_deuda_directa)?.toString() || '',
      equifax_deuda_indirecta: report.equifax_deuda_indirecta?.toString() || '',
      sentinel_deuda_indirecta: (sentinelData?.deuda_indirecta ?? report.sentinel_deuda_indirecta)?.toString() || '',
      equifax_impagos: report.equifax_impagos?.toString() || '',
      sentinel_impagos: (sentinelData?.impagos ?? report.sentinel_impagos)?.toString() || '',
      equifax_deuda_sunat: report.equifax_deuda_sunat?.toString() || '',
      sentinel_deuda_sunat: (sentinelData?.deudas_sunat ?? report.sentinel_deuda_sunat)?.toString() || '',
      equifax_protestos: report.equifax_protestos?.toString() || '',
      sentinel_protestos: (sentinelData?.protestos ?? report.sentinel_protestos)?.toString() || '',
      validado_por: report.validado_por || '',
      status: report.status || 'Borrador',
      apefac_descripcion: report.apefac_descripcion || '',
      comentarios: report.comentarios || '',
      solicitud_id: report.solicitud_id || null,
    };
    setFormData(newFormData);
    setInitialFormData(newFormData);

    const newFormDataDeudor = {
      proveedor: '',
      deudor: report.deudor || '',
      equifax_score: report.deudor_equifax_score || '',
      sentinel_score: formatSentinelScore(report.deudor_sentinel_score),
      equifax_calificacion: report.deudor_equifax_calificacion || '',
      sentinel_calificacion: report.deudor_sentinel_calificacion || '',
      equifax_deuda_directa: report.deudor_equifax_deuda_directa?.toString() || '',
      sentinel_deuda_directa: report.deudor_sentinel_deuda_directa?.toString() || '',
      equifax_deuda_indirecta: report.deudor_equifax_deuda_indirecta?.toString() || '',
      sentinel_deuda_indirecta: report.deudor_sentinel_deuda_indirecta?.toString() || '',
      equifax_impagos: report.deudor_equifax_impagos?.toString() || '',
      sentinel_impagos: report.deudor_sentinel_impagos?.toString() || '',
      equifax_deuda_sunat: report.deudor_equifax_deuda_sunat?.toString() || '',
      sentinel_deuda_sunat: report.deudor_sentinel_deuda_sunat?.toString() || '',
      equifax_protestos: report.deudor_equifax_protestos?.toString() || '',
      sentinel_protestos: report.deudor_sentinel_protestos?.toString() || '',
      validado_por: '',
      status: 'Borrador' as CrediticioStatus,
      apefac_descripcion: report.deudor_apefac_descripcion || '',
    };
    setFormDataDeudor(newFormDataDeudor);
    setInitialFormDataDeudor(newFormDataDeudor);

    setCreatorDetails(null);
    if (report.user_id) {
      try {
        const { data, error } = await supabase.rpc('get_user_details', { user_id_input: report.user_id });
        if (error) throw error;
        if (data && data.length > 0) {
          setCreatorDetails({ fullName: data[0].full_name, email: data[0].email });
        }
      } catch (err) {
        console.error("Error fetching creator details:", err);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { id: string, value: any } }) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleDeudorFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const fieldName = id.startsWith('deudor_') ? id.substring(7) : id;
    setFormDataDeudor(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = async () => {
    if (!searchedFicha) return;
    
    // Validación: Solicitud de Operación es obligatoria
    if (!formData.solicitud_id || formData.solicitud_id.trim() === '') {
      showError('Debe asociar el reporte a una Solicitud de Operación.');
      return;
    }
    
    // Validación para modo manual
    if (createWithoutRuc) {
      if (!searchedFicha.ruc || searchedFicha.ruc.trim() === '') {
        showError('El RUC es obligatorio.');
        return;
      }
      if (searchedFicha.ruc.length !== 11) {
        showError('El RUC debe tener 11 dígitos.');
        return;
      }
      if (!searchedFicha.nombre_empresa || searchedFicha.nombre_empresa.trim() === '') {
        showError('La razón social es obligatoria.');
        return;
      }
    }
    
    setSaving(true);
    try {
      const dataToSave: ComportamientoCrediticioUpdate = {
        ruc: searchedFicha.ruc,
        nombre_empresa: createWithoutRuc ? searchedFicha.nombre_empresa : null,
        proveedor: formData.proveedor,
        solicitud_id: formData.solicitud_id || null,
        equifax_score: formData.equifax_score || null,
        sentinel_score: formData.sentinel_score || null,
        equifax_calificacion: formData.equifax_calificacion || null,
        sentinel_calificacion: formData.sentinel_calificacion || null,
        equifax_deuda_directa: parseFloat(formData.equifax_deuda_directa) || null,
        sentinel_deuda_directa: parseFloat(formData.sentinel_deuda_directa) || null,
        equifax_deuda_indirecta: parseFloat(formData.equifax_deuda_indirecta) || null,
        sentinel_deuda_indirecta: parseFloat(formData.sentinel_deuda_indirecta) || null,
        equifax_impagos: parseFloat(formData.equifax_impagos) || null,
        sentinel_impagos: parseFloat(formData.sentinel_impagos) || null,
        equifax_deuda_sunat: parseFloat(formData.equifax_deuda_sunat) || null,
        sentinel_deuda_sunat: parseFloat(formData.sentinel_deuda_sunat) || null,
        equifax_protestos: parseFloat(formData.equifax_protestos) || null,
        sentinel_protestos: parseFloat(formData.sentinel_protestos) || null,
        validado_por: formData.validado_por || null,
        status: formData.status,
        apefac_descripcion: formData.apefac_descripcion || null,
        comentarios: formData.comentarios || null,

        deudor: formDataDeudor.deudor || null,
        deudor_equifax_score: formDataDeudor.equifax_score || null,
        deudor_sentinel_score: formDataDeudor.sentinel_score || null,
        deudor_equifax_calificacion: formDataDeudor.equifax_calificacion || null,
        deudor_sentinel_calificacion: formDataDeudor.sentinel_calificacion || null,
        deudor_equifax_deuda_directa: parseFloat(formDataDeudor.equifax_deuda_directa) || null,
        deudor_sentinel_deuda_directa: parseFloat(formDataDeudor.sentinel_deuda_directa) || null,
        deudor_equifax_deuda_indirecta: parseFloat(formDataDeudor.equifax_deuda_indirecta) || null,
        deudor_sentinel_deuda_indirecta: parseFloat(formDataDeudor.sentinel_deuda_indirecta) || null,
        deudor_equifax_impagos: parseFloat(formDataDeudor.equifax_impagos) || null,
        deudor_sentinel_impagos: parseFloat(formDataDeudor.sentinel_impagos) || null,
        deudor_equifax_deuda_sunat: parseFloat(formDataDeudor.equifax_deuda_sunat) || null,
        deudor_sentinel_deuda_sunat: parseFloat(formDataDeudor.sentinel_deuda_sunat) || null,
        deudor_equifax_protestos: parseFloat(formDataDeudor.equifax_protestos) || null,
        deudor_sentinel_protestos: parseFloat(formDataDeudor.sentinel_protestos) || null,
        deudor_apefac_descripcion: formDataDeudor.apefac_descripcion || null,
      };

      if (selectedReport && selectedReport.id) {
        await ComportamientoCrediticioService.update(selectedReport.id, dataToSave);
        showSuccess('Reporte actualizado.');
      } else {
        const newReport = await ComportamientoCrediticioService.create(dataToSave as ComportamientoCrediticioInsert);
        setSelectedReport(newReport);
        showSuccess('Reporte creado.');
      }
      
      // Actualizar el estado inicial después de guardar exitosamente
      if (createWithoutRuc && searchedFicha) {
        setInitialSearchedFicha({
          ruc: searchedFicha.ruc,
          nombre_empresa: searchedFicha.nombre_empresa
        });
      }
      
      // Solo buscar y refrescar existingReports si NO es modo manual
      if (!createWithoutRuc && searchedFicha.ruc) {
        await handleSearch(searchedFicha.ruc);
      }
      
      await loadAllReports();
    } catch (err) {
      showError('Error al guardar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este reporte?')) {
      try {
        await ComportamientoCrediticioService.delete(id);
        showSuccess('Reporte eliminado.');
        await loadAllReports();
        if (selectedReport?.id === id) {
          handleBackToList();
        }
      } catch (err) {
        showError('Error al eliminar el reporte.');
      }
    }
  };

  const handleBackToList = () => {
    if (isDirty && !window.confirm('Hay cambios sin guardar. ¿Desea descartarlos?')) return;
    setView('list');
    setSearchedFicha(null);
    setRucInput('');
    setError(null);
    setExistingReports([]);
    setSelectedReport(null);
    setFormData(emptyForm);
    setInitialFormData(emptyForm);
    setFormDataDeudor(emptyDeudorForm);
    setInitialFormDataDeudor(emptyDeudorForm);
    setCreateWithoutRuc(false);
  };

  const handleEditFromList = async (report: ReporteWithDetails) => {
    setSearching(true);
    setError(null);
    try {
      // Intentar buscar la ficha RUC
      const fichaData = await FichaRucService.getByRuc(report.ruc);
      
      if (fichaData) {
        // Reporte con ficha RUC existente
        setSearchedFicha(fichaData);
        setCreateWithoutRuc(false);
        setInitialSearchedFicha(null); // No necesitamos rastrear cambios en ficha existente
      } else {
        // Reporte creado manualmente sin ficha RUC
        const manualFicha = {
          id: 0,
          ruc: report.ruc,
          nombre_empresa: report.nombre_empresa || 'Empresa Manual',
          actividad_empresa: '',
          created_at: report.created_at,
          updated_at: report.updated_at,
        } as FichaRuc;
        setSearchedFicha(manualFicha);
        setCreateWithoutRuc(true);
        setRucInput(report.ruc);
        // Guardar estado inicial para detectar cambios
        setInitialSearchedFicha({ 
          ruc: report.ruc, 
          nombre_empresa: report.nombre_empresa || 'Empresa Manual' 
        });
      }
      
      await handleSelectReport(report, null);
      setView('form');
    } catch (err) {
      // Si hay error al buscar, asumir que es manual
      const manualFicha = {
        id: 0,
        ruc: report.ruc,
        nombre_empresa: report.nombre_empresa || 'Empresa Manual',
        actividad_empresa: '',
        created_at: report.created_at,
        updated_at: report.updated_at,
      } as FichaRuc;
      setSearchedFicha(manualFicha);
      setCreateWithoutRuc(true);
      setRucInput(report.ruc);
      // Guardar estado inicial para detectar cambios
      setInitialSearchedFicha({ 
        ruc: report.ruc, 
        nombre_empresa: report.nombre_empresa || 'Empresa Manual' 
      });
      
      await handleSelectReport(report, null);
      setView('form');
    } finally {
      setSearching(false);
    }
  };

  const handleShowCreateMode = () => {
    setView('create_mode');
    setRucInput('');
    setSearchedFicha(null);
    setExistingReports([]);
    setSelectedReport(null);
    setError(null);
  };

  const handleCreateManually = () => {
    setCreateWithoutRuc(true);
    setError(null); // Limpiar cualquier error previo
    setRucInput(''); // Limpiar el input de búsqueda
    
    const emptyFicha = {
      id: 0,
      ruc: '',
      nombre_empresa: '',
      actividad_empresa: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as FichaRuc;
    setSearchedFicha(emptyFicha);
    
    // Guardar el estado inicial para detectar cambios
    setInitialSearchedFicha({ ruc: '', nombre_empresa: '' });
    
    // Crear un nuevo reporte vacío sin buscar Sentinel (ya que no hay RUC)
    const newReport: ComportamientoCrediticio = {
      id: '',
      ruc: '',
      nombre_empresa: null,
      proveedor: '',
      status: 'Borrador',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: null,
      solicitud_id: null,
      equifax_score: null, sentinel_score: null, equifax_calificacion: null, sentinel_calificacion: null,
      equifax_deuda_directa: null, sentinel_deuda_directa: null, equifax_deuda_indirecta: null, sentinel_deuda_indirecta: null,
      equifax_impagos: null, sentinel_impagos: null, equifax_deuda_sunat: null, sentinel_deuda_sunat: null,
      equifax_protestos: null, sentinel_protestos: null, validado_por: null, apefac_descripcion: null, comentarios: null,
      deudor: null, deudor_equifax_score: null, deudor_sentinel_score: null, deudor_equifax_calificacion: null,
      deudor_sentinel_calificacion: null, deudor_equifax_deuda_directa: null, deudor_sentinel_deuda_directa: null,
      deudor_equifax_deuda_indirecta: null, deudor_sentinel_deuda_indirecta: null, deudor_equifax_impagos: null,
      deudor_sentinel_impagos: null, deudor_equifax_deuda_sunat: null, deudor_sentinel_deuda_sunat: null,
      deudor_equifax_protestos: null, deudor_sentinel_protestos: null, deudor_apefac_descripcion: null, deudor_comentarios: null,
    };
    
    handleSelectReport(newReport, null);
    setView('form');
  };

  const handleSearchAndCreate = async () => {
    await handleSearch(rucInput);
  };

  const handleSelectSuggestion = async (ficha: FichaRuc) => {
    setRucInput(ficha.ruc);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    await handleSearch(ficha.ruc);
  };

  const autocompleteSentinelData = async (ruc: string, isDeudor: boolean = false) => {
    try {
      const { data: sentinelData } = await supabase
        .from('sentinel')
        .select('*')
        .eq('ruc', ruc)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sentinelData) {
        const formatSentinelScore = (score: string | null | undefined) => {
          if (!score) return '';
          const scoreStr = score.toString();
          if (scoreStr.includes('/1000')) return scoreStr;
          return `${scoreStr}/1000`;
        };

        if (isDeudor) {
          // Autocompletar datos del deudor
          setFormDataDeudor(prev => ({
            ...prev,
            sentinel_score: formatSentinelScore(sentinelData.score),
            sentinel_calificacion: sentinelData.comportamiento_calificacion || '',
            sentinel_deuda_directa: sentinelData.deuda_directa?.toString() || '',
            sentinel_deuda_indirecta: sentinelData.deuda_indirecta?.toString() || '',
            sentinel_impagos: sentinelData.impagos?.toString() || '',
            sentinel_deuda_sunat: sentinelData.deudas_sunat?.toString() || '',
            sentinel_protestos: sentinelData.protestos?.toString() || '',
          }));
          toast.success('Datos de Sentinel encontrados para el deudor.');
        } else {
          // Autocompletar datos del proveedor
          setFormData(prev => ({
            ...prev,
            sentinel_score: formatSentinelScore(sentinelData.score),
            sentinel_calificacion: sentinelData.comportamiento_calificacion || '',
            sentinel_deuda_directa: sentinelData.deuda_directa?.toString() || '',
            sentinel_deuda_indirecta: sentinelData.deuda_indirecta?.toString() || '',
            sentinel_impagos: sentinelData.impagos?.toString() || '',
            sentinel_deuda_sunat: sentinelData.deudas_sunat?.toString() || '',
            sentinel_protestos: sentinelData.protestos?.toString() || '',
          }));
          toast.success('Datos de Sentinel encontrados para el proveedor.');
        }
      } else {
        if (isDeudor) {
          toast.info('No se encontraron datos de Sentinel para el deudor.');
        } else {
          toast.info('No se encontraron datos de Sentinel para el proveedor.');
        }
      }
    } catch (err) {
      console.error('Error buscando datos de Sentinel:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(rucInput);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectSuggestion(searchSuggestions[selectedSuggestionIndex]);
        } else {
          handleSearch(rucInput);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleSelectDeudorSuggestion = async (ficha: FichaRuc) => {
    setFormDataDeudor(prev => ({ ...prev, deudor: ficha.nombre_empresa }));
    setShowDeudorSuggestions(false);
    setSelectedDeudorSuggestionIndex(-1);
    
    // Buscar y autocompletar datos de Sentinel para el deudor
    await autocompleteSentinelData(ficha.ruc, true);
  };

  const handleDeudorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDeudorSuggestions || deudorSearchSuggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDeudorSuggestionIndex((prev) =>
          prev < deudorSearchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDeudorSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedDeudorSuggestionIndex >= 0) {
          handleSelectDeudorSuggestion(deudorSearchSuggestions[selectedDeudorSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowDeudorSuggestions(false);
        setSelectedDeudorSuggestionIndex(-1);
        break;
    }
  };

  const searchSolicitudes = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];

    const { data, error } = await supabase.rpc('search_solicitudes', {
      search_term: query,
    });

    if (error) {
      console.error('Error searching solicitudes:', error);
      return [];
    }

    return data || [];
  };

  const formFields = [
    { id: 'calificacion', label: 'Calificación', type: 'text' },
    { id: 'deuda_directa', label: 'Deuda Directa Bancos', type: 'number' },
    { id: 'deuda_indirecta', label: 'Deuda Indirecta Bancos', type: 'number' },
    { id: 'impagos', label: 'Impagos', type: 'number' },
    { id: 'deuda_sunat', label: 'Deuda SUNAT', type: 'number' },
    { id: 'protestos', label: 'Protestos', type: 'number' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-[#00FF80]" />
              Comportamiento Crediticio
            </h1>
            {view !== 'list' && (
              <Button variant="outline" onClick={handleBackToList} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            )}
          </div>

          {view === 'list' && (
            <>
              <div className="flex justify-end mb-4">
                {isAdmin && (
                  <Button
                    onClick={handleShowCreateMode}
                    className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Reporte
                  </Button>
                )}
              </div>
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Buscar Empresa Proveedor por RUC o Nombre</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">
                    Busque la empresa proveedor existente en el sistema por RUC (11 dígitos) o por razón social
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <Input 
                      ref={searchInputRef}
                      placeholder="Ej: 20123456789 o EMPRESA SAC" 
                      value={rucInput} 
                      onChange={(e) => setRucInput(e.target.value)} 
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (searchSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      className="pl-10 bg-gray-900/50 border-gray-700" 
                    />
                    
                    {/* Dropdown de sugerencias */}
                    {showSuggestions && (searchSuggestions.length > 0 || loadingSuggestions) && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                      >
                        {loadingSuggestions ? (
                          <div className="p-3 text-center text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </div>
                        ) : (
                          searchSuggestions.map((ficha, index) => (
                            <button
                              key={ficha.id}
                              onClick={() => handleSelectSuggestion(ficha)}
                              className={cn(
                                "w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0",
                                selectedSuggestionIndex === index && "bg-gray-800"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white truncate">
                                    {ficha.nombre_empresa}
                                  </div>
                                  <div className="text-sm text-gray-400 font-mono mt-0.5">
                                    RUC: {ficha.ruc}
                                  </div>
                                  {ficha.actividad_empresa && (
                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                      {ficha.actividad_empresa}
                                    </div>
                                  )}
                                </div>
                                {selectedSuggestionIndex === index && (
                                  <Check className="h-4 w-4 text-[#00FF80] flex-shrink-0 ml-2" />
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <Button onClick={() => handleSearch(rucInput)} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                    {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader><CardTitle className="text-white">Reportes Creados</CardTitle></CardHeader>
                <CardContent>
                  {loadingReports ? (
                    <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div>
                  ) : allReports.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No hay reportes creados.</div>
                  ) : (
                    <ComportamientoCrediticioTable reports={allReports} onEdit={handleEditFromList} onDelete={handleDelete} />
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {view === 'create_mode' && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Crear Nuevo Reporte de Comportamiento Crediticio</CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Seleccione cómo desea crear el reporte para la empresa proveedor
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Opción 1: Buscar empresa existente */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-[#00FF80]/10 p-3 rounded-lg">
                        <Search className="h-6 w-6 text-[#00FF80]" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Buscar Proveedor Existente</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Busque la empresa proveedor que ya tenga una Ficha RUC registrada en el sistema.
                    </p>
                    <div className="space-y-3">
                      <Label htmlFor="ruc-search" className="text-white">RUC o Razón Social del Proveedor</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                        <Input
                          ref={modalSearchInputRef}
                          id="ruc-search"
                          placeholder="Ej: 20123456789 o EMPRESA SAC"
                          value={rucInput}
                          onChange={(e) => setRucInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() => {
                            if (searchSuggestions.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          className="pl-10 bg-gray-900 border-gray-700"
                        />
                        
                        {/* Dropdown de sugerencias en modal */}
                        {showSuggestions && (searchSuggestions.length > 0 || loadingSuggestions) && (
                          <div
                            ref={modalSuggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                          >
                            {loadingSuggestions ? (
                              <div className="p-3 text-center text-gray-400">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              </div>
                            ) : (
                              searchSuggestions.map((ficha, index) => (
                                <button
                                  key={ficha.id}
                                  onClick={() => handleSelectSuggestion(ficha)}
                                  className={cn(
                                    "w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0",
                                    selectedSuggestionIndex === index && "bg-gray-800"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-white truncate">
                                        {ficha.nombre_empresa}
                                      </div>
                                      <div className="text-sm text-gray-400 font-mono mt-0.5">
                                        RUC: {ficha.ruc}
                                      </div>
                                      {ficha.actividad_empresa && (
                                        <div className="text-xs text-gray-500 mt-1 truncate">
                                          {ficha.actividad_empresa}
                                        </div>
                                      )}
                                    </div>
                                    {selectedSuggestionIndex === index && (
                                      <Check className="h-4 w-4 text-[#00FF80] flex-shrink-0 ml-2" />
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Busque el proveedor por RUC (11 dígitos) o por razón social
                      </p>
                      <Button
                        onClick={handleSearchAndCreate}
                        disabled={searching || !rucInput}
                        className="w-full bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                      >
                        {searching ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar y Crear
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Opción 2: Crear manualmente */}
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-500/10 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Crear Manualmente</h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Cree un reporte desde cero ingresando manualmente el RUC y la razón social del proveedor.
                    </p>
                    <div className="space-y-3">
                      <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                        <li>No requiere Ficha RUC del proveedor</li>
                        <li>Complete los datos del proveedor manualmente</li>
                        <li>Ideal para proveedores nuevos</li>
                      </ul>
                      <Button
                        onClick={handleCreateManually}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Crear Manualmente
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {view === 'search_results' && searchedFicha && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Resultados para: {searchedFicha.nombre_empresa}</CardTitle>
                <p className="text-gray-400 font-mono">{searchedFicha.ruc}</p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button onClick={handleCreateNew} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Reporte
                  </Button>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Reportes Existentes ({existingReports.length})</h3>
                {existingReports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-800">
                        <TableHead className="text-gray-300">Proveedor</TableHead>
                        <TableHead className="text-gray-300">Deudor</TableHead>
                        <TableHead className="text-gray-300">Estado</TableHead>
                        <TableHead className="text-gray-300">Creador</TableHead>
                        <TableHead className="text-gray-300">Fecha Creación</TableHead>
                        <TableHead className="text-right text-gray-300">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {existingReports.map(report => (
                        <TableRow key={report.id} className="border-gray-800">
                          <TableCell className="text-white">
                            <div className="flex flex-col">
                              <span className="font-medium">{report.proveedor || report.nombre_empresa || 'N/A'}</span>
                              {report.solicitud_id && (
                                <span className="text-xs text-blue-400 font-mono mt-1">
                                  ID: {report.solicitud_id.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {report.deudor ? (
                              <span>{report.deudor}</span>
                            ) : (
                              <span className="text-gray-500 text-xs italic">Sin deudor</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(report.status)}`}>
                              {report.status || 'Borrador'}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-300 text-sm">
                            {report.creator_name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(report.created_at).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditFromSearchResults(report)} 
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-gray-400 py-4">No hay reportes previos para este RUC.</p>
                )}
              </CardContent>
            </Card>
          )}

          {view === 'form' && searchedFicha && (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">
                    {selectedReport?.id ? 'Editando' : 'Nuevo'} Reporte {createWithoutRuc ? '(Manual)' : `para: ${searchedFicha.nombre_empresa}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información del Proveedor */}
                  <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Información del Proveedor
                    </h3>
                    {createWithoutRuc ? (
                      <>
                        <div>
                          <Label htmlFor="manual-ruc">RUC del Proveedor *</Label>
                          <Input
                            id="manual-ruc"
                            value={searchedFicha.ruc}
                            onChange={(e) => setSearchedFicha(prev => prev ? { ...prev, ruc: e.target.value } : null)}
                            maxLength={11}
                            placeholder="Ingrese RUC del proveedor (11 dígitos)"
                            className="bg-gray-900/50 border-gray-700 text-white"
                            disabled={!isAdmin}
                          />
                        </div>
                        <div>
                          <Label htmlFor="manual-nombre">Razón Social del Proveedor *</Label>
                          <Input
                            id="manual-nombre"
                            value={searchedFicha.nombre_empresa}
                            onChange={(e) => setSearchedFicha(prev => prev ? { ...prev, nombre_empresa: e.target.value } : null)}
                            placeholder="Ingrese razón social del proveedor"
                            className="bg-gray-900/50 border-gray-700 text-white"
                            disabled={!isAdmin}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>RUC del Proveedor</Label>
                          <div className="bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-400 font-mono">
                            {searchedFicha.ruc}
                          </div>
                        </div>
                        <div>
                          <Label>Razón Social del Proveedor</Label>
                          <div className="bg-gray-800 border border-gray-700 rounded-md p-2 text-gray-400">
                            {searchedFicha.nombre_empresa}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="proveedor">Nombre del Proveedor (autogenerado)</Label>
                    <Input id="proveedor" value={formData.proveedor} disabled className="bg-gray-800 border-gray-700 text-gray-400" />
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <div className="grid grid-cols-4 gap-x-4">
                      <div className="font-medium text-gray-300 mb-2">Concepto</div>
                      <div className="text-white text-center font-medium mb-2">Equifax</div>
                      <div className="text-white text-center font-medium mb-2">Sentinel</div>
                      <div className="text-white text-center font-medium mb-2">Apefac</div>
                      <div className="col-span-3 space-y-2">
                        <div className="grid grid-cols-3 gap-x-4 items-center">
                          <Label htmlFor="equifax_score" className="text-gray-400">Score</Label>
                          <Input id="equifax_score" type="text" value={formData.equifax_score} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                          <Input id="sentinel_score" type="text" value={formData.sentinel_score} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                        </div>
                        {formFields.map(field => (
                          <div key={field.id} className="grid grid-cols-3 gap-x-4 items-center">
                            <Label htmlFor={`equifax_${field.id}`} className="text-gray-400">{field.label}</Label>
                            <Input id={`equifax_${field.id}`} type={field.type} value={formData[`equifax_${field.id}` as keyof typeof formData]} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                            <Input id={`sentinel_${field.id}`} type={field.type} value={formData[`sentinel_${field.id}` as keyof typeof formData]} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                          </div>
                        ))}
                      </div>
                      <div className="col-span-1">
                        <Textarea id="apefac_descripcion" value={formData.apefac_descripcion} onChange={handleFormChange} placeholder="Resumen de Apefac..." className="bg-gray-900/50 border-gray-700 text-white h-full min-h-[200px]" disabled={!isAdmin} />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <Label htmlFor="comentarios">Comentarios</Label>
                    <Textarea id="comentarios" value={formData.comentarios} onChange={handleFormChange} placeholder="(aquí pueden comentar acerca de las morosidades y/o sustentos)" className="bg-gray-900/50 border-gray-700 text-white min-h-[100px]" disabled={!isAdmin} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                    Información del Deudor (Opcional)
                  </CardTitle>
                  <p className="text-gray-400 text-sm mt-1">
                    Si aplica, ingrese el nombre y datos crediticios del deudor asociado
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="deudor">Nombre o Razón Social del Deudor</Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Busque por RUC o razón social, o ingrese manualmente
                    </p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                      <Input 
                        ref={deudorSearchInputRef}
                        id="deudor" 
                        value={formDataDeudor.deudor} 
                        onChange={handleDeudorFormChange} 
                        onKeyDown={handleDeudorKeyDown}
                        onFocus={() => {
                          if (deudorSearchSuggestions.length > 0) {
                            setShowDeudorSuggestions(true);
                          }
                        }}
                        className="pl-10 bg-gray-900/50 border-gray-700 text-white" 
                        disabled={!isAdmin} 
                        placeholder="Ej: 20987654321 o DEUDOR SAC" 
                      />
                      
                      {/* Dropdown de sugerencias para deudor */}
                      {showDeudorSuggestions && (deudorSearchSuggestions.length > 0 || loadingDeudorSuggestions) && (
                        <div
                          ref={deudorSuggestionsRef}
                          className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                          {loadingDeudorSuggestions ? (
                            <div className="p-3 text-center text-gray-400">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </div>
                          ) : (
                            deudorSearchSuggestions.map((ficha, index) => (
                              <button
                                key={ficha.id}
                                onClick={() => handleSelectDeudorSuggestion(ficha)}
                                className={cn(
                                  "w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors border-b border-gray-800 last:border-b-0",
                                  selectedDeudorSuggestionIndex === index && "bg-gray-800"
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white truncate">
                                      {ficha.nombre_empresa}
                                    </div>
                                    <div className="text-sm text-gray-400 font-mono mt-0.5">
                                      RUC: {ficha.ruc}
                                    </div>
                                    {ficha.actividad_empresa && (
                                      <div className="text-xs text-gray-500 mt-1 truncate">
                                        {ficha.actividad_empresa}
                                      </div>
                                    )}
                                  </div>
                                  {selectedDeudorSuggestionIndex === index && (
                                    <Check className="h-4 w-4 text-[#00FF80] flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <div className="grid grid-cols-4 gap-x-4">
                      <div className="font-medium text-gray-300 mb-2">Concepto</div>
                      <div className="text-white text-center font-medium mb-2">Equifax</div>
                      <div className="text-white text-center font-medium mb-2">Sentinel</div>
                      <div className="text-white text-center font-medium mb-2">Apefac</div>
                      <div className="col-span-3 space-y-2">
                        <div className="grid grid-cols-3 gap-x-4 items-center">
                          <Label htmlFor="deudor_equifax_score" className="text-gray-400">Score</Label>
                          <Input id="deudor_equifax_score" type="text" value={formDataDeudor.equifax_score} onChange={handleDeudorFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                          <Input id="deudor_sentinel_score" type="text" value={formDataDeudor.sentinel_score} onChange={handleDeudorFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                        </div>
                        {formFields.map(field => (
                          <div key={field.id} className="grid grid-cols-3 gap-x-4 items-center">
                            <Label htmlFor={`deudor_equifax_${field.id}`} className="text-gray-400">{field.label}</Label>
                            <Input id={`deudor_equifax_${field.id}`} type={field.type} value={formDataDeudor[`equifax_${field.id}` as keyof typeof formDataDeudor]} onChange={handleDeudorFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                            <Input id={`deudor_sentinel_${field.id}`} type={field.type} value={formDataDeudor[`sentinel_${field.id}` as keyof typeof formDataDeudor]} onChange={handleDeudorFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                          </div>
                        ))}
                      </div>
                      <div className="col-span-1">
                        <Textarea id="deudor_apefac_descripcion" value={formDataDeudor.apefac_descripcion} onChange={handleDeudorFormChange} placeholder="Resumen de Apefac..." className="bg-gray-900/50 border-gray-700 text-white h-full min-h-[200px]" disabled={!isAdmin} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {searchedFicha && (
                <ExperienciaPagoManager 
                  comportamientoCrediticioId={selectedReport?.id}
                  disabled={!selectedReport?.id}
                />
              )}

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Gestión del Reporte</CardTitle>
                    {isAdmin && (
                      <Button onClick={handleSave} disabled={saving || !isDirty}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {selectedReport?.id ? 'Actualizar' : 'Guardar'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {selectedReport && (
                  <CardFooter className="flex flex-col items-start space-y-4 text-sm text-gray-300 border-t border-gray-800 pt-4">
                    <h4 className="font-semibold text-white">Detalles del Análisis</h4>
                    <div className="flex items-start"><User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-1" /><div><p><strong className="text-gray-400">Ejecutivo:</strong>{creatorDetails ? <span> {creatorDetails.fullName} ({creatorDetails.email})</span> : <span> Cargando...</span>}</p><div className="flex items-center mt-1 text-gray-500"><Calendar className="h-4 w-4 mr-2" /><span className="text-xs">{new Date(selectedReport.created_at).toLocaleString('es-PE')}</span></div></div></div>
                    <div className="flex items-center"><Clock className="h-4 w-4 mr-2 text-gray-400" /><div><strong className="text-gray-400">Última modificación:</strong> {new Date(selectedReport.updated_at).toLocaleString('es-PE')}</div></div>
                    
                    {/* Botón para ver historial de auditoría */}
                    <div className="w-full pt-4 border-t border-gray-800">
                      <ComportamientoCrediticioAuditLogViewer reportId={selectedReport.id} />
                    </div>

                    <div className="w-full pt-2">
                      <Label htmlFor="solicitud_id" className="font-semibold text-white">
                        Asociar a Solicitud de Operación *
                      </Label>
                      <p className="text-xs text-yellow-400 mb-2 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Campo obligatorio - El reporte debe estar asociado a una solicitud de operación
                      </p>
                      <AsyncCombobox
                          value={formData.solicitud_id}
                          onChange={(value) => handleFormChange({ target: { id: 'solicitud_id', value } } as any)}
                          onSearch={searchSolicitudes}
                          placeholder="Buscar por RUC, empresa o ID de solicitud..."
                          searchPlaceholder="Escriba para buscar..."
                          emptyMessage="No se encontraron solicitudes."
                          disabled={!isAdmin}
                          initialDisplayValue={initialSolicitudLabel}
                      />
                    </div>
                    <div className="w-full pt-2"><Label htmlFor="validado_por" className="font-semibold text-white">Validado por</Label><Input id="validado_por" value={formData.validado_por || ''} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 mt-1" disabled={!isAdmin} /></div>
                    <div className="w-full pt-2"><Label htmlFor="status-edit" className="font-semibold text-white">Estado de Solicitud</Label><Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CrediticioStatus }))} disabled={!isAdmin}><SelectTrigger id="status-edit" className="bg-gray-900/50 border-gray-700 mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Borrador">Borrador</SelectItem><SelectItem value="En revisión">En revisión</SelectItem><SelectItem value="Aprobado">Aprobado</SelectItem><SelectItem value="Rechazado">Rechazado</SelectItem></SelectContent></Select></div>
                  </CardFooter>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ComportamientoCrediticioPage;