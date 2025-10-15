import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, ClipboardList, X, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { RibReporteTributario, RibReporteTributarioService, RibReporteTributarioStatus } from '@/services/ribReporteTributarioService';
import { ProfileService } from '@/services/profileService';
import RibReporteTributarioTable from '@/components/rib-reporte-tributario/RibReporteTributarioTable';
import EstadosResultadosTable from '@/components/rib-reporte-tributario/EstadosResultadosTable';
import IndicesFinancierosTable from '@/components/rib-reporte-tributario/IndicesFinancierosTable';
import ProveedorSection from '@/components/rib-reporte-tributario/ProveedorSection';
import RibReporteTributarioList from '@/components/rib-reporte-tributario/RibReporteTributarioList';
import ReporteStatusManager from '@/components/rib-reporte-tributario/ReporteStatusManager';
import EstadoSituacionTable from '@/components/estado-situacion/EstadoSituacionTable';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxOption } from '@/components/ui/async-combobox';
import { EstadoSituacionService } from '@/services/estadoSituacionService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type View = 'list' | 'search_results' | 'form' | 'detail';

interface GroupedReport {
  ruc: string;
  nombre_empresa: string;
  reports: any[];
  last_updated_at: string;
  status: RibReporteTributarioStatus;
  creator_name: string;
}

