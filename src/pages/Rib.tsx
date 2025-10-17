import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, Edit, Trash2, ArrowLeft, User, Calendar, Clock, Users, Briefcase, Plus } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  const [view, setView] = useState<'list' | 'search_results' | 'form'>('list');
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [allRibs, setAllRibs] = useState<RibWithDetails[]>([]);
  const [loadingAllRibs, setLoadingAllRibs] = useState(true);

  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [existingRibs, setExistingRibs] = useState<Rib[]>([]);
  const [selectedRib, setSelectedRib] = useState<Rib | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<{ fullName: string | null; email: string | null } | null>(null);
  const [accionistas, setAccionistas] = useState<Accionista[]>([]);
  const [gerentes, setGerentes] = useState<Gerente[]>([]);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);
  
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
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadAllRibs();
  }, []);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialFormData));
  }, [formData, initialFormData]);

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
          nombre_empresa: rucToNameMap.get(rib.ruc) || 'Razón Social no encontrada',
          profiles: rib.user_id ? userMap.get(rib.user_id) || null : null,
        }));
        
        setAllRibs(enrichedRibs);
      } else {
        setAllRibs([]);
      }
    } catch (err) {
      console.error("Failed to load RIBs:", err);
      showError('No se pudieron cargar los análisis RIB.');
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
  };

  const handleSearch = async (rucToSearch: string = rucInput) => {
    if (!rucToSearch || rucToSearch.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setExistingRibs([]);
    resetForm();
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
        setView('search_results');
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
    if (!searchedFicha) return;
    if (!formData.solicitud_id) {
      showError('Debe asociar el análisis a una Solicitud de Operación antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      if (selectedRib) {
        await RibService.update(selectedRib.id, { ...formData });
        showSuccess('Análisis RIB actualizado.');
      } else {
        await RibService.create({ ruc: searchedFicha.ruc, ...formData });
        showSuccess('Análisis RIB creado.');
      }
      await loadAllRibs();
      handleBackToList();
    } catch (err) {
      showError('Error al guardar el análisis RIB.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectRibForEdit = async (rib: Rib) => {
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

    setInitialSolicitudLabel(null);
    if (rib.solicitud_id) {
      try {
        const { data: solicitud } = await supabase
          .from('solicitudes_operacion')
          .select('id, ruc, created_at')
          .eq('id', rib.solicitud_id)
          .single();
        if (solicitud) {
          const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).single();
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
        showError("No se pudieron cargar los detalles del creador.");
        setCreatorDetails({ fullName: 'Error al cargar', email: '' });
      }
    }
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
        await handleSelectRibForEdit(rib);
      } else {
        setError('Ficha RUC no encontrada. No se puede editar el análisis RIB.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al cargar el análisis para editar.');
      showError('Error al cargar el análisis.');
    } finally {
      setSearching(false);
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
    setView('list');
    setRucInput('');
    setSearchedFicha(null);
    setExistingRibs([]);
    resetForm();
    setAccionistas([]);
    setGerentes([]);
    setError(null);
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

  const totalPorcentaje = accionistas.reduce((sum, acc) => sum + (Number(acc.porcentaje) || 0), 0);

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Análisis RIB</h1>
            {view !== 'list' && (
              <Button variant="outline" onClick={handleBackToList} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            )}
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
                  <CardTitle className="text-white">Buscar Empresa por RUC</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Ingrese RUC de 11 dígitos" value={rucInput} onChange={(e) => setRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
                  </div>
                  <Button onClick={() => handleSearch()} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
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
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Información de la Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong className="text-gray-400">RUC:</strong> <span className="font-mono">{searchedFicha.ruc}</span></p>
                  <p><strong className="text-gray-400">Razón Social:</strong> {searchedFicha.nombre_empresa}</p>
                  <p><strong className="text-gray-400">Estado:</strong> {searchedFicha.estado_contribuyente}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <span>{selectedRib ? 'Editando Análisis RIB' : 'Nuevo Análisis RIB'}</span>
                  </CardTitle>
                </CardHeader>
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
              </Card>

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Visita</CardTitle>
                </CardHeader>
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
              </Card>

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Detalles Adicionales</CardTitle>
                </CardHeader>
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
              </Card>

              {accionistas.length > 0 && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Users className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Accionistas
                    </CardTitle>
                  </CardHeader>
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
                </Card>
              )}

              {gerentes.length > 0 && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Briefcase className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Gerencia
                    </CardTitle>
                  </CardHeader>
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
                </Card>
              )}

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Gestión del Análisis</CardTitle>
                    {isAdmin && (
                      <Button onClick={handleSave} disabled={saving || !isDirty}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {selectedRib ? 'Actualizar' : 'Guardar'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
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
                      
                      {/* Botón para ver historial de auditoría */}
                      <div className="w-full pt-4 border-t border-gray-800">
                        <RibAuditLogViewer ribId={selectedRib.id} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RibPage;