import { supabase } from '@/integrations/supabase/client';

export class ProfileService {
  static async getProfileById(userId: string): Promise<{ full_name: string } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle(); // Changed from single() to maybeSingle() to avoid 406 error

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }
}
</dyad-file>

### 2. Solución Carga en Análisis RIB (`Rib.tsx`)

Agregamos el estado `initializing` para mostrar un spinner de página completa hasta que decidamos qué vista mostrar.

<dyad-write path="src/pages/Rib.tsx" description="Adding initialization loading state to prevent UI flickering between list and form views">
import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, Edit, Trash2, ArrowLeft, User, Calendar, Clock, Users, Briefcase, Plus, FileText, ChevronUp, ChevronDown, MapPin, Eye } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FichaRuc } from '@/types/ficha-ruc';
import { Rib, RibStatus, RibWithDetails } from '@/types/rib';
import { Accionista } from '@/types/accionista';
import { Gerente } from '@/types/gerencia';
import { FichaRucService } from '@/services/fichaRucService';
import { RibService } from '@/services/ribService';
import { AccionistaService } from '@/services/accionistaService';
import { GerenciaService } from '@/services/gerenciaService';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import RibTable from '@/components/rib/RibTable';
import { supabase } from '@/integrations/supabase/client';
import { DatePicker } from '@/components/ui/date-picker';
import { AsyncCombobox, ComboboxOption } from '@/components/ui/async-combobox';
import RibAuditLogViewer from '@/components/audit/RibAuditLogViewer';
import { useSearchParams, useParams } from 'react-router-dom';
import RibProcessWizard from '@/components/solicitud-operacion/RibProcessWizard';

