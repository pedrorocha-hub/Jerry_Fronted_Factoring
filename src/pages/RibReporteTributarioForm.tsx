import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, ClipboardList, X, TrendingUp, Calculator, BarChart3, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { RibReporteTributario, RibReporteTributarioService } from '@/services/ribReporteTributarioService';
import { ProfileService } from '@/services/profileService';
import RibReporteTributarioTable from '@/components/rib-reporte-tributario/RibReporteTributarioTable';
import EstadosResultadosTable from '@/components/rib-reporte-tributario/EstadosResultadosTable';
import IndicesFinancierosTable from '@/components/rib-reporte-tributario/IndicesFinancierosTable';
import ProveedorSection from '@/components/rib-reporte-tributario/ProveedorSection';
import ReporteStatusManager from '@/components/rib-reporte-tributario/ReporteStatusManager';
import EstadoSituacionTable from '@/components/estado-situacion/EstadoSituacionTable';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxOption } from '@/components/ui/async-combobox';
import { EstadoSituacionService } from '@/services/estadoSituacionService';

type Status = 'Borrador' | 'En revisión' | 'Completado';

const RibReporteTributarioForm = () => {
  const { ruc } = useParams<{ ruc: string }>();
  const navigate = useNavigate();
  const isEditMode = !!ruc;

  const [rucInput, setRucInput] = useState(ruc || '');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  
  const [savedReportData, setSavedReportData] = useState<RibReporteTributario | null>(null);
  const [draftReportData, setDraftReportData] = useState<Partial<RibReporteTributario> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && ruc) {
      handleSearch(ruc);
    }
  }, [isEditMode, ruc]);

  const handleSearch = async (rucToSearch?: string) => {
    const currentRuc = rucToSearch || rucInput;
    if (!currentRuc || currentRuc.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setSavedReportData(null);
    setDraftReportData(null);
    setCreatorName(null);
    setHasUnsavedChanges(false);
    setInitialSolicitudLabel(null);

    try {
      const fichaData = await FichaRucService.getByRuc(currentRuc);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const existingReport = await RibReporteTributarioService.getByRuc(currentRuc);
        
        if (existingReport) {
          setSavedReportData(existingReport);
          setDraftReportData(existingReport);
          if (existingReport.user_id) {
            const profile = await ProfileService.getProfileById(existingReport.user_id);
            setCreatorName(profile?.full_name || 'Desconocido');
          }
          if (existingReport.solicitud_id) {
            const { data: solicitud } = await supabase.from('solicitudes_operacion').select('id, ruc, created_at').eq('id', existingReport.solicitud_id).single();
            if (solicitud) {
              const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).single();
              setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
            }
          }
        } else {
          const situacion = await EstadoSituacionService.getEstadoSituacion(currentRuc);
          const newDraft: Partial<RibReporteTributario> = { ruc: currentRuc, status: 'Borrador' };
          [2022, 2023, 2024].forEach(year => {
            const yearData = situacion[`data_${year}` as keyof typeof situacion];
            (newDraft as any)[`cuentas_por_cobrar_giro_${year}`] = yearData.cuentas_por_cobrar_del_giro;
            (newDraft as any)[`total_activos_${year}`] = yearData.total_activos;
            (newDraft as any)[`cuentas_por_pagar_giro_${year}`] = yearData.cuentas_por_pagar_del_giro;
            (newDraft as any)[`total_pasivos_${year}`] = yearData.total_pasivos;
            (newDraft as any)[`capital_pagado_${year}`] = yearData.capital_pagado;
            (newDraft as any)[`total_patrimonio_${year}`] = yearData.total_patrimonio;
            (newDraft as any)[`total_pasivo_patrimonio_${year}`] = yearData.total_pasivo_y_patrimonio;
          });
          setDraftReportData(newDraft);
          setSavedReportData(null);
          setHasUnsavedChanges(true);
          showSuccess('Datos autocompletados desde Reportes Tributarios.');
        }
      } else {
        setError('Ficha RUC no encontrada. No se puede crear un reporte.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError(`Ocurrió un error al buscar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      showError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleDataChange = (updatedData: Partial<RibReporteTributario>) => {
    setDraftReportData(updatedData);
    setHasUnsavedChanges(true);
  };

  const handleStatusChange = (newStatus: Status) => {
    if (draftReportData) {
      handleDataChange({ ...draftReportData, status: newStatus });
    }
  };

  const handleSolicitudIdChange = (solicitudId: string | null) => {
    if (draftReportData) {
      handleDataChange({ ...draftReportData, solicitud_id: solicitudId });
    }
  };

  const handleSave = async () => {
    if (!draftReportData || !draftReportData.ruc) {
      showError('No hay datos para guardar');
      return;
    }
    setIsSaving(true);
    try {
      const savedData = await RibReporteTributarioService.upsert(draftReportData as any);
      setSavedReportData(savedData);
      setDraftReportData(savedData);
      setHasUnsavedChanges(false);
      showSuccess('Reporte RIB actualizado exitosamente.');
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
            <Button variant="outline" onClick={() => navigate('/rib-reporte-tributario')} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </div>

          {!isEditMode && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="text-white">Buscar Empresa por RUC</CardTitle></CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Ingrese RUC de 11 dígitos" value={rucInput} onChange={(e) => setRucInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
                </div>
                <Button onClick={() => handleSearch()} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar
                </Button>
              </CardContent>
            </Card>
          )}

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {searchedFicha && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="border-l-4 border-[#00FF80] pl-4">
                  <h2 className="text-xl font-bold text-white mb-2">ESTADO DE SITUACIÓN FINANCIERA - DATOS DEL DEUDOR</h2>
                  <p className="text-gray-400 text-sm">Información financiera consolidada de {searchedFicha.nombre_empresa} (2022-2024)</p>
                </div>
                <EstadoSituacionTable ruc={searchedFicha.ruc} />
                <Card className="bg-[#121212] border border-gray-800"><CardHeader><CardTitle className="text-white flex items-center"><Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />{searchedFicha.nombre_empresa}: Estado de situación</CardTitle></CardHeader><CardContent><RibReporteTributarioTable ruc={searchedFicha.ruc} data={draftReportData} onDataChange={handleDataChange} /></CardContent></Card>
                <Card className="bg-[#121212] border border-gray-800"><CardHeader><CardTitle className="text-white flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />Estados de resultados</CardTitle></CardHeader><CardContent><EstadosResultadosTable data={draftReportData} onDataChange={handleDataChange} /></CardContent></Card>
                <Card className="bg-[#121212] border border-gray-800"><CardHeader><CardTitle className="text-white flex items-center"><Calculator className="h-5 w-5 mr-2 text-[#00FF80]" />Índices financieros</CardTitle></CardHeader><CardContent><IndicesFinancierosTable data={draftReportData} onDataChange={handleDataChange} /></CardContent></Card>
              </div>
              <div className="border-t border-gray-800"></div>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4"><h2 className="text-xl font-bold text-white mb-2">DATOS DEL PROVEEDOR</h2><p className="text-gray-400 text-sm">Información financiera del proveedor (opcional)</p></div>
                <ProveedorSection data={draftReportData} onDataChange={handleDataChange} />
              </div>
              {draftReportData && (
                <ReporteStatusManager
                  report={draftReportData as RibReporteTributario}
                  creatorName={creatorName}
                  onStatusChange={handleStatusChange}
                  onSave={handleSave}
                  isSaving={isSaving}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onSolicitudIdChange={handleSolicitudIdChange}
                  searchSolicitudes={searchSolicitudes}
                  initialSolicitudLabel={initialSolicitudLabel}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RibReporteTributarioForm;