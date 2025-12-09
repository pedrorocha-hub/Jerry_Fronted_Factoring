import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, BarChart3, ArrowLeft, Plus, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesService } from '@/services/ventasMensualesService';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { VentasMensuales, VentasStatus } from '@/types/ventasMensuales';
import VentasMensualesTable from '@/components/ventas-mensuales/VentasMensualesTable';
import VentasStatusManager from '@/components/ventas-mensuales/VentasStatusManager';
import VentasMensualesAuditLogViewer from '@/components/audit/VentasMensualesAuditLogViewer';
import { showSuccess, showError } from '@/utils/toast';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxOption, AsyncCombobox } from '@/components/ui/async-combobox';
import { SalesData } from '@/types/salesData';
import RibProcessWizard from '@/components/solicitud-operacion/RibProcessWizard';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

const VentasMensualesForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Obtener ID de la URL
  const [searchParams] = useSearchParams();
  
  // Obtener parámetros de la URL
  const rucParam = searchParams.get('ruc');
  const solicitudIdParam = searchParams.get('solicitud_id');
  
  const isEditMode = !!id;

  const [initializing, setInitializing] = useState(true); // NUEVO ESTADO
  const [view, setView] = useState<'create_mode' | 'form'>('create_mode');
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const [proveedorFicha, setProveedorFicha] = useState<FichaRuc | null>(null);
  const [deudorFicha, setDeudorFicha] = useState<FichaRuc | null>(null);
  
  const [proveedorSalesData, setProveedorSalesData] = useState<SalesData>({});
  const [deudorSalesData, setDeudorSalesData] = useState<SalesData>({});
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  const [proveedorRecordIds, setProveedorRecordIds] = useState<Record<number, string>>({});
  const [deudorRecordIds, setDeudorRecordIds] = useState<Record<number, string>>({});

  const [status, setStatus] = useState<VentasStatus>('borrador');
  const [validadoPor, setValidadoPor] = useState<string | null>(null);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  // ... (getAvailableYears, initializeSalesData, extract functions remain same)
  const getAvailableYears = (salesData: SalesData, additionalYears: number[] = []): number[] => {
    const yearsSet = new Set<number>();
    Object.keys(salesData).forEach(year => yearsSet.add(parseInt(year)));
    additionalYears.forEach(year => yearsSet.add(year));
    return Array.from(yearsSet).sort((a, b) => a - b);
  };

  const initializeSalesData = (years: number[]): SalesData => {
    const data: SalesData = {};
    years.forEach(year => {
      data[year] = {};
      MONTHS.forEach(month => { data[year][month] = null; });
    });
    return data;
  };

  const extractSalesDataFromReports = (reports: VentasMensuales[]): { salesData: SalesData; recordIds: Record<number, string>; } => {
    const yearsFromReports = reports.map(r => r.anio);
    const years = getAvailableYears({}, yearsFromReports);
    const salesData = initializeSalesData(years);
    const recordIds: Record<number, string> = {};
    reports.forEach(report => {
      recordIds[report.anio] = report.id;
      if (salesData[report.anio]) {
        MONTHS.forEach(month => {
          const value = report[month as keyof VentasMensuales] as number | null;
          if (value !== null && value !== undefined) salesData[report.anio][month] = value;
        });
      }
    });
    return { salesData, recordIds };
  };

  const extractSalesDataFromReporteTributario = (reportes: any[]): SalesData => {
    const yearsFromReports = reportes.map(r => r.anio_reporte);
    const years = getAvailableYears({}, yearsFromReports);
    const salesData = initializeSalesData(years);
    reportes.forEach(reporte => {
      const year = reporte.anio_reporte;
      if (salesData[year]) {
        MONTHS.forEach(month => {
          const ingresosKey = `ingresos_${month}`;
          if (reporte[ingresosKey] !== null && reporte[ingresosKey] !== undefined) {
            const value = Number(reporte[ingresosKey]);
            if (!isNaN(value)) salesData[year][month] = value;
          }
        });
      }
    });
    return salesData;
  };

  const handleAutoInit = async (ruc: string, solicitudIdFromUrl: string) => {
    setSearching(true);
    setError(null);
    try {
      const existingReports = await VentasMensualesService.getBySolicitudId(ruc, solicitudIdFromUrl);

      setSolicitudId(solicitudIdFromUrl);
      const { data: solicitudData } = await supabase
        .from('solicitudes_operacion')
        .select('id, ruc, created_at, deudor_ruc')
        .eq('id', solicitudIdFromUrl)
        .single();

      if (solicitudData) {
        const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitudData.ruc).maybeSingle();
        setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitudData.ruc} - ${new Date(solicitudData.created_at).toLocaleDateString()}`);
      }

      if (existingReports.length > 0) {
        const firstReport = existingReports[0];
        setStatus(firstReport.status);
        setValidadoPor(firstReport.validado_por);
        
        if (firstReport.user_id) {
            const profile = await ProfileService.getProfileById(firstReport.user_id);
            setCreatorName(profile?.full_name || 'Desconocido');
        }

        const provFicha = await FichaRucService.getByRuc(ruc);
        if (provFicha) {
            setProveedorFicha(provFicha);
        } else {
             const tempFicha: FichaRuc = {
                id: 0,
                ruc: ruc,
                nombre_empresa: existingReports[0].proveedor_ruc || 'Empresa Manual',
                actividad_empresa: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setProveedorFicha(tempFicha);
            setManualMode(true);
        }

        if (firstReport.deudor_ruc) {
            const deudorData = await FichaRucService.getByRuc(firstReport.deudor_ruc);
            setDeudorFicha(deudorData);
        }

        const proveedorReports = existingReports.filter(r => r.tipo_entidad === 'proveedor');
        const deudorReports = existingReports.filter(r => r.tipo_entidad === 'deudor');

        const { salesData: proveedorData, recordIds: proveedorIds } = extractSalesDataFromReports(proveedorReports);
        const { salesData: deudorData, recordIds: deudorIds } = extractSalesDataFromReports(deudorReports);
        
        setProveedorSalesData(proveedorData);
        setDeudorSalesData(deudorData);
        setProveedorRecordIds(proveedorIds);
        setDeudorRecordIds(deudorIds);
        
        const allYears = getAvailableYears(proveedorData, Object.keys(deudorData).map(y => parseInt(y)));
        setAvailableYears(allYears);

      } else {
        const provFicha = await FichaRucService.getByRuc(ruc);
        if (provFicha) {
            setProveedorFicha(provFicha);
            const reportesTributarios = await ReporteTributarioService.getReportesByRuc(ruc);
            if (reportesTributarios.length > 0) {
                const salesData = extractSalesDataFromReporteTributario(reportesTributarios);
                setProveedorSalesData(salesData);
                setAvailableYears(getAvailableYears(salesData));
                showSuccess('Nuevo reporte inicializado con datos de Reportes Tributarios.');
            } else {
                const initialData = initializeSalesData([currentYear]);
                setProveedorSalesData(initialData);
                setAvailableYears([currentYear]);
            }
        } else {
            const { data: solicitudInfo } = await supabase
                .from('solicitudes_operacion')
                .select('proveedor')
                .eq('id', solicitudIdFromUrl)
                .single();
            
            const tempFicha: FichaRuc = {
                id: 0,
                ruc: ruc,
                nombre_empresa: solicitudInfo?.proveedor || 'Empresa Manual',
                actividad_empresa: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setProveedorFicha(tempFicha);
            setManualMode(true);
            const initialData = initializeSalesData([currentYear]);
            setProveedorSalesData(initialData);
            setAvailableYears([currentYear]);
            showSuccess('Empresa no encontrada. Inicializando en modo manual.');
        }

        if (solicitudData?.deudor_ruc) {
            const deudorData = await FichaRucService.getByRuc(solicitudData.deudor_ruc);
            if (deudorData) {
                 setDeudorFicha(deudorData);
                 const initialDeudorData = initializeSalesData(availableYears.length > 0 ? availableYears : [currentYear]);
                 setDeudorSalesData(initialDeudorData);
            }
        }
        
        setStatus('borrador');
        setIsDirty(true);
      }

      setRucInput(ruc);
      setView('form');

    } catch (err) {
      console.error("Error loading/init report:", err);
      showError('Error al inicializar el reporte.');
      navigate('/ventas-mensuales');
    } finally {
      setSearching(false);
      setInitializing(false); // FIN DE CARGA
    }
  };

  const loadReportById = async (recordId: string) => {
    setSearching(true);
    try {
      const { data: record, error } = await supabase
        .from('ventas_mensuales')
        .select('proveedor_ruc, solicitud_id')
        .eq('id', recordId)
        .single();
      
      if (error) throw error;

      if (record) {
        await handleAutoInit(record.proveedor_ruc, record.solicitud_id || 'null');
      } else {
         showError('Registro no encontrado');
         navigate('/ventas-mensuales');
      }
    } catch (e: any) {
       console.error("Error loading by ID:", e);
       showError('Error al cargar el registro: ' + e.message);
       navigate('/ventas-mensuales');
       setInitializing(false);
    }
  };

  useEffect(() => {
    if (id) {
       loadReportById(id);
    } else if (rucParam && solicitudIdParam) {
       handleAutoInit(rucParam, solicitudIdParam);
    } else {
      setView('create_mode');
      setInitializing(false);
    }
  }, [id, rucParam, solicitudIdParam]);

  const handleSearchAndCreate = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC de proveedor válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const provFicha = await FichaRucService.getByRuc(rucInput);
      if (!provFicha) {
        setError('Ficha RUC del proveedor no encontrada.');
        setSearching(false);
        return;
      }
      setProveedorFicha(provFicha);

      const reportesTributarios = await ReporteTributarioService.getReportesByRuc(rucInput);
      if (reportesTributarios.length > 0) {
        const salesData = extractSalesDataFromReporteTributario(reportesTributarios);
        setProveedorSalesData(salesData);
        const years = getAvailableYears(salesData);
        setAvailableYears(years);
        showSuccess('Datos autocompletados desde reportes tributarios.');
      } else {
        const initialData: SalesData = { [currentYear]: {} };
        MONTHS.forEach(month => { initialData[currentYear][month] = null; });
        setProveedorSalesData(initialData);
        setAvailableYears([currentYear]);
        showError('No se encontraron reportes tributarios. Se inicializó con año actual.');
      }
      setStatus('borrador');
      setIsDirty(true);
      setView('form');
    } catch (err) {
      setError('Ocurrió un error al buscar la información.');
    } finally {
      setSearching(false);
    }
  };

  // ... (handleCreateManually, handleAddYear, searchFichas, handleSave, searchSolicitudes, handleBackToList same as before)
  const handleCreateManually = () => {
    setManualMode(true);
    setError(null);
    setRucInput('');
    const emptyFicha: FichaRuc = {
      id: 0,
      ruc: '',
      nombre_empresa: '',
      actividad_empresa: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProveedorFicha(emptyFicha);
    const initialData: SalesData = { [currentYear]: {} };
    MONTHS.forEach(month => { initialData[currentYear][month] = null; });
    setProveedorSalesData(initialData);
    setAvailableYears([currentYear]);
    setStatus('borrador');
    setIsDirty(true);
    setView('form');
    showSuccess('Reporte inicializado para carga manual. Complete el RUC y los datos.');
  };

  const handleAddYear = () => {
    const newYear = Math.max(...availableYears, currentYear - 1) + 1;
    setAvailableYears(prev => [...prev, newYear].sort((a, b) => a - b));
    setProveedorSalesData(prev => ({
      ...prev,
      [newYear]: MONTHS.reduce((acc, month) => ({ ...acc, [month]: null }), {})
    }));
    if (deudorFicha) {
      setDeudorSalesData(prev => ({
        ...prev,
        [newYear]: MONTHS.reduce((acc, month) => ({ ...acc, [month]: null }), {})
      }));
    }
    setIsDirty(true);
    showSuccess(`Año ${newYear} agregado.`);
  };

  const searchFichas = useCallback(async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    try {
      const fichasData = await FichaRucService.search(query);
      return fichasData;
    } catch (error) {
      console.error('Error searching fichas:', error);
      return [];
    }
  }, []);

  const handleSave = async () => {
    if (!proveedorFicha) return;
    const ruc = proveedorFicha.ruc || rucInput;
    if (!ruc || ruc.length !== 11) {
      showError('Debe ingresar un RUC válido de 11 dígitos.');
      return;
    }
    if (!proveedorFicha.nombre_empresa) {
      showError('Debe ingresar la razón social de la empresa.');
      return;
    }
    if (!solicitudId) {
      showError('Debe asociar el reporte a una Solicitud de Operación antes de guardar.');
      return;
    }
    
    setSaving(true);
    try {
      const finalRuc = proveedorFicha.ruc || rucInput || ruc;
      if (manualMode && finalRuc && proveedorFicha.nombre_empresa) {
        try {
          const existingFicha = await FichaRucService.getByRuc(finalRuc);
          if (existingFicha) {
            if (existingFicha.nombre_empresa !== proveedorFicha.nombre_empresa) {
              await FichaRucService.update(existingFicha.id, {
                nombre_empresa: proveedorFicha.nombre_empresa
              });
            }
          } else {
            await FichaRucService.create({
              ruc: finalRuc,
              nombre_empresa: proveedorFicha.nombre_empresa,
              actividad_empresa: proveedorFicha.actividad_empresa || ''
            });
          }
        } catch (err) {
          console.error('Error al guardar ficha RUC:', err);
        }
      }
      
      const metadata = {
        status,
        validado_por: validadoPor,
        solicitud_id: solicitudId,
      };
      
      for (const year of availableYears) {
        const yearData = proveedorSalesData[year] || {};
        const existingId = proveedorRecordIds[year];
        const savedRecord = await VentasMensualesService.saveReport(
          finalRuc,
          deudorFicha?.ruc || null,
          year,
          'proveedor',
          yearData,
          metadata,
          existingId
        );
        if (savedRecord && savedRecord.id) {
             setProveedorRecordIds(prev => ({...prev, [year]: savedRecord.id}));
        }
      }

      if (deudorFicha) {
        for (const year of availableYears) {
          const yearData = deudorSalesData[year] || {};
          const existingId = deudorRecordIds[year];
          const savedRecord = await VentasMensualesService.saveReport(
            finalRuc,
            deudorFicha.ruc,
            year,
            'deudor',
            yearData,
            metadata,
            existingId
          );
          if (savedRecord && savedRecord.id) {
             setDeudorRecordIds(prev => ({...prev, [year]: savedRecord.id}));
          }
        }
      }

      showSuccess('Cambios guardados exitosamente.');
      setIsDirty(false);
    } catch (err) {
      console.error('Error saving:', err);
      showError('Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const searchSolicitudes = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_solicitudes', { search_term: query });
    if (error) return [];
    return data || [];
  };

  const handleBackToList = () => {
    if (isDirty) {
      if (window.confirm('¿Está seguro de cancelar? Los cambios no guardados se perderán.')) {
        navigate('/ventas-mensuales');
      }
    } else {
      navigate('/ventas-mensuales');
    }
  };

  // RENDER LOADING SCREEN
  if (initializing) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 text-[#00FF80] animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Cargando Reporte de Ventas...</h2>
          <p className="text-gray-400">Obteniendo datos de la solicitud y reportes previos</p>
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
              <BarChart3 className="h-6 w-6 mr-3 text-[#00FF80]" />
              {isEditMode || (rucParam && solicitudIdParam) ? 'Editar' : 'Nuevo'} Reporte de Ventas
            </h1>
            <div className="flex gap-2">
              {isEditMode && proveedorFicha && solicitudId && (
                <VentasMensualesAuditLogViewer 
                  proveedorRuc={proveedorFicha.ruc} 
                  deudorRuc={deudorFicha?.ruc || null}
                  solicitudId={solicitudId}
                />
              )}
              <Button
                variant="outline"
                onClick={handleBackToList}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {view === 'create_mode' && !isEditMode && (
            <Card className="bg-[#121212] border border-gray-800 w-full max-w-2xl mx-auto">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white flex items-center text-xl">
                  <Plus className="h-6 w-6 mr-3 text-[#00FF80]" />
                  Crear Nuevo Expediente
                </CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Seleccione cómo desea crear la solicitud de operación
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Opción 1: Buscar empresa existente */}
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
                        Crear con Empresa Seleccionada
                      </Button>
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-[#121212] text-gray-500">O</span>
                    </div>
                  </div>

                  {/* Opción 2: Crear manualmente */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <h3 className="text-white font-semibold">Crear Manualmente</h3>
                    </div>
                    <p className="text-gray-400 text-sm ml-8">
                      Inicie con un reporte vacío. Podrá ingresar los datos manualmente desde el año actual.
                    </p>
                    <div className="ml-8">
                      <Button 
                        variant="outline" 
                        onClick={handleCreateManually} 
                        disabled={searching}
                        className="w-full border-gray-700 text-white hover:bg-gray-800"
                        size="lg"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Llenar Formulario Manualmente
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Botón Cancelar */}
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

          {view === 'form' && proveedorFicha && (
            <div className="space-y-6">
              {/* WIZARD PROCESS INDICATOR */}
              <RibProcessWizard solicitudId={solicitudId || undefined} currentStep="ventas" />

              {manualMode && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Información de la Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">RUC</label>
                      <Input 
                        value={rucInput || proveedorFicha.ruc} 
                        onChange={(e) => {
                          setRucInput(e.target.value);
                          setProveedorFicha(prev => prev ? {...prev, ruc: e.target.value} : prev);
                          setIsDirty(true);
                        }}
                        className="bg-gray-900/50 border-gray-700 font-mono text-white"
                        maxLength={11}
                        placeholder="11 dígitos"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">Razón Social</label>
                      <Input 
                        value={proveedorFicha.nombre_empresa} 
                        onChange={(e) => {
                          setProveedorFicha(prev => prev ? {...prev, nombre_empresa: e.target.value} : prev);
                          setIsDirty(true);
                        }}
                        className="bg-gray-900/50 border-gray-700 text-white"
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center text-white">
                    <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Ventas del Proveedor{proveedorFicha.nombre_empresa ? `: ${proveedorFicha.nombre_empresa}` : ''}
                  </CardTitle>
                  {!isEditMode && (
                    <Button
                      onClick={handleAddYear}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Año
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <VentasMensualesTable
                    data={proveedorSalesData}
                    onDataChange={(y, m, v) => {
                      setProveedorSalesData(p => ({
                        ...p,
                        [y]: { ...p[y], [m]: v }
                      }));
                      setIsDirty(true);
                    }}
                  />
                </CardContent>
              </Card>

              <VentasStatusManager
                status={status}
                validadoPor={validadoPor}
                creatorName={creatorName}
                solicitudId={solicitudId}
                onStatusChange={(s) => {
                  setStatus(s);
                  setIsDirty(true);
                }}
                onValidatedByChange={(n) => {
                  setValidadoPor(n);
                  setIsDirty(true);
                }}
                onSave={handleSave}
                isSaving={saving}
                hasUnsavedChanges={isDirty}
                onSolicitudIdChange={(id) => {
                  setSolicitudId(id);
                  setInitialSolicitudLabel(null);
                  setIsDirty(true);
                }}
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

export default VentasMensualesForm;