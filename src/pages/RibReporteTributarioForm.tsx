import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, ClipboardList, ArrowLeft, FileText, User, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { RibReporteTributarioDocument, RibReporteTributarioService } from '@/services/ribReporteTributarioService';
import { ProfileService } from '@/services/profileService';
import RibReporteTributarioTable from '@/components/rib-reporte-tributario/RibReporteTributarioTable';
import EstadosResultadosTable from '@/components/rib-reporte-tributario/EstadosResultadosTable';
import IndicesFinancierosTable from '@/components/rib-reporte-tributario/IndicesFinancierosTable';
import ProveedorSection from '@/components/rib-reporte-tributario/ProveedorSection';
import ReporteStatusManager from '@/components/rib-reporte-tributario/ReporteStatusManager';
import EstadoSituacionTable from '@/components/estado-situacion/EstadoSituacionTable';
import RibReporteTributarioAuditLogViewer from '@/components/audit/RibReporteTributarioAuditLogViewer';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxOption } from '@/components/ui/async-combobox';
import { EstadoSituacionService } from '@/services/estadoSituacionService';
import RibProcessWizard from '@/components/solicitud-operacion/RibProcessWizard';
import { Badge } from '@/components/ui/badge';

type Status = 'Borrador' | 'En revisión' | 'Completado';

interface SearchSuggestion {
  ruc: string;
  nombre_empresa: string;
}