const RibReporteTributarioPage = () => {
  const [view, setView] = useState<View>('list');
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  
  const [allRawReports, setAllRawReports] = useState<any[]>([]);
  const [existingReports, setExistingReports] = useState<RibReporteTributario[]>([]);
  const [draftReportData, setDraftReportData] = useState<Partial<RibReporteTributario> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [groupedReports, setGroupedReports] = useState<GroupedReport[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [selectedRuc, setSelectedRuc] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingSummaries(true);
    try {
      const rawReports = await RibReporteTributarioService.getAllWithRelations();
      setAllRawReports(rawReports);

      const grouped = rawReports.reduce((acc, report) => {
        const ruc = report.ruc;
        if (!acc[ruc]) {
          acc[ruc] = {
            ruc: ruc,
            nombre_empresa: report.ficha_ruc?.nombre_empresa || ruc,
            reports: [],
            last_updated_at: '1970-01-01T00:00:00Z',
            status: 'Borrador',
            creator_name: 'N/A',
          };
        }
        acc[ruc].reports.push(report);
        if (new Date(report.updated_at) > new Date(acc[ruc].last_updated_at)) {
          acc[ruc].last_updated_at = report.updated_at;
          acc[ruc].status = report.status;
          acc[ruc].creator_name = report.profiles?.full_name || 'N/A';
        }
        return acc;
      }, {} as Record<string, GroupedReport>);

      setGroupedReports(Object.values(grouped).sort((a, b) => new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime()));
    } catch (err) {
      showError('Error al cargar la lista de reportes.');
      console.error(err);
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearState = () => {
    setRucInput('');
    setError(null);
    setSearchedFicha(null);
    setExistingReports([]);
    setDraftReportData(null);
    setCreatorName(null);
    setHasUnsavedChanges(false);
    setInitialSolicitudLabel(null);
  };

  const handleSearch = async (rucToSearch?: string) => {
    const ruc = rucToSearch || rucInput;
    if (!ruc || ruc.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    clearState();
    setRucInput(ruc);

    try {
      const fichaData = await FichaRucService.getByRuc(ruc);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const reports = await RibReporteTributarioService.getReportsByRuc(ruc);
        setExistingReports(reports);
        setView('search_results');
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

  const handleCreateNew = async () => {
    if (!searchedFicha) return;
    const situacion = await EstadoSituacionService.getEstadoSituacion(searchedFicha.ruc);
    const newDraft: Partial<RibReporteTributario> = { ruc: searchedFicha.ruc, status: 'Borrador' };
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
    setHasUnsavedChanges(true);
    setView('form');
    showSuccess('Formulario nuevo autocompletado desde Reportes Tributarios.');
  };

  const handleEditReport = async (report: RibReporteTributario) => {
    setDraftReportData(report);
    if (report.user_id) {
      const profile = await ProfileService.getProfileById(report.user_id);
      setCreatorName(profile?.full_name || 'Desconocido');
    }
    if (report.solicitud_id) {
      const { data: solicitud } = await supabase.from('solicitudes_operacion').select('id, ruc, created_at').eq('id', report.solicitud_id).single();
      if (solicitud) {
        const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).single();
        setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
      }
    }
    setView('form');
  };

  const handleDataChange = (updatedData: Partial<RibReporteTributario>) => {
    setDraftReportData(updatedData);
    setHasUnsavedChanges(true);
  };

  const handleStatusChange = (newStatus: Status) => {
    if (draftReportData) handleDataChange({ ...draftReportData, status: newStatus });
  };

  const handleSolicitudIdChange = (solicitudId: string | null) => {
    if (draftReportData) handleDataChange({ ...draftReportData, solicitud_id: solicitudId });
  };

  const handleSave = async () => {
    if (!draftReportData || !draftReportData.ruc) {
      showError('No hay datos para guardar');
      return;
    }
    setIsSaving(true);
    try {
      await RibReporteTributarioService.upsert(draftReportData);
      setHasUnsavedChanges(false);
      showSuccess('Reporte RIB guardado exitosamente.');
      await loadData();
      setView('list');
      clearState();
    } catch (err) {
      showError(`Error al guardar el reporte RIB: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const searchSolicitudes = async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_solicitudes', { search_term: query });
    if (error) { console.error('Error searching solicitudes:', error); return []; }
    return data || [];
  };

  const handleBack = () => {
    if (hasUnsavedChanges && !confirm('Tienes cambios sin guardar. ¿Deseas descartarlos?')) return;
    if (view === 'form') setView('search_results');
    else if (view === 'search_results' || view === 'detail') {
      setView('list');
      clearState();
      setSelectedRuc(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const selectedCompanyReports = selectedRuc ? allRawReports.filter(r => r.ruc === selectedRuc) : [];

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ClipboardList className="h-6 w-6 mr-3 text-[#00FF80]" />
              RIB - Reporte Tributario
            </h1>
            {view !== 'list' && <Button variant="outline" onClick={handleBack} className="border-gray-700 text-gray-300">Volver</Button>}
          </div>

          {view === 'list' && (
            <>
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
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader><CardTitle className="text-white">Reportes RIB por Empresa</CardTitle></CardHeader>
                <CardContent>
                  {loadingSummaries ? <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div>
                    : <RibReporteTributarioList reports={groupedReports} onSelectReport={(ruc) => { setSelectedRuc(ruc); setView('detail'); }} />}
                </CardContent>
              </Card>
            </>
          )}

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {view === 'detail' && selectedRuc && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Reportes para: {groupedReports.find(g => g.ruc === selectedRuc)?.nombre_empresa}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow className="border-gray-800"><TableHead className="text-gray-300">Año</TableHead><TableHead className="text-gray-300">Estado</TableHead><TableHead className="text-gray-300">Última Actualización</TableHead><TableHead className="text-right text-gray-300">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {selectedCompanyReports?.map((report, idx) => (
                      <TableRow key={idx} className="border-gray-800">
                        <TableCell>{report.anio_reporte}</TableCell>
                        <TableCell><Badge className={getStatusColor(report.status!)}>{report.status}</Badge></TableCell>
                        <TableCell>{new Date(report.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            const fullReport = existingReports.find(r => (r as any)._rowIds[`deudor_${report.anio_reporte}`] === report.id);
                            if (fullReport) handleEditReport(fullReport);
                          }} className="text-gray-400 hover:text-white"><Edit className="h-4 w-4 mr-2" />Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {view === 'form' && searchedFicha && draftReportData && (
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RibReporteTributarioPage;