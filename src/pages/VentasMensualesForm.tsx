import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, X, BarChart3, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesService } from '@/services/ventasMensualesService';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { VentasMensuales, VentasStatus } from '@/types/ventasMensuales';
import VentasMensualesTable from '@/components/ventas-mensuales/VentasMensualesTable';
import VentasStatusManager from '@/components/ventas-mensuales/VentasStatusManager';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import { ProfileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxOption } from '@/components/ui/async-combobox';
import { SalesData } from '@/types/salesData';

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

  const [report, setReport] = useState<Partial<VentasMensuales> | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  const extractSalesData = (report: Partial<VentasMensuales> | null, type: 'proveedor' | 'deudor'): SalesData => {
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
    [2023, 2024, 2025].forEach(year => {
      salesData[year] = {};
      ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'].forEach(month => {
        salesData[year][month] = null;
      });
    });
    reportes.forEach(reporte => {
      const year = reporte.anio_reporte;
      if (salesData[year]) {
        Object.keys(salesData[year]).forEach(month => {
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
      setReport(reportData);
      setRucInput(reportData.proveedor_ruc);

      const [provFicha, deudorFichaData] = await Promise.all([
        FichaRucService.getByRuc(reportData.proveedor_ruc),
        reportData.deudor_ruc ? FichaRucService.getByRuc(reportData.deudor_ruc) : Promise.resolve(null)
      ]);
      setProveedorFicha(provFicha);
      setDeudorFicha(deudorFichaData);

      setProveedorSalesData(extractSalesData(reportData, 'proveedor'));
      setDeudorSalesData(extractSalesData(reportData, 'deudor'));

      if (reportData.user_id) {
        const profile = await ProfileService.getProfileById(reportData.user_id);
        setCreatorName(profile?.full_name || 'Desconocido');
      }
      if (reportData.solicitud_id) {
        const { data: solicitud } = await supabase.from('solicitudes_operacion').select('id, ruc, created_at').eq('id', reportData.solicitud_id).single();
        if (solicitud) {
            const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).single();
            setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
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
        setProveedorSalesData(extractSalesDataFromReporteTributario(reportesTributarios));
        showSuccess('Datos autocompletados desde reportes tributarios.');
      } else {
        showError('No se encontraron reportes tributarios para autocompletar.');
      }
      setReport({ proveedor_ruc: rucInput, status: 'Borrador' });
      setIsDirty(true);
    } catch (err) {
      setError('Ocurrió un error al buscar la información.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    if (!report || !report.proveedor_ruc) return;
    setSaving(true);
    try {
      const dataToSave: Partial<VentasMensuales> = {
        ...report,
        proveedor_ruc: report.proveedor_ruc,
        deudor_ruc: deudorFicha?.ruc || null,
      };

      const years = [2023, 2024, 2025];
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

      years.forEach(year => {
        months.forEach(month => {
          const provKey = `${month}_${year}_proveedor`;
          (dataToSave as any)[provKey] = proveedorSalesData[year]?.[month] ?? null;
          if (deudorFicha) {
            const deudorKey = `${month}_${year}_deudor`;
            (dataToSave as any)[deudorKey] = deudorSalesData[year]?.[month] ?? null;
          }
        });
      });

      await VentasMensualesService.saveReport(dataToSave);
      showSuccess('Cambios guardados exitosamente.');
      setIsDirty(false);
      navigate('/ventas-mensuales');
    } catch (err) {
      showError('Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const searchSolicitudes = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_solicitudes', { search_term: query });
    if (error) { console.error('Error searching solicitudes:', error); return []; }
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
            <Button variant="outline" onClick={() => navigate('/ventas-mensuales')} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver a la lista
            </Button>
          </div>

          {!isEditMode && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="text-white">Buscar Proveedor por RUC</CardTitle></CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="RUC del Proveedor" value={rucInput} onChange={(e) => setRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
                </div>
                <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar y Autocompletar
                </Button>
              </CardContent>
            </Card>
          )}

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {proveedorFicha && report && (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader><CardTitle className="flex items-center text-white"><Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />Ventas del Proveedor: {proveedorFicha.nombre_empresa}</CardTitle></CardHeader>
                <CardContent><VentasMensualesTable data={proveedorSalesData} onDataChange={(y, m, v) => { setProveedorSalesData(p => ({...p, [y]: {...p[y], [m]: v}})); setIsDirty(true); }} /></CardContent>
              </Card>
              <VentasStatusManager
                report={report}
                creatorName={creatorName}
                onStatusChange={(s) => { setReport(p => p ? {...p, status: s} : null); setIsDirty(true); }}
                onValidatedByChange={(n) => { setReport(p => p ? {...p, validado_por: n} : null); setIsDirty(true); }}
                onSave={handleSave}
                isSaving={saving}
                hasUnsavedChanges={isDirty}
                onSolicitudIdChange={(solicitudId) => { setReport(p => p ? {...p, solicitud_id: solicitudId} : null); setIsDirty(true); }}
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