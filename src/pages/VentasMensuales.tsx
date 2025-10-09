import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, BarChart3, X, ClipboardList } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesService, VentasMensualesSummary } from '@/services/ventasMensualesService';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { VentasMensuales, VentasStatus } from '@/types/ventasMensuales';
import VentasMensualesTable from '@/components/ventas-mensuales/VentasMensualesTable';
import VentasMensualesList from '@/components/ventas-mensuales/VentasMensualesList';
import VentasStatusManager from '@/components/ventas-mensuales/VentasStatusManager';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import { ProfileService } from '@/services/profileService';

export interface SalesData {
  [year: number]: {
    [month: string]: number | null;
  };
}

const VentasMensualesPage = () => {
  const { isAdmin } = useSession();
  const [proveedorRucInput, setProveedorRucInput] = useState('');
  const [deudorRucInput, setDeudorRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [proveedorFicha, setProveedorFicha] = useState<FichaRuc | null>(null);
  const [deudorFicha, setDeudorFicha] = useState<FichaRuc | null>(null);
  
  const [proveedorSalesData, setProveedorSalesData] = useState<SalesData>({});
  const [deudorSalesData, setDeudorSalesData] = useState<SalesData>({});

  const [summaries, setSummaries] = useState<VentasMensualesSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  const [latestReport, setLatestReport] = useState<VentasMensuales | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const summaryData = await VentasMensualesService.getAllSummaries();
      setSummaries(summaryData);
    } catch (err) {
      showError('Error al cargar la lista de reportes de ventas.');
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const clearSearch = () => {
    setProveedorRucInput('');
    setDeudorRucInput('');
    setError(null);
    setProveedorFicha(null);
    setDeudorFicha(null);
    setProveedorSalesData({});
    setDeudorSalesData({});
    setLatestReport(null);
    setCreatorName(null);
    setIsDirty(false);
  };

  const extractSalesData = (report: VentasMensuales | null, type: 'proveedor' | 'deudor'): SalesData => {
    const salesData: SalesData = {};
    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    years.forEach(year => {
      salesData[year] = {};
      months.forEach(month => {
        const key = `${month}_${year}_${type}`;
        salesData[year][month] = report?.[key] as number | null ?? null;
      });
    });
    return salesData;
  };

  const extractSalesDataFromReporteTributario = (reportes: any[]): SalesData => {
    const salesData: SalesData = {};
    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    // Inicializar estructura
    years.forEach(year => {
      salesData[year] = {};
      months.forEach(month => {
        salesData[year][month] = null;
      });
    });

    // Mapear datos de reportes tributarios
    reportes.forEach(reporte => {
      const year = reporte.anio_reporte;
      if (salesData[year]) {
        months.forEach(month => {
          const ventasKey = `ventas_${month}`;
          if (reporte[ventasKey] !== null && reporte[ventasKey] !== undefined) {
            salesData[year][month] = Number(reporte[ventasKey]);
          }
        });
      }
    });

    return salesData;
  };

  const handleSearch = async (rucToSearch?: string) => {
    const provRuc = rucToSearch || proveedorRucInput;
    if (!provRuc || provRuc.length !== 11) {
      setError('Por favor, ingrese un RUC de proveedor válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    clearSearch();
    setProveedorRucInput(provRuc);

    try {
      const provFicha = await FichaRucService.getByRuc(provRuc);
      if (!provFicha) {
        setError('Ficha RUC del proveedor no encontrada.');
        showError('Ficha RUC del proveedor no encontrada.');
        setSearching(false);
        return;
      }
      setProveedorFicha(provFicha);

      const ventasReporte = await VentasMensualesService.getByProveedorRuc(provRuc);
      
      if (ventasReporte) {
        // Si existe un reporte de ventas, cargamos sus datos
        setProveedorSalesData(extractSalesData(ventasReporte, 'proveedor'));
        setLatestReport(ventasReporte);
        if (ventasReporte.user_id) {
          const profile = await ProfileService.getProfileById(ventasReporte.user_id);
          setCreatorName(profile?.full_name || 'Desconocido');
        }
        if (ventasReporte.deudor_ruc) {
          setDeudorRucInput(ventasReporte.deudor_ruc);
          const deudorFichaData = await FichaRucService.getByRuc(ventasReporte.deudor_ruc);
          setDeudorFicha(deudorFichaData);
          setDeudorSalesData(extractSalesData(ventasReporte, 'deudor'));
        }
      } else {
        // Si NO existe, intentamos autocompletar desde el reporte tributario
        console.log('Buscando reportes tributarios para RUC:', provRuc);
        const reportesTributarios = await ReporteTributarioService.getReportesByRuc(provRuc);
        console.log('Reportes tributarios encontrados:', reportesTributarios);
        
        if (reportesTributarios.length > 0) {
          const initialSalesData = extractSalesDataFromReporteTributario(reportesTributarios);
          console.log('Datos de ventas extraídos:', initialSalesData);
          setProveedorSalesData(initialSalesData);
          showSuccess(`Se encontraron ${reportesTributarios.length} reportes tributarios. Datos autocompletados.`);
        } else {
          // Si no hay reportes tributarios, inicializar con estructura vacía
          const emptySalesData: SalesData = {};
          [2023, 2024, 2025].forEach(year => {
            emptySalesData[year] = {};
            ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'].forEach(month => {
              emptySalesData[year][month] = null;
            });
          });
          setProveedorSalesData(emptySalesData);
          showError('No se encontraron reportes tributarios para autocompletar.');
        }
        
        setLatestReport({
          id: '', 
          proveedor_ruc: provRuc, 
          deudor_ruc: null, 
          status: 'Borrador', 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(), 
          validado_por: '', 
          user_id: '',
        });
        setCreatorName(reportesTributarios.length > 0 ? 'Nuevo Reporte (Autocompletado)' : 'Nuevo Reporte');
        setIsDirty(true);
      }

    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Ocurrió un error al buscar la información.');
      showError('Error al buscar la información.');
    } finally {
      setSearching(false);
    }
  };

  const handleDeudorSearch = async () => {
    if (!deudorRucInput || deudorRucInput.length !== 11) {
      showError('Ingrese un RUC de deudor válido.');
      return;
    }
    const deudorFichaData = await FichaRucService.getByRuc(deudorRucInput);
    if (deudorFichaData) {
      setDeudorFicha(deudorFichaData);
      setIsDirty(true);
    } else {
      showError('Ficha RUC del deudor no encontrada.');
      setDeudorFicha(null);
      setDeudorSalesData({});
    }
  };

  const handleSaveChanges = async () => {
    if (!latestReport || !proveedorFicha) return;
    setSaving(true);
    try {
      await VentasMensualesService.saveSalesData(
        proveedorFicha.ruc,
        proveedorSalesData,
        deudorFicha?.ruc || null,
        deudorSalesData,
        {
          status: latestReport.status,
          validado_por: latestReport.validado_por,
        }
      );

      showSuccess('Cambios guardados exitosamente.');
      setIsDirty(false);
      await fetchSummaries();
    } catch (err) {
      showError('Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectReport = (ruc: string) => {
    handleSearch(ruc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReport = async (ruc: string) => {
    try {
      await VentasMensualesService.deleteByProveedorRuc(ruc);
      showSuccess('Reporte de ventas eliminado exitosamente.');
      await fetchSummaries();
      if (proveedorFicha && proveedorFicha.ruc === ruc) {
        clearSearch();
      }
    } catch (err) {
      showError('Error al eliminar el reporte de ventas.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-[#00FF80]" />
            Análisis de Ventas Mensuales
          </h1>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar Empresas por RUC</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Label className="text-gray-400">Proveedor</Label>
                  <Search className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="RUC del Proveedor" value={proveedorRucInput} onChange={(e) => setProveedorRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
                </div>
                <Button onClick={() => handleSearch()} disabled={searching} className="w-full sm:w-auto self-end bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar
                </Button>
                {proveedorFicha && (
                  <Button onClick={clearSearch} variant="outline" className="w-full sm:w-auto self-end">
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {proveedorFicha ? (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Ventas del Proveedor: {proveedorFicha.nombre_empresa}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VentasMensualesTable data={proveedorSalesData} onDataChange={(y, m, v) => { setProveedorSalesData(p => ({...p, [y]: {...p[y], [m]: v}})); setIsDirty(true); }} />
                </CardContent>
              </Card>

              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                    Ventas del Deudor (Opcional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                      <Label className="text-gray-400">Deudor</Label>
                      <Search className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input placeholder="RUC del Deudor" value={deudorRucInput} onChange={(e) => setDeudorRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
                    </div>
                    <Button onClick={handleDeudorSearch} className="w-full sm:w-auto self-end">Buscar Deudor</Button>
                  </div>
                  {deudorFicha && (
                    <>
                      <p className="text-lg font-semibold text-white">{deudorFicha.nombre_empresa}</p>
                      <VentasMensualesTable data={deudorSalesData} onDataChange={(y, m, v) => { setDeudorSalesData(p => ({...p, [y]: {...p[y], [m]: v}})); setIsDirty(true); }} />
                    </>
                  )}
                </CardContent>
              </Card>
              
              {latestReport && (
                <VentasStatusManager
                  report={latestReport}
                  creatorName={creatorName}
                  onStatusChange={(s) => { setLatestReport(p => p ? {...p, status: s} : null); setIsDirty(true); }}
                  onValidatedByChange={(n) => { setLatestReport(p => p ? {...p, validado_por: n} : null); setIsDirty(true); }}
                  onSave={handleSaveChanges}
                  isSaving={saving}
                  hasUnsavedChanges={isDirty}
                />
              )}
            </div>
          ) : (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Proveedores con Ventas Registradas</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummaries ? (
                  <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div>
                ) : summaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay ventas de proveedores guardadas</p>
                    <p className="text-sm mt-2">Busca un proveedor por su RUC para empezar</p>
                  </div>
                ) : (
                  <VentasMensualesList
                    reports={summaries}
                    onSelectReport={handleSelectReport}
                    onDeleteReport={handleDeleteReport}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VentasMensualesPage;