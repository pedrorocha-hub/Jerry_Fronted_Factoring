import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, TrendingUp, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FichaRuc } from '@/types/ficha-ruc';
import { ComportamientoCrediticio, ComportamientoCrediticioInsert, ComportamientoCrediticioUpdate } from '@/types/comportamientoCrediticio';
import { FichaRucService } from '@/services/fichaRucService';
import { ComportamientoCrediticioService } from '@/services/comportamientoCrediticioService';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import ComportamientoCrediticioTable from '@/components/comportamiento-crediticio/ComportamientoCrediticioTable';
import { supabase } from '@/integrations/supabase/client';

interface ReporteWithDetails extends ComportamientoCrediticio {
  nombre_empresa?: string;
  creator_name?: string;
}

const ComportamientoCrediticioPage = () => {
  const { isAdmin } = useSession();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [allReports, setAllReports] = useState<ReporteWithDetails[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [existingReports, setExistingReports] = useState<ComportamientoCrediticio[]>([]);
  const [selectedReport, setSelectedReport] = useState<ComportamientoCrediticio | null>(null);

  const emptyForm = {
    proveedor: '',
    equifax_calificacion: '',
    sentinel_calificacion: '',
    equifax_deuda_directa: '',
    sentinel_deuda_directa: '',
    equifax_deuda_indirecta: '',
    sentinel_deuda_indirecta: '',
    equifax_impagos: '',
    sentinel_impagos: '',
    equifax_deuda_sunat: '',
    sentinel_deuda_sunat: '',
    equifax_protestos: '',
    sentinel_protestos: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadAllReports();
  }, []);

  const loadAllReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await ComportamientoCrediticioService.getAll();
      if (reports.length > 0) {
        const rucs = [...new Set(reports.map(r => r.ruc))];
        const { data: fichasData, error: fichasError } = await supabase.from('ficha_ruc').select('ruc, nombre_empresa').in('ruc', rucs);
        if (fichasError) throw fichasError;
        const rucToNameMap = new Map(fichasData.map(f => [f.ruc, f.nombre_empresa]));

        const userIds = [...new Set(reports.map(r => r.user_id).filter((id): id is string => !!id))];
        let userMap = new Map<string, string>();
        if (userIds.length > 0) {
            const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
            if (profilesError) throw profilesError;
            profilesData.forEach(p => userMap.set(p.id, p.full_name || ''));
        }

        const enrichedReports = reports.map(report => ({
          ...report,
          nombre_empresa: rucToNameMap.get(report.ruc) || 'N/A',
          creator_name: report.user_id ? userMap.get(report.user_id) || 'Desconocido' : 'Sistema',
        }));
        setAllReports(enrichedReports);
      } else {
        setAllReports([]);
      }
    } catch (err) {
      showError('No se pudieron cargar los reportes.');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSearch = async (rucToSearch: string) => {
    setSearching(true);
    setError(null);
    try {
      const fichaData = await FichaRucService.getByRuc(rucToSearch);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const reportsForRuc = await ComportamientoCrediticioService.getByRuc(rucToSearch);
        setExistingReports(reportsForRuc);
        if (reportsForRuc.length > 0) {
          handleSelectReport(reportsForRuc[0]);
        } else {
          setSelectedReport(null);
          setFormData({ ...emptyForm, proveedor: fichaData.nombre_empresa });
        }
        setView('form');
      } else {
        setError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectReport = (report: ComportamientoCrediticio) => {
    setSelectedReport(report);
    setFormData({
      proveedor: report.proveedor || '',
      equifax_calificacion: report.equifax_calificacion || '',
      sentinel_calificacion: report.sentinel_calificacion || '',
      equifax_deuda_directa: report.equifax_deuda_directa?.toString() || '',
      sentinel_deuda_directa: report.sentinel_deuda_directa?.toString() || '',
      equifax_deuda_indirecta: report.equifax_deuda_indirecta?.toString() || '',
      sentinel_deuda_indirecta: report.sentinel_deuda_indirecta?.toString() || '',
      equifax_impagos: report.equifax_impagos?.toString() || '',
      sentinel_impagos: report.sentinel_impagos?.toString() || '',
      equifax_deuda_sunat: report.equifax_deuda_sunat?.toString() || '',
      sentinel_deuda_sunat: report.sentinel_deuda_sunat?.toString() || '',
      equifax_protestos: report.equifax_protestos?.toString() || '',
      sentinel_protestos: report.sentinel_protestos?.toString() || '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!searchedFicha) return;
    setSaving(true);
    try {
      const dataToSave = {
        ruc: searchedFicha.ruc,
        proveedor: formData.proveedor,
        equifax_calificacion: formData.equifax_calificacion || null,
        sentinel_calificacion: formData.sentinel_calificacion || null,
        equifax_deuda_directa: parseFloat(formData.equifax_deuda_directa) || null,
        sentinel_deuda_directa: parseFloat(formData.sentinel_deuda_directa) || null,
        equifax_deuda_indirecta: parseFloat(formData.equifax_deuda_indirecta) || null,
        sentinel_deuda_indirecta: parseFloat(formData.sentinel_deuda_indirecta) || null,
        equifax_impagos: parseFloat(formData.equifax_impagos) || null,
        sentinel_impagos: parseFloat(formData.sentinel_impagos) || null,
        equifax_deuda_sunat: parseFloat(formData.equifax_deuda_sunat) || null,
        sentinel_deuda_sunat: parseFloat(formData.sentinel_deuda_sunat) || null,
        equifax_protestos: parseFloat(formData.equifax_protestos) || null,
        sentinel_protestos: parseFloat(formData.sentinel_protestos) || null,
      };

      if (selectedReport) {
        await ComportamientoCrediticioService.update(selectedReport.id, dataToSave);
        showSuccess('Reporte actualizado.');
      } else {
        await ComportamientoCrediticioService.create(dataToSave);
        showSuccess('Reporte creado.');
      }
      await handleSearch(searchedFicha.ruc); // Refresh data for current RUC
      await loadAllReports(); // Refresh main list
    } catch (err) {
      showError('Error al guardar el reporte.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este reporte?')) {
      try {
        await ComportamientoCrediticioService.delete(id);
        showSuccess('Reporte eliminado.');
        await loadAllReports();
        if (selectedReport?.id === id) {
          handleBackToList();
        }
      } catch (err) {
        showError('Error al eliminar el reporte.');
      }
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSearchedFicha(null);
    setRucInput('');
    setError(null);
    setExistingReports([]);
    setSelectedReport(null);
    setFormData(emptyForm);
  };

  const handleEditFromList = (report: ReporteWithDetails) => {
    setRucInput(report.ruc);
    handleSearch(report.ruc);
  };

  const formFields = [
    { id: 'calificacion', label: 'Calificación', type: 'text' },
    { id: 'deuda_directa', label: 'Deuda Directa Bancos', type: 'number' },
    { id: 'deuda_indirecta', label: 'Deuda Indirecta Bancos', type: 'number' },
    { id: 'impagos', label: 'Impagos', type: 'number' },
    { id: 'deuda_sunat', label: 'Deuda SUNAT', type: 'number' },
    { id: 'protestos', label: 'Protestos', type: 'number' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-[#00FF80]" />
              Comportamiento Crediticio
            </h1>
            {view === 'form' && (
              <Button variant="outline" onClick={handleBackToList} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
            )}
          </div>

          {view === 'list' && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Buscar o Crear Reporte</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Ingrese RUC para buscar o crear" value={rucInput} onChange={(e) => setRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
                </div>
                <Button onClick={() => handleSearch(rucInput)} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar
                </Button>
              </CardContent>
            </Card>
          )}

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {view === 'form' && searchedFicha && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">{selectedReport ? 'Editando' : 'Nuevo'} Reporte para: {searchedFicha.nombre_empresa}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input id="proveedor" value={formData.proveedor} disabled className="bg-gray-800 border-gray-700 text-gray-400" />
                </div>
                <div className="space-y-4 pt-4 mt-4 border-t border-gray-800">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 items-center font-medium">
                    <div className="text-gray-300">Concepto</div>
                    <div className="text-white text-center">Equifax</div>
                    <div className="text-white text-center">Sentinel</div>
                  </div>
                  {formFields.map(field => (
                    <div key={field.id} className="grid grid-cols-3 gap-x-4 items-center">
                      <Label htmlFor={`equifax_${field.id}`} className="text-gray-400">{field.label}</Label>
                      <Input id={`equifax_${field.id}`} type={field.type} value={formData[`equifax_${field.id}` as keyof typeof formData]} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                      <Input id={`sentinel_${field.id}`} type={field.type} value={formData[`sentinel_${field.id}` as keyof typeof formData]} onChange={handleFormChange} className="bg-gray-900/50 border-gray-700 text-white" disabled={!isAdmin} />
                    </div>
                  ))}
                </div>
                {isAdmin && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      {selectedReport ? 'Actualizar Reporte' : 'Guardar Reporte'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {view === 'list' && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Reportes Creados</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div>
                ) : allReports.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">No hay reportes creados.</div>
                ) : (
                  <ComportamientoCrediticioTable reports={allReports} onEdit={handleEditFromList} onDelete={handleDelete} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ComportamientoCrediticioPage;