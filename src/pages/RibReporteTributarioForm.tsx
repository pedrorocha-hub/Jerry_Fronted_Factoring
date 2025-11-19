import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, ClipboardList, ArrowLeft, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

type Status = 'Borrador' | 'En revisión' | 'Completado';

interface SearchSuggestion {
  ruc: string;
  nombre_empresa: string;
}

const RibReporteTributarioForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

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
  
  // Search suggestions state
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
      setView('form');
    }
  }, [isEditMode, id]);

  // Track dirty state for manual RUC/nombre changes
  useEffect(() => {
    if (createWithoutRuc && searchedFicha && initialSearchedFicha) {
      const rucChanged = searchedFicha.ruc !== initialSearchedFicha.ruc;
      const nombreChanged = searchedFicha.nombre_empresa !== initialSearchedFicha.nombre_empresa;
      if (rucChanged || nombreChanged) {
        setHasUnsavedChanges(true);
      }
    }
  }, [searchedFicha, initialSearchedFicha, createWithoutRuc]);

  // Close suggestions on outside click
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

  // Real-time search suggestions
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

  const handleLoadForEdit = async (reportId: string) => {
    setSearching(true);
    try {
      const existingDocument = await RibReporteTributarioService.getById(reportId);
      if (existingDocument) {
        const fichaData = await FichaRucService.getByRuc(existingDocument.deudor.ruc);
        
        if (fichaData) {
          // Normal mode: FichaRuc exists
          setSearchedFicha(fichaData);
          setCreateWithoutRuc(false);
        } else {
          // Manual mode: No FichaRuc, use stored nombre_empresa
          const mockFicha: FichaRuc = {
            id: 0,
            ruc: existingDocument.deudor.ruc || '',
            nombre_empresa: existingDocument.nombre_empresa || 'Empresa sin RUC',
            estado_contribuyente: '',
            condicion_contribuyente: '',
            domicilio_fiscal: '',
            fecha_inscripcion: '',
            fecha_inicio_actividades: '',
            actividad_economica: '',
            created_at: new Date().toISOString()
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
            .select('id, ruc, created_at')
            .eq('id', existingDocument.solicitud_id)
            .single();
          
          if (solicitud) {
            const { data: ficha } = await supabase
              .from('ficha_ruc')
              .select('nombre_empresa')
              .eq('ruc', solicitud.ruc)
              .single();
            
            setInitialSolicitudLabel(
              `${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`
            );
          }
        }
      } else {
        showError('No se encontró el reporte para editar.');
        navigate('/rib-reporte-tributario');
      }
    } catch (err) {
      showError('Error al cargar el reporte para editar.');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

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
      // Search by RUC or nombre_empresa
      const { data: fichasData, error: searchError } = await supabase
        .from('ficha_ruc')
        .select('*')
        .or(`ruc.ilike.%${rucInput}%,nombre_empresa.ilike.%${rucInput}%`)
        .limit(1)
        .single();

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
      
      // Crear estructura de documento con deudor
      const newDocument: RibReporteTributarioDocument = {
        deudor: {
          ruc: fichaData.ruc,
          tipo_entidad: 'deudor',
          anio: 2024,
          cuentas_por_cobrar_giro: situacion.data_2024.cuentas_por_cobrar_del_giro,
          total_activos: situacion.data_2024.total_activos,
          cuentas_por_pagar_giro: situacion.data_2024.cuentas_por_pagar_del_giro,
          total_pasivos: situacion.data_2024.total_pasivos,
          capital_pagado: situacion.data_2024.capital_pagado,
          total_patrimonio: situacion.data_2024.total_patrimonio,
          total_pasivo_patrimonio: situacion.data_2024.total_pasivo_y_patrimonio
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
      created_at: new Date().toISOString()
    };
    
    setSearchedFicha(mockFicha);
    setInitialSearchedFicha({ ruc: '', nombre_empresa: '' });
    
    const emptyDocument: RibReporteTributarioDocument = {
      deudor: {
        ruc: '',
        tipo_entidad: 'deudor',
        anio: 2024
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
    
    // Automatically search with selected RUC
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
            cuentas_por_cobrar_giro: situacion.data_2024.cuentas_por_cobrar_del_giro,
            total_activos: situacion.data_2024.total_activos,
            cuentas_por_pagar_giro: situacion.data_2024.cuentas_por_pagar_del_giro,
            total_pasivos: situacion.data_2024.total_pasivos,
            capital_pagado: situacion.data_2024.capital_pagado,
            total_patrimonio: situacion.data_2024.total_patrimonio,
            total_pasivo_patrimonio: situacion.data_2024.total_pasivo_y_patrimonio
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
    if (!showSuggestions || searchSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < searchSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : searchSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(searchSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
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
    
    // Validar RUC o nombre_empresa en modo manual
    if (createWithoutRuc) {
      if (!searchedFicha?.ruc && !searchedFicha?.nombre_empresa) {
        showError('Debe ingresar al menos el RUC o la Razón Social');
        return;
      }
    } else if (!documentData.deudor.ruc) {
      showError('No hay RUC para guardar');
      return;
    }
    
    if (!documentData.solicitud_id) {
      showError('Debe asociar el reporte a una Solicitud de Operación antes de guardar.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Update RUC and nombre_empresa from searchedFicha if in manual mode
      const dataToSave = { ...documentData };
      if (createWithoutRuc && searchedFicha) {
        dataToSave.deudor.ruc = searchedFicha.ruc || '';
        dataToSave.nombre_empresa = searchedFicha.nombre_empresa;
      }
      
      const savedDocument = await RibReporteTributarioService.save(dataToSave);
      setDocumentData(savedDocument);
      setHasUnsavedChanges(false);
      
      // Update initialSearchedFicha after save
      if (createWithoutRuc && searchedFicha) {
        setInitialSearchedFicha({
          ruc: searchedFicha.ruc,
          nombre_empresa: searchedFicha.nombre_empresa
        });
      }
      
      showSuccess('Reporte RIB guardado exitosamente.');
      navigate('/rib-reporte-tributario');
    } catch (err) {
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
                {/* Buscar Empresa Existente */}
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

                {/* Crear Manualmente */}
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
                      <ul className="text-xs text-gray-500 mb-4 space-y-1 list-disc list-inside">
                        <li>No requiere Ficha RUC existente</li>
                        <li>Campos editables manualmente</li>
                        <li>RUC y Razón Social opcionales</li>
                      </ul>
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
              {/* Editable RUC and Razón Social for Manual Mode */}
              {createWithoutRuc && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Información de la Empresa del Deudor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manual-ruc" className="text-gray-300">Número de RUC</Label>
                        <Input
                          id="manual-ruc"
                          value={searchedFicha.ruc}
                          onChange={(e) => {
                            setSearchedFicha({ ...searchedFicha, ruc: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Ingrese RUC (opcional)"
                          maxLength={11}
                          className="bg-gray-900/50 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manual-nombre" className="text-gray-300">Razón Social</Label>
                        <Input
                          id="manual-nombre"
                          value={searchedFicha.nombre_empresa}
                          onChange={(e) => {
                            setSearchedFicha({ ...searchedFicha, nombre_empresa: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="Ingrese razón social (opcional)"
                          className="bg-gray-900/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="space-y-6">
                <div className="border-l-4 border-[#00FF80] pl-4">
                  <h2 className="text-xl font-bold text-white mb-2">
                    ESTADO DE SITUACIÓN FINANCIERA - DATOS DEL DEUDOR
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Información financiera consolidada de {searchedFicha.nombre_empresa || 'la empresa'} (2022-2024)
                  </p>
                </div>
                
                {!createWithoutRuc && searchedFicha.ruc && (
                  <EstadoSituacionTable ruc={searchedFicha.ruc} />
                )}
                
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      {searchedFicha.nombre_empresa}: Estado de situación
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
                  <h2 className="text-xl font-bold text-white mb-2">DATOS DEL PROVEEDOR</h2>
                  <p className="text-gray-400 text-sm">Información financiera del proveedor (opcional)</p>
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