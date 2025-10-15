import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, BarChart3, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesService } from '@/services/ventasMensualesService';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { VentasMensuales } from '@/types/ventasMensuales';
import VentasMensualesTable from '@/components/ventas-mensuales/VentasMensualesTable';
import VentasStatusManager from '@/components/ventas-mensuales/VentasStatusManager';
import { showSuccess, showError } from '@/utils/toast';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxOption } from '@/components/ui/async-combobox';
import { SalesData } from '@/types/salesData';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

const VentasMensualesForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [proveedorFicha, setProveedorFicha] = useState<FichaRuc | null>(null);
  const [deudorFicha, setDeudorFicha] = useState<FichaRuc | null>(null);
  
  const [proveedorSalesData, setProveedorSalesData] = useState<SalesData>({});
  const [deudorSalesData, setDeudorSalesData] = useState<SalesData>({});
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const [status, setStatus] = useState<string>('Borrador');
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

  const extractSalesDataFromReports = (reports: VentasMensuales[]): SalesData => {
    // Primero extraer los años de los reportes
    const yearsFromReports = reports.map(r => r.anio);
    const years = getAvailableYears({}, yearsFromReports);
    
    const salesData = initializeSalesData(years);
    reports.forEach(report => {
      if (salesData[report.anio]) {
        MONTHS.forEach(month => {
          const value = report[month as keyof VentasMensuales] as number | null;
          if (value !== null && value !== undefined) {
            salesData[report.anio][month] = value;
          }
        });
      }
    });
    return salesData;
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

  const loadReportForEdit = async (reportId: string) => {
    setSearching(true);
    try {
      const reportData = await VentasMensualesService.getById(reportId);
      if (!reportData) {
        showError('Reporte no encontrado.');
        navigate('/ventas-mensuales');
        return;
      }

      setRucInput(reportData.proveedor_ruc);
      setStatus(reportData.status);
      setValidadoPor(reportData.validado_por);
      setSolicitudId(reportData.solicitud_id);

      const [provFicha, deudorFichaData, allReports] = await Promise.all([
        FichaRucService.getByRuc(reportData.proveedor_ruc),
        reportData.deudor_ruc ? FichaRucService.getByRuc(reportData.deudor_ruc) : Promise.resolve(null),
        VentasMensualesService.getByProveedorRuc(reportData.proveedor_ruc)
      ]);

      setProveedorFicha(provFicha);
      setDeudorFicha(deudorFichaData);

      const proveedorReports = allReports.filter(r => r.tipo_entidad === 'proveedor');
      const deudorReports = allReports.filter(r => r.tipo_entidad === 'deudor');

      const proveedorData = extractSalesDataFromReports(proveedorReports);
      const deudorData = extractSalesDataFromReports(deudorReports);
      
      setProveedorSalesData(proveedorData);
      setDeudorSalesData(deudorData);
      
      // Combinar años de ambos datasets
      const allYears = getAvailableYears(proveedorData, Object.keys(deudorData).map(y => parseInt(y)));
      setAvailableYears(allYears);

      if (reportData.user_id) {
        const profile = await ProfileService.getProfileById(reportData.user_id);
        setCreatorName(profile?.full_name || 'Desconocido');
      }

      if (reportData.solicitud_id) {
        const { data: solicitud } = await supabase
          .from('solicitudes_operacion')
          .select('id, ruc, created_at')
          .eq('id', reportData.solicitud_id)
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
    } catch (err) {
      showError('Error al cargar el reporte para editar.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      loadReportForEdit(id);
    }
  }, [id, isEditMode]);

  const handleSearch = async () => {
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
        
        // Establecer años disponibles basados en los datos existentes
        const years = getAvailableYears(salesData);
        setAvailableYears(years);
        
        showSuccess('Datos autocompletados desde reportes tributarios.');
      } else {
        // Si no hay reportes, inicializar vacío
        setProveedorSalesData({});
        setAvailableYears([]);
        showError('No se encontraron reportes tributarios para autocompletar.');
      }
      
      setStatus('Borrador');
      setIsDirty(true);
    } catch (err) {
      setError('Ocurrió un error al buscar la información.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!proveedorFicha) return;
    setSaving(true);
    try {
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
          await VentasMensualesService.saveReport(
            proveedorFicha.ruc,
            deudorFicha?.ruc || null,
            year,
            'proveedor',
            yearData,
            metadata
          );
        }
      }

      // Guardar datos del deudor si existe
      if (deudorFicha) {
        for (const year of availableYears) {
          const yearData = deudorSalesData[year] || {};
          const hasData = MONTHS.some(month => yearData[month] !== null && yearData[month] !== undefined);
          
          if (hasData) {
            await VentasMensualesService.saveReport(
              proveedorFicha.ruc,
              deudorFicha.ruc,
              year,
              'deudor',
              yearData,
              metadata
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

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-[#00FF80]" />
              {isEditMode ? 'Editar' : 'Nuevo'} Reporte de Ventas
            </h1>
            <Button
              variant="outline"
              onClick={() => navigate('/ventas-mensuales')}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
            </Button>
          </div>

          {!isEditMode && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Buscar Proveedor por RUC</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="RUC del Proveedor"
                    value={rucInput}
                    onChange={(e) => setRucInput(e.target.value)}
                    maxLength={11}
                    className="pl-10 bg-gray-900/50 border-gray-700"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Buscar y Autocompletar
                </Button>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {proveedorFicha && (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Ventas del Proveedor: {proveedorFicha.nombre_empresa}
                  </CardTitle>
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
                solicitudId={solicitudId} // <-- Pasando la prop corregida
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
                  setInitialSolicitudLabel(null); // Clear initial label on manual change
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