const RibReporteTributarioForm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [initializing, setInitializing] = useState(true);
  const [view, setView] = useState<'create_mode' | 'form'>('create_mode');
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [createWithoutRuc, setCreateWithoutRuc] = useState(false);
  
  const [documentData, setDocumentData] = useState<RibReporteTributarioDocument | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);
  const [initialSearchedFicha, setInitialSearchedFicha] = useState<{ ruc: string; nombre_empresa: string } | null>(null);

  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [productType, setProductType] = useState<string | null>(null);
  
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const modalSearchInputRef = useRef<HTMLInputElement>(null);
  const modalSuggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditMode && id) {
      handleLoadForEdit(id);
    } else {
      const rucParam = searchParams.get('ruc');
      const solicitudIdParam = searchParams.get('solicitud_id');
      
      if (rucParam && solicitudIdParam) {
        handleAutoInit(rucParam, solicitudIdParam);
      } else {
        setInitializing(false);
      }
    }
  }, [isEditMode, id, searchParams]);

  const handleAutoInit = async (ruc: string, solicitudId: string) => {
    setSearching(true);
    try {
      const { data: solicitud } = await supabase
        .from('solicitudes_operacion')
        .select('id, ruc, created_at, proveedor, tipo_producto')
        .eq('id', solicitudId)
        .single();
        
      let nombreProveedor = solicitud?.proveedor || 'Empresa sin nombre';
      
      if (solicitud) {
         const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).maybeSingle();
         setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
         setProductType(solicitud.tipo_producto);
      }

      const fichaData = await FichaRucService.getByRuc(ruc);
      let newDocument: RibReporteTributarioDocument;

      if (fichaData) {
        setSearchedFicha(fichaData);
        setCreateWithoutRuc(false);
        nombreProveedor = fichaData.nombre_empresa;
        
        const situacion = await EstadoSituacionService.getEstadoSituacion(fichaData.ruc);
        
        newDocument = {
          deudor: {
            ruc: fichaData.ruc,
            tipo_entidad: 'deudor',
            anio: 2024,
            cuentas_por_cobrar_giro_2022: situacion.data_2022.cuentas_por_cobrar_del_giro,
            total_activos_2022: situacion.data_2022.total_activos,
            cuentas_por_pagar_giro_2022: situacion.data_2022.cuentas_por_pagar_del_giro,
            total_pasivos_2022: situacion.data_2022.total_pasivos,
            capital_pagado_2022: situacion.data_2022.capital_pagado,
            total_patrimonio_2022: situacion.data_2022.total_patrimonio,
            total_pasivo_patrimonio_2022: situacion.data_2022.total_pasivo_y_patrimonio,
            cuentas_por_cobrar_giro_2023: situacion.data_2023.cuentas_por_cobrar_del_giro,
            total_activos_2023: situacion.data_2023.total_activos,
            cuentas_por_pagar_giro_2023: situacion.data_2023.cuentas_por_pagar_del_giro,
            total_pasivos_2023: situacion.data_2023.total_pasivos,
            capital_pagado_2023: situacion.data_2023.capital_pagado,
            total_patrimonio_2023: situacion.data_2023.total_patrimonio,
            total_pasivo_patrimonio_2023: situacion.data_2023.total_pasivo_y_patrimonio,
            cuentas_por_cobrar_giro_2024: situacion.data_2024.cuentas_por_cobrar_del_giro,
            total_activos_2024: situacion.data_2024.total_activos,
            cuentas_por_pagar_giro_2024: situacion.data_2024.cuentas_por_pagar_del_giro,
            total_pasivos_2024: situacion.data_2024.total_pasivos,
            capital_pagado_2024: situacion.data_2024.capital_pagado,
            total_patrimonio_2024: situacion.data_2024.total_patrimonio,
            total_pasivo_patrimonio_2024: situacion.data_2024.total_pasivo_y_patrimonio,
          },
          proveedor: null,
          solicitud_id: solicitudId,
          status: 'Borrador',
          user_id: null
        };
      } else {
        setCreateWithoutRuc(true);
        const mockFicha: FichaRuc = {
            id: 0,
            ruc: ruc,
            nombre_empresa: nombreProveedor,
            actividad_empresa: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setSearchedFicha(mockFicha);
        setInitialSearchedFicha({ ruc: ruc, nombre_empresa: nombreProveedor });
        
        // CORRECCIÓN: Inicializar con todos los campos necesarios para entrada manual
        newDocument = {
          deudor: {
            ruc: ruc,
            tipo_entidad: 'deudor',
            anio: 2024,
            // Inicializar TODOS los campos con null para permitir entrada manual
            cuentas_por_cobrar_giro_2022: null,
            total_activos_2022: null,
            cuentas_por_pagar_giro_2022: null,
            total_pasivos_2022: null,
            capital_pagado_2022: null,
            total_patrimonio_2022: null,
            total_pasivo_patrimonio_2022: null,
            ingreso_ventas_2022: null,
            utilidad_bruta_2022: null,
            utilidad_antes_impuesto_2022: null,
            solvencia_2022: null,
            gestion_2022: null,
            
            cuentas_por_cobrar_giro_2023: null,
            total_activos_2023: null,
            cuentas_por_pagar_giro_2023: null,
            total_pasivos_2023: null,
            capital_pagado_2023: null,
            total_patrimonio_2023: null,
            total_pasivo_patrimonio_2023: null,
            ingreso_ventas_2023: null,
            utilidad_bruta_2023: null,
            utilidad_antes_impuesto_2023: null,
            solvencia_2023: null,
            gestion_2023: null,
            
            cuentas_por_cobrar_giro_2024: null,
            total_activos_2024: null,
            cuentas_por_pagar_giro_2024: null,
            total_pasivos_2024: null,
            capital_pagado_2024: null,
            total_patrimonio_2024: null,
            total_pasivo_patrimonio_2024: null,
            ingreso_ventas_2024: null,
            utilidad_bruta_2024: null,
            utilidad_antes_impuesto_2024: null,
            solvencia_2024: null,
            gestion_2024: null,
          },
          proveedor: null,
          solicitud_id: solicitudId,
          status: 'Borrador',
          user_id: null,
          nombre_empresa: nombreProveedor
        };
        
        showSuccess('Ficha RUC no encontrada. Iniciando modo manual con todos los campos disponibles.');
      }
      
      setDocumentData(newDocument);
      setView('form');
      setHasUnsavedChanges(true);
      
    } catch (err) {
      console.error("Error auto-initializing:", err);
      showError('Error al inicializar el reporte.');
    } finally {
      setSearching(false);
      setInitializing(false);
    }
  };

  const handleLoadForEdit = async (reportId: string) => {
    setSearching(true);
    try {
      const existingDocument = await RibReporteTributarioService.getById(reportId);
      if (existingDocument) {
        const fichaData = await FichaRucService.getByRuc(existingDocument.deudor.ruc);
        
        if (fichaData) {
          setSearchedFicha(fichaData);
          setCreateWithoutRuc(false);
        } else {
          const mockFicha: FichaRuc = {
            id: 0,
            ruc: existingDocument.deudor.ruc || '',
            nombre_empresa: existingDocument.nombre_empresa || 'Empresa Manual',
            estado_contribuyente: '',
            condicion_contribuyente: '',
            domicilio_fiscal: '',
            fecha_inscripcion: '',
            fecha_inicio_actividades: '',
            actividad_economica: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setSearchedFicha(mockFicha);
          setCreateWithoutRuc(true);
          setInitialSearchedFicha({
            ruc: mockFicha.ruc,
            nombre_empresa: mockFicha.nombre_empresa
          });
        }
        
        setRucInput(existingDocument.deudor.ruc || '');
        setDocumentData(existingDocument);
        
        if (existingDocument.user_id) {
          const profile = await ProfileService.getProfileById(existingDocument.user_id);
          setCreatorName(profile?.full_name || 'Desconocido');
        }
        
        if (existingDocument.solicitud_id) {
          const { data: solicitud } = await supabase
            .from('solicitudes_operacion')
            .select('id, ruc, created_at, tipo_producto')
            .eq('id', existingDocument.solicitud_id)
            .single();
          
          if (solicitud) {
            setProductType(solicitud.tipo_producto);
            const { data: ficha } = await supabase
              .from('ficha_ruc')
              .select('nombre_empresa')
              .eq('ruc', solicitud.ruc)
              .maybeSingle();
            
            setInitialSolicitudLabel(
              `${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`
            );
          }
        }
        
        setView('form');
      } else {
        showError('No se encontró el reporte para editar.');
        navigate('/rib-reporte-tributario');
      }
    } catch (err) {
      showError('Error al cargar el reporte para editar.');
      console.error(err);
    } finally {
      setSearching(false);
      setInitializing(false);
    }
  };

  const getMainSectionLabel = () => {
    if (productType === 'FACTORING') return 'ESTADO DE SITUACIÓN FINANCIERA - DATOS DEL PROVEEDOR (CLIENTE)';
    if (productType === 'CONFIRMING') return 'ESTADO DE SITUACIÓN FINANCIERA - DATOS DEL DEUDOR (CLIENTE)';
    return 'ESTADO DE SITUACIÓN FINANCIERA - DATOS DE LA EMPRESA PRINCIPAL';
  };

  const getSecondarySectionLabel = () => {
    if (productType === 'FACTORING') return 'DATOS DEL DEUDOR (PAGADOR)';
    if (productType === 'CONFIRMING') return 'DATOS DEL PROVEEDOR (ADICIONAL)';
    return 'DATOS DE LA EMPRESA RELACIONADA';
  };

  useEffect(() => {
    if (createWithoutRuc && searchedFicha && initialSearchedFicha) {
      const rucChanged = searchedFicha.ruc !== initialSearchedFicha.ruc;
      const nombreChanged = searchedFicha.nombre_empresa !== initialSearchedFicha.nombre_empresa;
      if (rucChanged || nombreChanged) {
        setHasUnsavedChanges(true);
      }
    }
  }, [searchedFicha, initialSearchedFicha, createWithoutRuc]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        modalSuggestionsRef.current &&
        !modalSuggestionsRef.current.contains(event.target as Node) &&
        modalSearchInputRef.current &&
        !modalSearchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!rucInput || rucInput.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const searchDebounce = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase
          .from('ficha_ruc')
          .select('ruc, nombre_empresa')
          .or(`ruc.ilike.%${rucInput}%,nombre_empresa.ilike.%${rucInput}%`)
          .limit(10);
        if (!error && data) {
          setSearchSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(searchDebounce);
  }, [rucInput]);

  const handleSearchForNew = async () => {
    if (!rucInput || rucInput.trim().length < 2) {
      setError('Por favor, ingrese un RUC o nombre de empresa válido.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setDocumentData(null);
    setHasUnsavedChanges(false);
    setShowSuggestions(false);
    try {
      const { data: fichasData, error: searchError } = await supabase
        .from('ficha_ruc')
        .select('*')
        .or(`ruc.ilike.%${rucInput}%,nombre_empresa.ilike.%${rucInput}%`)
        .limit(1)
        .maybeSingle();

      if (searchError || !fichasData) {
        setError('No se encontró ninguna empresa con ese RUC o nombre. Puede crear un reporte manualmente.');
        showError('Empresa no encontrada');
        setSearching(false);
        return;
      }
      const fichaData = fichasData as FichaRuc;
      setSearchedFicha(fichaData);
      setCreateWithoutRuc(false);
      const situacion = await EstadoSituacionService.getEstadoSituacion(fichaData.ruc);
      const newDocument: RibReporteTributarioDocument = {
        deudor: {
          ruc: fichaData.ruc,
          tipo_entidad: 'deudor',
          anio: 2024,
          cuentas_por_cobrar_giro_2022: situacion.data_2022.cuentas_por_cobrar_del_giro,
          total_activos_2022: situacion.data_2022.total_activos,
          cuentas_por_pagar_giro_2022: situacion.data_2022.cuentas_por_pagar_del_giro,
          total_pasivos_2022: situacion.data_2022.total_pasivos,
          capital_pagado_2022: situacion.data_2022.capital_pagado,
          total_patrimonio_2022: situacion.data_2022.total_patrimonio,
          total_pasivo_patrimonio_2022: situacion.data_2022.total_pasivo_y_patrimonio,
          cuentas_por_cobrar_giro_2023: situacion.data_2023.cuentas_por_cobrar_del_giro,
          total_activos_2023: situacion.data_2023.total_activos,
          cuentas_por_pagar_giro_2023: situacion.data_2023.cuentas_por_pagar_del_giro,
          total_pasivos_2023: situacion.data_2023.total_pasivos,
          capital_pagado_2023: situacion.data_2023.capital_pagado,
          total_patrimonio_2023: situacion.data_2023.total_patrimonio,
          total_pasivo_patrimonio_2023: situacion.data_2023.total_pasivo_y_patrimonio,
          cuentas_por_cobrar_giro_2024: situacion.data_2024.cuentas_por_cobrar_del_giro,
          total_activos_2024: situacion.data_2024.total_activos,
          cuentas_por_pagar_giro_2024: situacion.data_2024.cuentas_por_pagar_del_giro,
          total_pasivos_2024: situacion.data_2024.total_pasivos,
          capital_pagado_2024: situacion.data_2024.capital_pagado,
          total_patrimonio_2024: situacion.data_2024.total_patrimonio,
          total_pasivo_patrimonio_2024: situacion.data_2024.total_pasivo_y_patrimonio,
        },
        proveedor: null,
        solicitud_id: null,
        status: 'Borrador',
        user_id: null
      };
      setDocumentData(newDocument);
      setView('form');
      setHasUnsavedChanges(true);
      showSuccess('Datos autocompletados desde Reportes Tributarios. Puede editar y guardar como un nuevo reporte.');
    } catch (err) {
      setError(`Ocurrió un error al buscar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      showError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateManually = () => {
    setError(null);
    setRucInput('');
    setCreateWithoutRuc(true);
    setShowSuggestions(false);
    const mockFicha: FichaRuc = {
      id: 0,
      ruc: '',
      nombre_empresa: '',
      estado_contribuyente: '',
      condicion_contribuyente: '',
      domicilio_fiscal: '',
      fecha_inscripcion: '',
      fecha_inicio_actividades: '',
      actividad_economica: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSearchedFicha(mockFicha);
    setInitialSearchedFicha({ ruc: '', nombre_empresa: '' });
    
    // CORRECCIÓN: Inicializar con estructura completa para entrada manual
    const emptyDocument: RibReporteTributarioDocument = {
      deudor: {
        ruc: '',
        tipo_entidad: 'deudor',
        anio: 2024,
        // Inicializar TODOS los campos con null
        cuentas_por_cobrar_giro_2022: null,
        total_activos_2022: null,
        cuentas_por_pagar_giro_2022: null,
        total_pasivos_2022: null,
        capital_pagado_2022: null,
        total_patrimonio_2022: null,
        total_pasivo_patrimonio_2022: null,
        ingreso_ventas_2022: null,
        utilidad_bruta_2022: null,
        utilidad_antes_impuesto_2022: null,
        solvencia_2022: null,
        gestion_2022: null,
        
        cuentas_por_cobrar_giro_2023: null,
        total_activos_2023: null,
        cuentas_por_pagar_giro_2023: null,
        total_pasivos_2023: null,
        capital_pagado_2023: null,
        total_patrimonio_2023: null,
        total_pasivo_patrimonio_2023: null,
        ingreso_ventas_2023: null,
        utilidad_bruta_2023: null,
        utilidad_antes_impuesto_2023: null,
        solvencia_2023: null,
        gestion_2023: null,
        
        cuentas_por_cobrar_giro_2024: null,
        total_activos_2024: null,
        cuentas_por_pagar_giro_2024: null,
        total_pasivos_2024: null,
        capital_pagado_2024: null,
        total_patrimonio_2024: null,
        total_pasivo_patrimonio_2024: null,
        ingreso_ventas_2024: null,
        utilidad_bruta_2024: null,
        utilidad_antes_impuesto_2024: null,
        solvencia_2024: null,
        gestion_2024: null,
      },
      proveedor: null,
      solicitud_id: null,
      status: 'Borrador',
      user_id: null,
      nombre_empresa: ''
    };
    setDocumentData(emptyDocument);
    setView('form');
    setHasUnsavedChanges(true);
  };

  const handleSelectSuggestion = async (suggestion: SearchSuggestion) => {
    setRucInput(suggestion.ruc);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setDocumentData(null);
    setHasUnsavedChanges(false);
    try {
      const fichaData = await FichaRucService.getByRuc(suggestion.ruc);
      if (fichaData) {
        setSearchedFicha(fichaData);
        setCreateWithoutRuc(false);
        const situacion = await EstadoSituacionService.getEstadoSituacion(fichaData.ruc);
        const newDocument: RibReporteTributarioDocument = {
          deudor: {
            ruc: fichaData.ruc,
            tipo_entidad: 'deudor',
            anio: 2024,
            cuentas_por_cobrar_giro_2022: situacion.data_2022.cuentas_por_cobrar_del_giro,
            total_activos_2022: situacion.data_2022.total_activos,
            cuentas_por_pagar_giro_2022: situacion.data_2022.cuentas_por_pagar_del_giro,
            total_pasivos_2022: situacion.data_2022.total_pasivos,
            capital_pagado_2022: situacion.data_2022.capital_pagado,
            total_patrimonio_2022: situacion.data_2022.total_patrimonio,
            total_pasivo_patrimonio_2022: situacion.data_2022.total_pasivo_y_patrimonio,
            cuentas_por_cobrar_giro_2023: situacion.data_2023.cuentas_por_cobrar_del_giro,
            total_activos_2023: situacion.data_2023.total_activos,
            cuentas_por_pagar_giro_2023: situacion.data_2023.cuentas_por_pagar_del_giro,
            total_pasivos_2023: situacion.data_2023.total_pasivos,
            capital_pagado_2023: situacion.data_2023.capital_pagado,
            total_patrimonio_2023: situacion.data_2023.total_patrimonio,
            total_pasivo_patrimonio_2023: situacion.data_2023.total_pasivo_y_patrimonio,
            cuentas_por_cobrar_giro_2024: situacion.data_2024.cuentas_por_cobrar_del_giro,
            total_activos_2024: situacion.data_2024.total_activos,
            cuentas_por_pagar_giro_2024: situacion.data_2024.cuentas_por_pagar_del_giro,
            total_pasivos_2024: situacion.data_2024.total_pasivos,
            capital_pagado_2024: situacion.data_2024.capital_pagado,
            total_patrimonio_2024: situacion.data_2024.total_patrimonio,
            total_pasivo_patrimonio_2024: situacion.data_2024.total_pasivo_y_patrimonio,
          },
          proveedor: null,
          solicitud_id: null,
          status: 'Borrador',
          user_id: null
        };
        setDocumentData(newDocument);
        setView('form');
        setHasUnsavedChanges(true);
        showSuccess('Datos autocompletados desde Reportes Tributarios.');
      }
    } catch (err) {
      setError(`Error al cargar datos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      showError('Error al cargar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearchForNew();
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
          handleSearchForNew();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleDeudorDataChange = useCallback((updatedData: any) => {
    setDocumentData((prevData) => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        deudor: { ...prevData.deudor, ...updatedData }
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleProveedorDataChange = useCallback((updatedData: any) => {
    setDocumentData((prevData) => {
      if (!prevData) return prevData;
      return {
        ...prevData,
        proveedor: updatedData
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const handleStatusChange = (newStatus: Status) => {
    if (documentData) {
      setDocumentData({ ...documentData, status: newStatus });
      setHasUnsavedChanges(true);
    }
  };

  const handleSolicitudIdChange = (solicitudId: string | null) => {
    if (documentData) {
      setDocumentData({ ...documentData, solicitud_id: solicitudId });
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!documentData) {
      showError('No hay datos para guardar');
      return;
    }
    
    // CORRECCIÓN: Validar campos requeridos antes de guardar
    const rucFinal = createWithoutRuc ? searchedFicha?.ruc : documentData.deudor.ruc;
    const nombreEmpresaFinal = createWithoutRuc ? searchedFicha?.nombre_empresa : null;
    
    if (!rucFinal || rucFinal.trim() === '') {
      showError('El RUC es obligatorio. Por favor, ingrese el RUC de la empresa.');
      return;
    }
    
    if (rucFinal.length !== 11) {
      showError('El RUC debe tener exactamente 11 dígitos.');
      return;
    }
    
    if (createWithoutRuc && (!nombreEmpresaFinal || nombreEmpresaFinal.trim() === '')) {
      showError('La Razón Social es obligatoria en modo manual.');
      return;
    }
    
    if (!documentData.solicitud_id) {
      showError('Debe asociar el reporte a una Solicitud de Operación antes de guardar.');
      return;
    }
    
    setIsSaving(true);
    try {
      // CORRECCIÓN: Asegurar que el RUC y nombre_empresa estén en el objeto a guardar
      const dataToSave = { ...documentData };
      
      if (createWithoutRuc && searchedFicha) {
        dataToSave.deudor.ruc = searchedFicha.ruc || '';
        dataToSave.nombre_empresa = searchedFicha.nombre_empresa;
      }
      
      // Validar que deudor.ruc esté presente
      if (!dataToSave.deudor.ruc) {
        showError('Error: RUC del deudor no está definido.');
        setIsSaving(false);
        return;
      }
      
      console.log('💾 Guardando reporte con datos:', {
        ruc: dataToSave.deudor.ruc,
        nombre_empresa: dataToSave.nombre_empresa,
        solicitud_id: dataToSave.solicitud_id,
        status: dataToSave.status,
        hasId: !!dataToSave.deudor.id,
        isCreateMode: !dataToSave.deudor.id
      });
      
      const savedDocument = await RibReporteTributarioService.save(dataToSave);
      setDocumentData(savedDocument);
      setHasUnsavedChanges(false);
      
      if (createWithoutRuc && searchedFicha) {
        setInitialSearchedFicha({
          ruc: searchedFicha.ruc,
          nombre_empresa: searchedFicha.nombre_empresa
        });
      }
      
      showSuccess('Reporte RIB guardado exitosamente.');
      
      if (!isEditMode && savedDocument.deudor.id) {
          navigate(`/rib-reporte-tributario/edit/${savedDocument.deudor.id}`, { replace: true });
      }
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      showError(`Error al guardar el reporte RIB: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const searchSolicitudes = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_solicitudes', { search_term: query });
    if (error) {
      console.error('Error searching solicitudes:', error);
      return [];
    }
    return data || [];
  };

  if (initializing) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 text-[#00FF80] animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Cargando Reporte Tributario...</h2>
          <p className="text-gray-400">Obteniendo datos de la solicitud y fichas RUC</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ClipboardList className="h-6 w-6 mr-3 text-[#00FF80]" />
              {isEditMode ? 'Editar' : 'Nuevo'} RIB - Reporte Tributario
            </h1>
            <div className="flex gap-2">
              {isEditMode && id && (
                <RibReporteTributarioAuditLogViewer reporteId={id} />
              )}
              <Button 
                variant="outline" 
                onClick={() => navigate('/rib-reporte-tributario')} 
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            </div>
          </div>

          {!isEditMode && view === 'create_mode' && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Crear Nuevo Reporte RIB - Tributario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#00FF80]/20 flex items-center justify-center">
                        <Search className="h-4 w-4 text-[#00FF80]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Buscar Empresa Existente</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Busque por RUC o nombre de empresa. Los datos serán autocompletados.
                      </p>
                      <div className="relative">
                        <div className="relative flex-1 w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input 
                            ref={modalSearchInputRef}
                            placeholder="Ingrese RUC o nombre de empresa" 
                            value={rucInput} 
                            onChange={(e) => setRucInput(e.target.value)} 
                            onKeyDown={handleKeyDown}
                            onFocus={() => rucInput.length >= 2 && setShowSuggestions(true)}
                            className="pl-10 bg-gray-900/50 border-gray-700" 
                          />
                        </div>
                        {showSuggestions && searchSuggestions.length > 0 && (
                          <div 
                            ref={modalSuggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto"
                          >
                            {loadingSuggestions ? (
                              <div className="p-3 text-center text-gray-400">
                                <Loader2 className="h-4 w-4 animate-spin inline" />
                              </div>
                            ) : (
                              searchSuggestions.map((suggestion, index) => (
                                <div
                                  key={suggestion.ruc}
                                  className={`p-3 cursor-pointer hover:bg-gray-800 ${
                                    index === selectedSuggestionIndex ? 'bg-gray-800' : ''
                                  }`}
                                  onMouseDown={() => handleSelectSuggestion(suggestion)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-white font-medium">{suggestion.nombre_empresa}</p>
                                      <p className="text-xs text-gray-400 font-mono">{suggestion.ruc}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <Button 
                        onClick={handleSearchForNew} 
                        disabled={searching} 
                        className="w-full mt-4 bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                      >
                        {searching ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4 mr-2" />
                        )}
                        Buscar y Autocompletar
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#121212] px-2 text-gray-400">O</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Crear Manualmente</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Cree un reporte desde cero sin buscar en el sistema. Ideal para empresas nuevas.
                      </p>
                      <Button 
                        onClick={handleCreateManually} 
                        variant="outline"
                        className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10"
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

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {searchedFicha && documentData && view === 'form' && (
            <div className="space-y-8">
               <RibProcessWizard solicitudId={documentData.solicitud_id || undefined} currentStep="reporte" />
               
              {createWithoutRuc && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Información de la Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manual-ruc" className="text-gray-300">Número de RUC *</Label>
                        <Input
                          id="manual-ruc"
                          value={searchedFicha.ruc}
                          onChange={(e) => {
                            const newRuc = e.target.value;
                            setSearchedFicha({ ...searchedFicha, ruc: newRuc });
                            // CORRECCIÓN: También actualizar el RUC en documentData.deudor
                            setDocumentData(prev => prev ? {
                              ...prev,
                              deudor: { ...prev.deudor, ruc: newRuc }
                            } : prev);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Ingrese RUC (11 dígitos)"
                          maxLength={11}
                          className="bg-gray-900/50 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manual-nombre" className="text-gray-300">Razón Social *</Label>
                        <Input
                          id="manual-nombre"
                          value={searchedFicha.nombre_empresa}
                          onChange={(e) => {
                            const newNombre = e.target.value;
                            setSearchedFicha({ ...searchedFicha, nombre_empresa: newNombre });
                            // CORRECCIÓN: También actualizar nombre_empresa en documentData
                            setDocumentData(prev => prev ? {
                              ...prev,
                              nombre_empresa: newNombre
                            } : prev);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Ingrese razón social"
                          className="bg-gray-900/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-6">
                <div className="border-l-4 border-[#00FF80] pl-4">
                  <h2 className="text-xl font-bold text-white mb-2 uppercase">
                    {getMainSectionLabel()}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Información financiera consolidada de {searchedFicha.nombre_empresa || 'la empresa'} (2022-2024)
                  </p>
                  {productType && (
                    <Badge variant="outline" className="mt-2 text-xs border-[#00FF80]/50 text-[#00FF80] bg-[#00FF80]/10">
                      Producto: {productType}
                    </Badge>
                  )}
                </div>
                
                {!createWithoutRuc && searchedFicha.ruc && (
                  <EstadoSituacionTable ruc={searchedFicha.ruc} />
                )}
                
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Estado de situación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RibReporteTributarioTable 
                      ruc={searchedFicha.ruc} 
                      data={documentData.deudor} 
                      onDataChange={handleDeudorDataChange} 
                    />
                  </CardContent>
                </Card>
                
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Estados de resultados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EstadosResultadosTable 
                      data={documentData.deudor} 
                      onDataChange={handleDeudorDataChange} 
                    />
                  </CardContent>
                </Card>
                
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Índices financieros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IndicesFinancierosTable 
                      data={documentData.deudor} 
                      onDataChange={handleDeudorDataChange} 
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="border-t border-gray-800"></div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-bold text-white mb-2 uppercase">
                    {getSecondarySectionLabel()}
                  </h2>
                  <p className="text-gray-400 text-sm">Información financiera de la contraparte (opcional)</p>
                </div>
                
                <ProveedorSection 
                  data={documentData.proveedor} 
                  onDataChange={handleProveedorDataChange} 
                />
              </div>
              
              <ReporteStatusManager
                solicitudId={documentData.solicitud_id}
                status={documentData.status as Status}
                createdAt={documentData.created_at}
                updatedAt={documentData.updated_at}
                creatorName={creatorName}
                onStatusChange={handleStatusChange}
                onSave={handleSave}
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                onSolicitudIdChange={handleSolicitudIdChange}
                searchSolicitudes={searchSolicitudes}
                initialSolicitudLabel={initialSolicitudLabel}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RibReporteTributarioForm;