const getStatusColor = (status: RibStatus | null | undefined) => {
  switch (status) {
    case 'Completado':
      return 'bg-green-500/20 text-green-400';
    case 'En revisión':
      return 'bg-yellow-500/20 text-yellow-400';
    case 'Borrador':
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
};

const RibPage = () => {
  const { isAdmin } = useSession();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  
  // Estado de inicialización para evitar parpadeos
  const [initializing, setInitializing] = useState(true);

  const [view, setView] = useState<'list' | 'search_results' | 'form' | 'create_mode'>('list');
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createWithoutRuc, setCreateWithoutRuc] = useState(false);
  
  const [allRibs, setAllRibs] = useState<RibWithDetails[]>([]);
  const [loadingAllRibs, setLoadingAllRibs] = useState(true);

  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [existingRibs, setExistingRibs] = useState<Rib[]>([]);
  const [selectedRib, setSelectedRib] = useState<Rib | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<{ fullName: string | null; email: string | null } | null>(null);
  const [accionistas, setAccionistas] = useState<Accionista[]>([]);
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);
  
  // Estados para controlar secciones colapsables
  const [openSections, setOpenSections] = useState({
    company: true,
    contact: true,
    visita: false,
    details: false,
    shareholders: true,
    management: true,
    admin: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const emptyForm = {
    direccion: '',
    como_llego_lcp: '',
    telefono: '',
    grupo_economico: '',
    visita: '',
    status: 'Borrador' as RibStatus,
    descripcion_empresa: '',
    inicio_actividades: null as string | null,
    relacion_comercial_deudor: '',
    validado_por: '',
    solicitud_id: null as string | null,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [initialFormData, setInitialFormData] = useState(emptyForm);
  const [initialRucInput, setInitialRucInput] = useState('');
  const [initialSearchedFicha, setInitialSearchedFicha] = useState<FichaRuc | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Verificadores de datos para estilos
  const hasContactData = !!(formData.direccion || formData.telefono || formData.grupo_economico || formData.como_llego_lcp);
  const hasVisitaData = !!formData.visita;
  const hasDetailsData = !!(formData.descripcion_empresa || formData.inicio_actividades || formData.relacion_comercial_deudor);

  useEffect(() => {
    // Carga inicial unificada
    const init = async () => {
      setInitializing(true);
      await loadAllRibs(); // Cargar la lista primero

      const solicitudIdParam = searchParams.get('solicitud_id');
      const rucParam = searchParams.get('ruc');

      if (id) {
        // Caso 1: Navegación directa por ID (Editar)
        // loadAllRibs ya cargó los datos, buscamos el específico
        // Nota: loadAllRibs es asíncrono, necesitamos esperar a que el estado se actualice o buscar directamente
        const ribToEdit = await RibService.getByRuc(rucParam || ''); // Optimización: buscar solo si es necesario, o buscar por ID directamente
        // Como RibService.getByRuc devuelve array, mejor usamos la lógica de ID si ya tenemos allRibs o hacemos fetch directo
        // Para simplificar y evitar race conditions con allRibs state, buscamos el específico aqui si es necesario
        // Pero como ya llamamos a loadAllRibs, podemos filtrar despues. 
        // Mejor enfoque: Hacer la lógica de routing AQUI mismo después de cargar todo
        
        // Simulación: Buscamos en el array que acabamos de cargar (o hacemos fetch directo)
        // Dado que loadAllRibs setea el estado, no podemos acceder a allRibs inmediatamente aquí debido a clausuras.
        // Haremos fetch directo del item para asegurar.
        const { data: directRib } = await supabase.from('rib').select('*').eq('id', id).single();
        if (directRib) {
            // Need to enrich it to match RibWithDetails
            await handleEditFromList(directRib as any); 
        }
      } else if (solicitudIdParam && rucParam) {
        // Caso 2: Navegación desde Wizard (Auto-selección)
        await handleAutoSelect(solicitudIdParam, rucParam);
      } else {
        // Caso 3: Vista de lista normal
        setInitializing(false);
      }
    };

    init();
  }, [id, searchParams]); // Dependencias mínimas para que corra al montar o cambiar URL

  const handleAutoSelect = async (solicitudId: string, ruc: string) => {
    try {
        const { data: existingRib, error } = await supabase
          .from('rib')
          .select('*')
          .eq('solicitud_id', solicitudId)
          .maybeSingle();

        if (existingRib) {
          const fichaData = await FichaRucService.getByRuc(existingRib.ruc);
          
          if (fichaData) {
            setSearchedFicha(fichaData);
            const [accionistasData, gerentesData] = await Promise.all([
              AccionistaService.getByRuc(existingRib.ruc),
              GerenciaService.getAllByRuc(existingRib.ruc)
            ]);
            setAccionistas(accionistasData);
            setGerentes(gerentesData);
            setCreateWithoutRuc(false);
          } else {
            setSearchedFicha({
                id: 0,
                ruc: existingRib.ruc,
                nombre_empresa: existingRib.nombre_empresa || 'Empresa Manual',
                actividad_empresa: '',
                created_at: existingRib.created_at,
                updated_at: existingRib.updated_at,
            } as FichaRuc);
            setCreateWithoutRuc(true);
            setInitialSearchedFicha({ 
                ruc: existingRib.ruc, 
                nombre_empresa: existingRib.nombre_empresa || 'Empresa Manual' 
            });
            setAccionistas([]);
            setGerentes([]);
          }
          
          await handleSelectRibForEdit(existingRib);
          showSuccess('Se encontró un RIB existente para esta solicitud.');
          
        } else {
          setRucInput(ruc);
          const fichaData = await FichaRucService.getByRuc(ruc);
          let empresaNombreForLabel = '';
          
          if (fichaData) {
             setSearchedFicha(fichaData);
             empresaNombreForLabel = fichaData.nombre_empresa;
             
             const [ribData, accionistasData, gerentesData] = await Promise.all([
                RibService.getByRuc(ruc),
                AccionistaService.getByRuc(ruc),
                GerenciaService.getAllByRuc(ruc)
             ]);
             setExistingRibs(ribData);
             setAccionistas(accionistasData);
             setGerentes(gerentesData);
             setCreateWithoutRuc(false);
          } else {
             const { data: solicitudData } = await supabase
                .from('solicitudes_operacion')
                .select('proveedor')
                .eq('id', solicitudId)
                .single();
                
             const nombreProveedor = solicitudData?.proveedor || 'Empresa sin nombre';
             empresaNombreForLabel = nombreProveedor;
             
             const manualFicha = {
                id: 0,
                ruc: ruc,
                nombre_empresa: nombreProveedor,
                actividad_empresa: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
             } as FichaRuc;
             
             setSearchedFicha(manualFicha);
             setCreateWithoutRuc(true);
             setInitialSearchedFicha({ ruc: ruc, nombre_empresa: nombreProveedor });
             setAccionistas([]);
             setGerentes([]);
             
             showSuccess('Ficha RUC no encontrada. Iniciando modo manual con datos de la solicitud.');
          }
          
          setFormData(prev => ({ ...prev, solicitud_id: solicitudId }));
          
          const { data: solicitud } = await supabase
            .from('solicitudes_operacion')
            .select('id, created_at')
            .eq('id', solicitudId)
            .single();
            
          if (solicitud) {
             setInitialSolicitudLabel(`${empresaNombreForLabel} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
          }
          
          setView('form');
        }
    } catch (e) {
        console.error("Error auto-selecting RIB:", e);
        showError("Error al cargar datos automáticos");
    } finally {
        setInitializing(false);
    }
  };

  useEffect(() => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    const rucChanged = createWithoutRuc && rucInput !== initialRucInput;
    const fichaChanged = createWithoutRuc && searchedFicha && initialSearchedFicha && 
      (searchedFicha.nombre_empresa !== initialSearchedFicha.nombre_empresa || 
       searchedFicha.ruc !== initialSearchedFicha.ruc);
    
    setIsDirty(formChanged || rucChanged || fichaChanged);
  }, [formData, initialFormData, rucInput, initialRucInput, searchedFicha, initialSearchedFicha, createWithoutRuc]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const loadAllRibs = async () => {
    setLoadingAllRibs(true);
    try {
      const ribData = await RibService.getAll();
      if (ribData.length > 0) {
        const rucs = [...new Set(ribData.map(r => r.ruc))];
        const { data: fichasData, error: fichasError } = await supabase
          .from('ficha_ruc')
          .select('ruc, nombre_empresa')
          .in('ruc', rucs);
        if (fichasError) throw fichasError;
        const rucToNameMap = new Map(fichasData.map(f => [f.ruc, f.nombre_empresa]));

        const userIds = [...new Set(ribData.map(r => r.user_id).filter((id): id is string => !!id))];
        let userMap = new Map<string, { full_name: string | null }>();
        if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', userIds);
            if (profilesError) throw profilesError;
            profilesData.forEach(p => userMap.set(p.id, { full_name: p.full_name }));
        }

        const enrichedRibs = ribData.map(rib => ({
          ...rib,
          nombre_empresa: rib.nombre_empresa || rucToNameMap.get(rib.ruc) || 'Razón Social no encontrada',
          profiles: rib.user_id ? userMap.get(rib.user_id) || null : null,
        }));
        
        setAllRibs(enrichedRibs);
      } else {
        setAllRibs([]);
      }
    } catch (err) {
      console.error("Failed to load RIBs:", err);
      // Don't show toast error here to avoid spam if it's just empty or connection blip during init
    } finally {
      setLoadingAllRibs(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setInitialFormData(emptyForm);
    setSelectedRib(null);
    setCreatorDetails(null);
    setInitialSolicitudLabel(null);
    setCreateWithoutRuc(false);
    setInitialRucInput('');
    setInitialSearchedFicha(null);
    setOpenSections({
        company: true,
        contact: true,
        visita: false,
        details: false,
        shareholders: true,
        management: true,
        admin: true
    });
  };

  const handleSearch = async (rucToSearch: string = rucInput) => {
    if (!rucToSearch || rucToSearch.length !== 11) {
      if (!searchParams.get('ruc') && !id) {
        setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      }
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setExistingRibs([]);
    setAccionistas([]);
    setGerentes([]);

    try {
      const fichaData = await FichaRucService.getByRuc(rucToSearch);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const [ribData, accionistasData, gerentesData] = await Promise.all([
          RibService.getByRuc(rucToSearch),
          AccionistaService.getByRuc(rucToSearch),
          GerenciaService.getAllByRuc(rucToSearch)
        ]);
        setExistingRibs(ribData);
        setAccionistas(accionistasData);
        setGerentes(gerentesData);
        if (!searchParams.get('solicitud_id') && !id) {
            setView('search_results');
        }
      } else {
        setError('Ficha RUC no encontrada. No se puede crear un análisis RIB.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la empresa.');
      showError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value: RibStatus) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSave = async () => {
    const ruc = searchedFicha?.ruc || rucInput;
    if (!ruc) {
      showError('Debe ingresar un RUC para guardar.');
      return;
    }
    if (ruc.length !== 11) {
      showError('El RUC debe tener 11 dígitos.');
      return;
    }
    if (!formData.solicitud_id) {
      showError('Debe asociar el análisis a una Solicitud de Operación antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        nombre_empresa: createWithoutRuc ? searchedFicha?.nombre_empresa : null,
      };
      
      if (selectedRib) {
        await RibService.update(selectedRib.id, dataToSave);
        showSuccess('Análisis RIB actualizado.');
      } else {
        await RibService.create({ ruc, ...dataToSave });
        showSuccess('Análisis RIB creado.');
      }
      await loadAllRibs();
      window.history.replaceState({}, '', '/rib');
      handleBackToList();
    } catch (err) {
      showError('Error al guardar el análisis RIB.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectRibForEdit = async (rib: Rib | RibWithDetails) => {
    setSelectedRib(rib);
    const newFormData = {
      direccion: rib.direccion || '',
      como_llego_lcp: rib.como_llego_lcp || '',
      telefono: rib.telefono || '',
      grupo_economico: rib.grupo_economico || '',
      visita: rib.visita || '',
      status: rib.status || 'Borrador',
      descripcion_empresa: rib.descripcion_empresa || '',
      inicio_actividades: rib.inicio_actividades || null,
      relacion_comercial_deudor: rib.relacion_comercial_deudor || '',
      validado_por: rib.validado_por || '',
      solicitud_id: rib.solicitud_id || null,
    };
    setFormData(newFormData);
    setInitialFormData(newFormData);
    
    setInitialRucInput(rucInput);
    setInitialSearchedFicha(searchedFicha);

    setInitialSolicitudLabel(null);
    if (rib.solicitud_id) {
      try {
        const { data: solicitud } = await supabase
          .from('solicitudes_operacion')
          .select('id, ruc, created_at')
          .eq('id', rib.solicitud_id)
          .single();
        if (solicitud) {
          const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).maybeSingle();
          setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
        }
      } catch (err) {
        console.error("Error fetching solicitud label:", err);
      }
    }

    setCreatorDetails(null);
    if (rib.user_id) {
      try {
        const { data, error } = await supabase.rpc('get_user_details', { user_id_input: rib.user_id });
        if (error) throw error;
        if (data && data.length > 0) {
          setCreatorDetails({ fullName: data[0].full_name, email: data[0].email });
        } else {
          setCreatorDetails({ fullName: 'Usuario no encontrado', email: '' });
        }
      } catch (err) {
        console.error("Error fetching creator details:", err);
        // Silent fail or just default
        setCreatorDetails({ fullName: 'Error al cargar', email: '' });
      }
    }

    // Configurar secciones abiertas según si tienen datos
    setOpenSections({
        company: true, // Siempre abierta al editar
        contact: !!(rib.direccion || rib.telefono || rib.grupo_economico),
        visita: !!rib.visita,
        details: !!(rib.descripcion_empresa || rib.inicio_actividades),
        shareholders: true,
        management: true,
        admin: true
    });

    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este análisis RIB?')) {
      try {
        await RibService.delete(id);
        showSuccess('Análisis RIB eliminado.');
        await loadAllRibs();
        if (searchedFicha) {
          setExistingRibs(prev => prev.filter(r => r.id !== id));
        }
        if (selectedRib?.id === id) {
          resetForm();
          setView('search_results');
        }
      } catch (err) {
        showError('Error al eliminar el análisis.');
      }
    }
  };

  const handleEditFromList = async (rib: RibWithDetails) => {
    setSearching(true);
    setInitializing(true); // START LOADING
    setError(null);
    try {
      const fichaData = await FichaRucService.getByRuc(rib.ruc);
      
      if (fichaData) {
        setSearchedFicha(fichaData);
        const [accionistasData, gerentesData] = await Promise.all([
          AccionistaService.getByRuc(rib.ruc),
          GerenciaService.getAllByRuc(rib.ruc)
        ]);
        setAccionistas(accionistasData);
        setGerentes(gerentesData);
        setCreateWithoutRuc(false);
      } else {
        setSearchedFicha({
          id: 0,
          ruc: rib.ruc,
          nombre_empresa: rib.nombre_empresa || 'Empresa Manual',
          actividad_empresa: '',
          created_at: rib.created_at,
          updated_at: rib.updated_at,
        } as FichaRuc);
        setAccionistas([]);
        setGerentes([]);
        setCreateWithoutRuc(true);
        setRucInput(rib.ruc);
      }
      
      await handleSelectRibForEdit(rib);
    } catch (err) {
      setSearchedFicha({
        id: 0,
        ruc: rib.ruc,
        nombre_empresa: rib.nombre_empresa || 'Empresa Manual',
        actividad_empresa: '',
        created_at: rib.created_at,
        updated_at: rib.updated_at,
      } as FichaRuc);
      setAccionistas([]);
      setGerentes([]);
      setCreateWithoutRuc(true);
      setRucInput(rib.ruc);
      
      await handleSelectRibForEdit(rib);
    } finally {
      setSearching(false);
      setInitializing(false); // END LOADING
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setView('form');
  };

  const handleBackToList = () => {
    if (isDirty && !window.confirm('Hay cambios sin guardar. ¿Está seguro de que quiere volver a la lista?')) {
      return;
    }
    window.history.replaceState({}, '', '/rib');
    
    setView('list');
    setRucInput('');
    setSearchedFicha(null);
    setExistingRibs([]);
    resetForm();
    setAccionistas([]);
    setGerentes([]);
    setError(null);
    setCreateWithoutRuc(false);
  };

  const handleShowCreateMode = () => {
    setView('create_mode');
    setRucInput('');
    setSearchedFicha(null);
    setExistingRibs([]);
    resetForm();
    setError(null);
  };

  const handleCreateManually = () => {
    setCreateWithoutRuc(true);
    const emptyFicha = {
      id: 0,
      ruc: '',
      nombre_empresa: '',
      actividad_empresa: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as FichaRuc;
    setSearchedFicha(emptyFicha);
    setInitialSearchedFicha(emptyFicha);
    setInitialRucInput('');
    setView('form');
    // En modo manual, abrimos la primera sección editable
    setOpenSections(prev => ({...prev, contact: true}));
  };

  const handleSearchAndCreate = async () => {
    await handleSearch(rucInput);
    if (searchedFicha) {
      handleCreateNew();
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

  const searchFichas = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    try {
      return await FichaRucService.search(query);
    } catch (error) {
      console.error("Error searching fichas:", error);
      showError("Error al buscar empresas.");
      return [];
    }
  };

  const totalPorcentaje = accionistas.reduce((sum, acc) => sum + (Number(acc.porcentaje) || 0), 0);

  // VISTA DE CARGA INICIAL
  if (initializing) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 text-[#00FF80] animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Cargando Análisis RIB...</h2>
          <p className="text-gray-400">Preparando datos del cliente y solicitud</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Análisis RIB</h1>
            <div className="flex gap-2">
              {view === 'list' && isAdmin && (
                <Button onClick={handleShowCreateMode} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo RIB
                </Button>
              )}
              {view !== 'list' && (
                <Button variant="outline" onClick={handleBackToList} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a la lista
                </Button>
              )}
            </div>
          </div>

          {view === 'list' && (
            <div className="space-y-6">
              {searching && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                    <span className="text-white">Cargando editor...</span>
                  </div>
                </div>
              )}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Buscar Empresa</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 w-full">
                    <AsyncCombobox
                      value={rucInput}
                      onChange={(value) => setRucInput(value || '')}
                      onSearch={searchFichas}
                      placeholder="Buscar por RUC o nombre de empresa..."
                      searchPlaceholder="Escriba para buscar..."
                      emptyMessage="No se encontraron empresas."
                    />
                  </div>
                  <Button onClick={() => handleSearch(rucInput)} disabled={searching || !rucInput} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                    {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Todos los RIBs Creados</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingAllRibs ? (
                    <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div>
                  ) : allRibs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400"><p>No hay análisis RIB creados.</p></div>
                  ) : (
                    <RibTable ribs={allRibs} onEdit={handleEditFromList} onDelete={handleDelete} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {view === 'create_mode' && (
            <Card className="bg-[#121212] border border-gray-800 w-full max-w-2xl mx-auto">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white flex items-center text-xl">
                  <Plus className="h-6 w-6 mr-3 text-[#00FF80]" />
                  Crear Nuevo Análisis RIB
                </CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Seleccione cómo desea crear el análisis RIB
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
                      Busque el RUC o nombre de la empresa en el sistema.
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
                      {error && (
                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <Button 
                        onClick={handleSearchAndCreate} 
                        disabled={searching || !rucInput} 
                        className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black w-full"
                        size="lg"
                      >
                        {searching ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4 mr-2" />
                        )}
                        Buscar y Crear RIB
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
                      Complete el formulario sin necesidad de tener la empresa en el sistema.
                    </p>
                    <div className="ml-8">
                      <Button 
                        variant="outline" 
                        onClick={handleCreateManually} 
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
                    onClick={handleBackToList} 
                    className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {view === 'search_results' && searchedFicha && (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Resultados para: {searchedFicha.nombre_empresa}</CardTitle>
                  <p className="text-gray-400 font-mono">{searchedFicha.ruc}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-4">
                    <Button onClick={handleCreateNew} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nuevo Análisis RIB
                    </Button>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Análisis Existentes ({existingRibs.length})</h3>
                  {existingRibs.length > 0 ? (
                    <Table>
                      <TableHeader><TableRow className="border-gray-800"><TableHead className="text-gray-300">Fecha Creación</TableHead><TableHead className="text-gray-300">Estado</TableHead><TableHead className="text-right text-gray-300">Acciones</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {existingRibs.map(rib => (
                          <TableRow key={rib.id} className="border-gray-800">
                            <TableCell>{new Date(rib.created_at).toLocaleDateString()}</TableCell>
                            <TableCell><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(rib.status)}`}>{rib.status || 'Borrador'}</span></TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleSelectRibForEdit(rib)} className="text-gray-400 hover:text-white"><Edit className="h-4 w-4 mr-2" />Editar</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-gray-400 py-4">No hay análisis previos para este RUC.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {view === 'form' && searchedFicha && (
            <div className="space-y-6">
              <RibProcessWizard solicitudId={formData.solicitud_id || undefined} currentStep="rib" />

              {/* Card 1: Información de la Empresa */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-900/50 transition-colors"
                  onClick={() => toggleSection('company')}
                >
                  <CardTitle className={`flex items-center justify-between ${openSections.company ? 'text-white' : 'text-gray-500'}`}>
                    <div className="flex items-center">
                        <Building2 className={`h-5 w-5 mr-2 ${openSections.company ? 'text-[#00FF80]' : 'text-gray-600'}`} />
                        Información de la Empresa
                    </div>
                    {openSections.company ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
                {openSections.company && (
                  <CardContent className="space-y-4">
                    {createWithoutRuc ? (
                      <>
                        <div>
                          <Label htmlFor="ruc_manual">RUC</Label>
                          <Input 
                            id="ruc_manual" 
                            value={rucInput} 
                            onChange={(e) => setRucInput(e.target.value)}
                            className="bg-gray-900/50 border-gray-700 font-mono text-white"
                            maxLength={11}
                            placeholder="11 dígitos"
                            disabled={!isAdmin}
                          />
                        </div>
                        <div>
                          <Label htmlFor="nombre_empresa_manual">Razón Social</Label>
                          <Input 
                            id="nombre_empresa_manual" 
                            value={searchedFicha.nombre_empresa} 
                            onChange={(e) => setSearchedFicha(prev => prev ? {...prev, nombre_empresa: e.target.value} : null)}
                            className="bg-gray-900/50 border-gray-700"
                            placeholder="Nombre de la empresa"
                            disabled={!isAdmin}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p><strong className="text-gray-400">RUC:</strong> <span className="font-mono">{searchedFicha.ruc}</span></p>
                        <p><strong className="text-gray-400">Razón Social:</strong> {searchedFicha.nombre_empresa}</p>
                        <p><strong className="text-gray-400">Estado:</strong> {searchedFicha.estado_contribuyente}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Card 2: Datos de Contacto y Ubicación */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-900/50 transition-colors"
                  onClick={() => toggleSection('contact')}
                >
                  <CardTitle className={`flex items-center justify-between ${openSections.contact || hasContactData ? 'text-white' : 'text-gray-500'}`}>
                    <div className="flex items-center">
                        <MapPin className={`h-5 w-5 mr-2 ${openSections.contact || hasContactData ? 'text-[#00FF80]' : 'text-gray-600'}`} />
                        Datos de Contacto y Ubicación
                    </div>
                    {openSections.contact ? <ChevronUp className="h-5 w-5" /> : (
                         <div className="flex items-center text-sm font-normal">
                             <span>Añadir</span> <Plus className="ml-1 h-4 w-4" />
                         </div>
                    )}
                  </CardTitle>
                </CardHeader>
                {openSections.contact && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="direccion">Dirección del Proveedor</Label>
                      <Input id="direccion" value={formData.direccion} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" value={formData.telefono || ''} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                      <div>
                        <Label htmlFor="grupo_economico">Grupo Económico</Label>
                        <Input id="grupo_economico" value={formData.grupo_economico || ''} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700" disabled={!isAdmin} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="como_llego_lcp">¿Cómo llegó a LCP?</Label>
                      <Textarea
                        id="como_llego_lcp"
                        value={formData.como_llego_lcp}
                        onChange={handleFormChange}
                        placeholder="Especificar cómo llegó a LCP; si es referido indicar el nombre completo de quien proviene la referencia"
                        className="bg-gray-900/50 border-gray-700"
                        disabled={!isAdmin}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Card 3: Visita */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-900/50 transition-colors"
                  onClick={() => toggleSection('visita')}
                >
                  <CardTitle className={`flex items-center justify-between ${openSections.visita || hasVisitaData ? 'text-white' : 'text-gray-500'}`}>
                    <div className="flex items-center">
                        <Eye className={`h-5 w-5 mr-2 ${openSections.visita || hasVisitaData ? 'text-[#00FF80]' : 'text-gray-600'}`} />
                        Visita
                    </div>
                     {openSections.visita ? <ChevronUp className="h-5 w-5" /> : (
                         <div className="flex items-center text-sm font-normal">
                             <span>Añadir</span> <Plus className="ml-1 h-4 w-4" />
                         </div>
                    )}
                  </CardTitle>
                </CardHeader>
                {openSections.visita && (
                  <CardContent>
                    <Textarea
                      id="visita"
                      value={formData.visita}
                      onChange={handleFormChange}
                      placeholder="(indicar la fecha de la visita día/mes/año, con quien se tuvo la reunión, que funciona en la dirección, si es un local/oficina propio o alquilada, entre otra información que se considere relevante)"
                      className="bg-gray-900/50 border-gray-700 min-h-[120px]"
                      disabled={!isAdmin}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Card 4: Detalles Adicionales */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-900/50 transition-colors"
                  onClick={() => toggleSection('details')}
                >
                  <CardTitle className={`flex items-center justify-between ${openSections.details || hasDetailsData ? 'text-white' : 'text-gray-500'}`}>
                    <div className="flex items-center">
                        <FileText className={`h-5 w-5 mr-2 ${openSections.details || hasDetailsData ? 'text-[#00FF80]' : 'text-gray-600'}`} />
                        Detalles Adicionales
                    </div>
                     {openSections.details ? <ChevronUp className="h-5 w-5" /> : (
                         <div className="flex items-center text-sm font-normal">
                             <span>Añadir</span> <Plus className="ml-1 h-4 w-4" />
                         </div>
                    )}
                  </CardTitle>
                </CardHeader>
                {openSections.details && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="descripcion_empresa">Descripción de la empresa</Label>
                      <Textarea
                        id="descripcion_empresa"
                        value={formData.descripcion_empresa || ''}
                        onChange={handleFormChange}
                        placeholder="(comentar la actividad de la empresa en resumen, líneas de negocio, principales clientes, principales proveedores, proyección de ventas y en qué se sustenta; quien posee el know-how del negocio, así como su experiencia, su formación; entre otra información que se pueda tener en la visita o reunión)"
                        className="bg-gray-900/50 border-gray-700 min-h-[120px]"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <Label htmlFor="inicio_actividades">Inicio de actividades</Label>
                      <DatePicker
                        date={formData.inicio_actividades ? new Date(formData.inicio_actividades) : undefined}
                        setDate={(date) => setFormData(prev => ({ ...prev, inicio_actividades: date ? date.toISOString().split('T')[0] : null }))}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <Label htmlFor="relacion_comercial_deudor">Relación comercial con el deudor</Label>
                      <Textarea
                        id="relacion_comercial_deudor"
                        value={formData.relacion_comercial_deudor || ''}
                        onChange={handleFormChange}
                        placeholder="(aquí pueden indicar la relación entre el proveedor y deudor, además de comentar brevemente cómo se orgina la factura a descontar)"
                        className="bg-gray-900/50 border-gray-700"
                        disabled={!isAdmin}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {accionistas.length > 0 && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-900/50 transition-colors"
                    onClick={() => toggleSection('shareholders')}
                  >
                    <CardTitle className={`flex items-center justify-between ${openSections.shareholders ? 'text-white' : 'text-gray-500'}`}>
                      <div className="flex items-center">
                          <Users className={`h-5 w-5 mr-2 ${openSections.shareholders ? 'text-[#00FF80]' : 'text-gray-600'}`} />
                          Accionistas
                      </div>
                      {openSections.shareholders ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </CardTitle>
                  </CardHeader>
                  {openSections.shareholders && (
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-gray-900/50">
                            <TableHead className="text-gray-300">DNI</TableHead>
                            <TableHead className="text-gray-300">Nombre</TableHead>
                            <TableHead className="text-gray-300">Porcentaje</TableHead>
                            <TableHead className="text-gray-300">Vínculo</TableHead>
                            <TableHead className="text-gray-300">Calificación</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accionistas.map(accionista => (
                            <TableRow key={accionista.id} className="border-gray-800 hover:bg-gray-900/50">
                              <TableCell className="font-mono">{accionista.dni}</TableCell>
                              <TableCell>{accionista.nombre}</TableCell>
                              <TableCell>{accionista.porcentaje ? `${accionista.porcentaje}%` : '-'}</TableCell>
                              <TableCell>{accionista.vinculo || '-'}</TableCell>
                              <TableCell>{accionista.calificacion || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow className="border-gray-800 font-bold text-white hover:bg-gray-900/50">
                            <TableCell colSpan={2} className="text-right pr-4">Total</TableCell>
                            <TableCell>{totalPorcentaje.toFixed(2)}%</TableCell>
                            <TableCell colSpan={2}></TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              )}

              {gerentes.length > 0 && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-900/50 transition-colors"
                    onClick={() => toggleSection('management')}
                  >
                    <CardTitle className={`flex items-center justify-between ${openSections.management ? 'text-white' : 'text-gray-500'}`}>
                      <div className="flex items-center">
                          <Briefcase className={`h-5 w-5 mr-2 ${openSections.management ? 'text-[#00FF80]' : 'text-gray-600'}`} />
                          Gerencia
                      </div>
                      {openSections.management ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </CardTitle>
                  </CardHeader>
                  {openSections.management && (
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-800 hover:bg-gray-900/50">
                            <TableHead className="text-gray-300">DNI</TableHead>
                            <TableHead className="text-gray-300">Nombre</TableHead>
                            <TableHead className="text-gray-300">Cargo</TableHead>
                            <TableHead className="text-gray-300">Vínculo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {gerentes.map(gerente => (
                            <TableRow key={gerente.id} className="border-gray-800 hover:bg-gray-900/50">
                              <TableCell className="font-mono">{gerente.dni}</TableCell>
                              <TableCell>{gerente.nombre}</TableCell>
                              <TableCell>{gerente.cargo || '-'}</TableCell>
                              <TableCell>{gerente.vinculo || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              )}

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader 
                    className="cursor-pointer hover:bg-gray-900/50 transition-colors"
                    onClick={() => toggleSection('admin')}
                >
                  <div className="flex justify-between items-center w-full">
                    <CardTitle className={`flex items-center ${openSections.admin ? 'text-white' : 'text-gray-500'}`}>
                        Gestión del Análisis
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleSave(); }} 
                            disabled={saving || !isDirty}
                            size="sm"
                          >
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {selectedRib ? 'Actualizar' : 'Guardar'}
                          </Button>
                        )}
                        {openSections.admin ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>
                {openSections.admin && (
                  <CardContent className="flex flex-col items-start space-y-4 text-sm text-gray-300 pt-4">
                    <div className="w-full pt-2">
                      <Label htmlFor="solicitud_id" className="font-semibold text-white">Asociar a Solicitud de Operación</Label>
                      <AsyncCombobox
                        value={formData.solicitud_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, solicitud_id: value }))}
                        onSearch={searchSolicitudes}
                        placeholder="Buscar por RUC, empresa o ID de solicitud..."
                        searchPlaceholder="Escriba para buscar..."
                        emptyMessage="No se encontraron solicitudes."
                        disabled={!isAdmin}
                        initialDisplayValue={initialSolicitudLabel}
                        popoverWidth="w-[600px] max-w-[90vw]"
                      />
                    </div>
                    <div className="w-full pt-2">
                      <Label htmlFor="validado_por" className="font-semibold text-white">Validado por</Label>
                      <Input
                        id="validado_por"
                        value={formData.validado_por || ''}
                        onChange={handleFormChange}
                        className="bg-gray-900/50 border-gray-700 mt-1"
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="w-full pt-2">
                      <Label htmlFor="status-edit" className="font-semibold text-white">Estado de Solicitud</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleStatusChange(value as RibStatus)}
                        disabled={!isAdmin}
                      >
                        <SelectTrigger id="status-edit" className="bg-gray-900/50 border-gray-700 mt-1">
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Borrador">Borrador</SelectItem>
                          <SelectItem value="En revisión">En revisión</SelectItem>
                          <SelectItem value="Completado">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedRib && (
                      <div className="w-full pt-4 border-t border-gray-800 mt-4 space-y-2">
                        <div className="flex items-start">
                          <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0 mt-1" />
                          <div>
                            <p>
                              <strong className="text-gray-400">Ejecutivo:</strong>
                              {selectedRib.user_id ? (
                                creatorDetails ? (
                                  <span> {creatorDetails.fullName} ({creatorDetails.email})</span>
                                ) : (
                                  <span> Cargando...</span>
                                )
                              ) : (
                                <span> Desconocido</span>
                              )}
                            </p>
                            <div className="flex items-center mt-1 text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span className="text-xs">
                                {new Date(selectedRib.created_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <strong className="text-gray-400">Última modificación:</strong>{' '}
                            {new Date(selectedRib.updated_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })}
                          </div>
                        </div>
                        
                        <div className="w-full pt-4 border-t border-gray-800">
                          <RibAuditLogViewer ribId={selectedRib.id} />
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>

            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RibPage;