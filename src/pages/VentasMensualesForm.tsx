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

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

const VentasMensualesForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Obtener parámetros de la URL
  const rucParam = searchParams.get('ruc');
  const solicitudIdParam = searchParams.get('solicitud_id');
  const isEditMode = !!(rucParam && solicitudIdParam);

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
  
  // Mantener mapeo de año → ID para UPDATEs correctos
  const [proveedorRecordIds, setProveedorRecordIds] = useState<Record<number, string>>({});
  const [deudorRecordIds, setDeudorRecordIds] = useState<Record<number, string>>({});

  const [status, setStatus] = useState<VentasStatus>('borrador');
  const [validadoPor, setValidadoPor] = useState<string | null>(null);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  // Función para obtener años únicos de los datos
  const getAvailableYears = (salesData: SalesData, additionalYears: number[] = []): number[] => {
    const yearsSet = new Set<number>();
    
    // Agregar años de los datos existentes
    Object.keys(salesData).forEach(year => {
      yearsSet.add(parseInt(year));
    });
    
    // Agregar años adicionales (de otros reportes)
    additionalYears.forEach(year => yearsSet.add(year));
    
    // Convertir a array y ordenar
    return Array.from(yearsSet).sort((a, b) => a - b);
  };

  const initializeSalesData = (years: number[]): SalesData => {
    const data: SalesData = {};
    years.forEach(year => {
      data[year] = {};
      MONTHS.forEach(month => {
        data[year][month] = null;
      });
    });
    return data;
  };

  const extractSalesDataFromReports = (reports: VentasMensuales[]): {
    salesData: SalesData;
    recordIds: Record<number, string>;
  } => {
    // Primero extraer los años de los reportes
    const yearsFromReports = reports.map(r => r.anio);
    const years = getAvailableYears({}, yearsFromReports);
    
    const salesData = initializeSalesData(years);
    const recordIds: Record<number, string> = {};
    
    reports.forEach(report => {
      // Guardar el ID del registro para este año
      recordIds[report.anio] = report.id;
      
      if (salesData[report.anio]) {
        MONTHS.forEach(month => {
          const value = report[month as keyof VentasMensuales] as number | null;
          if (value !== null && value !== undefined) {
            salesData[report.anio][month] = value;
          }
        });
      }
    });
    return { salesData, recordIds };
  };

  const extractSalesDataFromReporteTributario = (reportes: any[]): SalesData => {
    // Extraer años de los reportes tributarios
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

  const loadReportForEdit = async (ruc: string, solicitudId: string | null) => {
    setSearching(true);
    try {
      // Cargar todos los reportes de este RUC + solicitud_id
      const allReports = solicitudId && solicitudId !== 'null'
        ? await VentasMensualesService.getBySolicitudId(ruc, solicitudId)
        : await VentasMensualesService.getByProveedorRuc(ruc);
      
      if (allReports.length === 0) {
        showError('Reporte no encontrado.');
        navigate('/ventas-mensuales');
        return;
      }

      // Usar el primer reporte para obtener metadatos
      const firstReport = allReports[0];
      
      setRucInput(ruc);
      setStatus(firstReport.status);
      setValidadoPor(firstReport.validado_por);
      setSolicitudId(solicitudId && solicitudId !== 'null' ? solicitudId : null);

      const [provFicha, deudorFichaData] = await Promise.all([
        FichaRucService.getByRuc(ruc),
        firstReport.deudor_ruc ? FichaRucService.getByRuc(firstReport.deudor_ruc) : Promise.resolve(null)
      ]);

      // Si no existe la ficha (fue creado manualmente), crear una ficha temporal
      if (!provFicha && ruc) {
        const tempFicha: FichaRuc = {
          id: 0,
          ruc: ruc,
          nombre_empresa: '', // Se llenará desde el input si está vacío
          actividad_empresa: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProveedorFicha(tempFicha);
        setManualMode(true); // Activar modo manual para edición
      } else {
        setProveedorFicha(provFicha);
      }
      
      setDeudorFicha(deudorFichaData);

      const proveedorReports = allReports.filter(r => r.tipo_entidad === 'proveedor');
      const deudorReports = allReports.filter(r => r.tipo_entidad === 'deudor');

      const { salesData: proveedorData, recordIds: proveedorIds } = extractSalesDataFromReports(proveedorReports);
      const { salesData: deudorData, recordIds: deudorIds } = extractSalesDataFromReports(deudorReports);
      
      setProveedorSalesData(proveedorData);
      setDeudorSalesData(deudorData);
      setProveedorRecordIds(proveedorIds);
      setDeudorRecordIds(deudorIds);
      
      // Combinar años de ambos datasets
      const allYears = getAvailableYears(proveedorData, Object.keys(deudorData).map(y => parseInt(y)));
      setAvailableYears(allYears);

      if (firstReport.user_id) {
        const profile = await ProfileService.getProfileById(firstReport.user_id);
        setCreatorName(profile?.full_name || 'Desconocido');
      }

      if (solicitudId && solicitudId !== 'null') {
        const { data: solicitud } = await supabase
          .from('solicitudes_operacion')
          .select('id, ruc, created_at')
          .eq('id', solicitudId)
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
      
      setView('form');
    } catch (err) {
      showError('Error al cargar el reporte para editar.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (isEditMode && rucParam) {
      loadReportForEdit(rucParam, solicitudIdParam);
    } else {
      setView('create_mode');
    }
  }, [rucParam, solicitudIdParam, isEditMode]);

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

      // Modo autocompletar: intentar cargar desde reportes tributarios
      const reportesTributarios = await ReporteTributarioService.getReportesByRuc(rucInput);
      if (reportesTributarios.length > 0) {
        const salesData = extractSalesDataFromReporteTributario(reportesTributarios);
        setProveedorSalesData(salesData);
        
        const years = getAvailableYears(salesData);
        setAvailableYears(years);
        
        showSuccess('Datos autocompletados desde reportes tributarios.');
      } else {
        // Si no hay reportes, inicializar con año actual
        const initialData: SalesData = {
          [currentYear]: {}
        };
        MONTHS.forEach(month => {
          initialData[currentYear][month] = null;
        });
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

  const handleCreateManually = () => {
    setManualMode(true);
    setError(null);
    setRucInput('');
    
    // Crear una ficha vacía para modo manual
    const emptyFicha: FichaRuc = {
      id: 0,
      ruc: '',
      nombre_empresa: '',
      actividad_empresa: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setProveedorFicha(emptyFicha);

    // Inicializar con el año actual en modo manual
    const initialData: SalesData = {
      [currentYear]: {}
    };
    MONTHS.forEach(month => {
      initialData[currentYear][month] = null;
    });
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
      // El método search ya retorna el formato correcto {value, label}
      return fichasData;
    } catch (error) {
      console.error('Error searching fichas:', error);
      return [];
    }
  }, []);

  const handleSave = async () => {
    if (!proveedorFicha) return;
    
    // Validar RUC
    const ruc = proveedorFicha.ruc || rucInput;
    if (!ruc || ruc.length !== 11) {
      showError('Debe ingresar un RUC válido de 11 dígitos.');
      return;
    }
    
    // Validar nombre de empresa
    if (!proveedorFicha.nombre_empresa) {
      showError('Debe ingresar la razón social de la empresa.');
      return;
    }
    
    // Validar que solicitud_id sea obligatorio
    if (!solicitudId) {
      showError('Debe asociar el reporte a una Solicitud de Operación antes de guardar.');
      return;
    }
    
    // Si es un nuevo reporte, verificar que no exista ya uno con ese RUC + solicitud_id
    if (!isEditMode) {
      try {
        const existingReports = await VentasMensualesService.getBySolicitudId(
          proveedorFicha.ruc,
          solicitudId
        );
        
        if (existingReports.length > 0) {
          showError(
            'Ya existe un reporte de Ventas Mensuales para este RUC asociado a esta Solicitud de Operación. ' +
            'Por favor, seleccione una solicitud diferente o edite el reporte existente.'
          );
          return;
        }
      } catch (err) {
        console.error('Error verificando reportes existentes:', err);
      }
    }
    
    setSaving(true);
    try {
      // Usar el RUC actualizado (puede haber sido editado en modo manual)
      const finalRuc = proveedorFicha.ruc || rucInput || ruc;
      
      // Si es modo manual, guardar/actualizar la ficha RUC
      if (manualMode && finalRuc && proveedorFicha.nombre_empresa) {
        try {
          const existingFicha = await FichaRucService.getByRuc(finalRuc);
          if (existingFicha) {
            // Actualizar solo si el nombre cambió
            if (existingFicha.nombre_empresa !== proveedorFicha.nombre_empresa) {
              await FichaRucService.update(existingFicha.id, {
                nombre_empresa: proveedorFicha.nombre_empresa
              });
            }
          } else {
            // Crear nueva ficha
            await FichaRucService.create({
              ruc: finalRuc,
              nombre_empresa: proveedorFicha.nombre_empresa,
              actividad_empresa: proveedorFicha.actividad_empresa || ''
            });
          }
        } catch (err) {
          console.error('Error al guardar ficha RUC:', err);
          // No detener el guardado del reporte si falla la ficha
        }
      }
      
      const metadata = {
        status,
        validado_por: validadoPor,
        solicitud_id: solicitudId,
      };
      
      // Guardar datos del proveedor para cada año que tenga datos
      for (const year of availableYears) {
        const yearData = proveedorSalesData[year] || {};
        const hasData = MONTHS.some(month => yearData[month] !== null && yearData[month] !== undefined);
        
        if (hasData) {
          const existingId = proveedorRecordIds[year]; // Obtener el ID si existe
          await VentasMensualesService.saveReport(
            finalRuc,
            deudorFicha?.ruc || null,
            year,
            'proveedor',
            yearData,
            metadata,
            existingId  // Pasar el ID para hacer UPDATE
          );
        }
      }

      // Guardar datos del deudor si existe
      if (deudorFicha) {
        for (const year of availableYears) {
          const yearData = deudorSalesData[year] || {};
          const hasData = MONTHS.some(month => yearData[month] !== null && yearData[month] !== undefined);
          
          if (hasData) {
            const existingId = deudorRecordIds[year]; // Obtener el ID si existe
            await VentasMensualesService.saveReport(
              finalRuc,
              deudorFicha.ruc,
              year,
              'deudor',
              yearData,
              metadata,
              existingId  // Pasar el ID para hacer UPDATE
            );
          }
        }
      }

      showSuccess('Cambios guardados exitosamente.');
      setIsDirty(false);
      navigate('/ventas-mensuales');
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
    if (error) {
      console.error('Error searching solicitudes:', error);
      return [];
    }
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

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-[#00FF80]" />
              {isEditMode ? 'Editar' : 'Nuevo'} Reporte de Ventas
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
                        value={rucInput} 
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
