import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, ClipboardList, Eye } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { ReporteTributarioDeudor, ReporteTributarioDeudorService, ReporteTributarioDeudorSummary } from '@/services/reporteTributarioDeudorService';
import ReporteTributarioDeudorTable from '@/components/reporte-tributario-deudor/ReporteTributarioDeudorTable';
import ReporteTributarioDeudorList from '@/components/reporte-tributario-deudor/ReporteTributarioDeudorList';
import { showSuccess, showError } from '@/utils/toast';

const ReporteTributarioDeudorPage = () => {
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [reportData, setReportData] = useState<ReporteTributarioDeudor | null>(null);
  const [reportSummaries, setReportSummaries] = useState<ReporteTributarioDeudorSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  const fetchSummaries = async () => {
    try {
      console.log('Starting to fetch summaries...');
      setLoadingSummaries(true);
      const summaries = await ReporteTributarioDeudorService.getAllSummaries();
      console.log('Fetched summaries:', summaries);
      setReportSummaries(summaries);
    } catch (err) {
      console.error('Error fetching summaries:', err);
      showError('Error al cargar la lista de reportes.');
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const handleSearch = async (rucToSearch?: string) => {
    const ruc = rucToSearch || rucInput;
    if (!ruc || ruc.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setReportData(null);

    try {
      const fichaData = await FichaRucService.getByRuc(ruc);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const existingReport = await ReporteTributarioDeudorService.getByRuc(ruc);
        setReportData(existingReport);
      } else {
        setError('Ficha RUC no encontrada. No se puede crear un reporte.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la empresa.');
      showError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async (dataToSave: any) => {
    try {
      await ReporteTributarioDeudorService.upsert(dataToSave);
      showSuccess('Reporte guardado exitosamente.');
      const updatedReport = await ReporteTributarioDeudorService.getByRuc(rucInput);
      setReportData(updatedReport);
      await fetchSummaries(); // Refresh the list
    } catch (err) {
      showError('Error al guardar el reporte.');
    }
  };

  const handleSelectReport = (ruc: string) => {
    setRucInput(ruc);
    handleSearch(ruc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  console.log('Current state - loadingSummaries:', loadingSummaries, 'reportSummaries:', reportSummaries);

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ClipboardList className="h-6 w-6 mr-3 text-[#00FF80]" />
            Reporte Tributario del Deudor
          </h1>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar o Editar Empresa por RUC</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Ingrese RUC de 11 dígitos"
                  value={rucInput}
                  onChange={(e) => setRucInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={11}
                  className="pl-10 bg-gray-900/50 border-gray-700"
                />
              </div>
              <Button onClick={() => handleSearch()} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {searchedFicha && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                  {searchedFicha.nombre_empresa}: Estado de situación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReporteTributarioDeudorTable
                  ruc={searchedFicha.ruc}
                  initialData={reportData}
                  onSave={handleSave}
                />
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Análisis de Deudores Guardados</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummaries ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : reportSummaries.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay análisis de deudores guardados</p>
                  <p className="text-sm mt-2">Busca una empresa y guarda su análisis para verlo aquí</p>
                </div>
              ) : (
                <ReporteTributarioDeudorList reports={reportSummaries} onSelectReport={handleSelectReport} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ReporteTributarioDeudorPage;