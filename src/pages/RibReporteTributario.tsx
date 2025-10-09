import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, ClipboardList, X, TrendingUp, Calculator, Zap, AlertTriangle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { RibReporteTributario, RibReporteTributarioService, RibReporteTributarioSummary, AutoFillWarning } from '@/services/ribReporteTributarioService';
import { ProfileService } from '@/services/profileService';
import RibReporteTributarioTable from '@/components/rib-reporte-tributario/RibReporteTributarioTable';
import EstadosResultadosTable from '@/components/rib-reporte-tributario/EstadosResultadosTable';
import IndicesFinancierosTable from '@/components/rib-reporte-tributario/IndicesFinancierosTable';
import ProveedorSection from '@/components/rib-reporte-tributario/ProveedorSection';
import RibReporteTributarioList from '@/components/rib-reporte-tributario/RibReporteTributarioList';
import ReporteStatusManager from '@/components/rib-reporte-tributario/ReporteStatusManager';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

type Status = 'Borrador' | 'En revisión' | 'Completado';

const RibReporteTributarioPage = () => {
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  
  const [savedReportData, setSavedReportData] = useState<RibReporteTributario | null>(null);
  const [draftReportData, setDraftReportData] = useState<Partial<RibReporteTributario> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoFillWarnings, setAutoFillWarnings] = useState<AutoFillWarning[]>([]);

  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reportSummaries, setReportSummaries] = useState<RibReporteTributarioSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  const fetchSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const summaries = await RibReporteTributarioService.getAllSummaries();
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const clearSearch = () => {
    setRucInput('');
    setError(null);
    setSearchedFicha(null);
    setSavedReportData(null);
    setDraftReportData(null);
    setCreatorName(null);
    setHasUnsavedChanges(false);
    setAutoFillWarnings([]);
  };

  const handleSearch = async (rucToSearch?: string) => {
    const ruc = rucToSearch || rucInput;
    if (!ruc || ruc.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    clearSearch();
    setRucInput(ruc);

    const loadingToast = showLoading('Buscando empresa y datos tributarios...');

    try {
      const fichaData = await FichaRucService.getByRuc(ruc);
      if (fichaData) {
        setSearchedFicha(fichaData);
        
        // Buscar reporte existente
        const existingReport = await RibReporteTributarioService.getByRuc(ruc);
        
        if (existingReport) {
          // Si ya existe un reporte, usarlo
          setSavedReportData(existingReport);
          setDraftReportData(existingReport);
          
          if (existingReport.user_id) {
            const profile = await ProfileService.getProfileById(existingReport.user_id);
            setCreatorName(profile?.full_name || 'Desconocido');
          } else {
            setCreatorName('Sistema');
          }
        } else {
          // Si no existe, intentar auto-completar desde reporte tributario
          try {
            const autoFillResult = await RibReporteTributarioService.autoFillFromReporteTributario(ruc);
            
            if (autoFillResult.warnings.length > 0) {
              setAutoFillWarnings(autoFillResult.warnings);
            }
            
            const newReport = {
              ...autoFillResult.data,
              status: 'Borrador' as Status,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setSavedReportData(null); // No hay reporte guardado aún
            setDraftReportData(newReport);
            
            if (Object.keys(autoFillResult.data).length > 1) { // Más que solo el RUC
              showSuccess('✨ Datos completados automáticamente desde reportes tributarios');
              setHasUnsavedChanges(true);
            }
          } catch (autoFillError) {
            console.warn('No se pudieron auto-completar los datos:', autoFillError);
            // Crear reporte vacío
            const emptyReport = { 
              ruc, 
              status: 'Borrador' as Status, 
              created_at: new Date().toISOString(), 
              updated_at: new Date().toISOString() 
            };
            setSavedReportData(null);
            setDraftReportData(emptyReport);
          }
        }
      } else {
        setError('Ficha RUC no encontrada. No se puede crear un reporte.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la empresa.');
      showError('Error al buscar la empresa.');
    } finally {
      dismissToast(loadingToast);
      setSearching(false);
    }
  };

  const handleDataChange = (updatedData: Partial<RibReporteTributario>) => {
    setDraftReportData(updatedData);
    setHasUnsavedChanges(true);
  };

  const handleStatusChange = (newStatus: Status) => {
    if (draftReportData) {
      setDraftReportData({ ...draftReportData, status: newStatus });
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!draftReportData || !draftReportData.ruc) return;
    setIsSaving(true);
    try {
      const savedData = await RibReporteTributarioService.upsert(draftReportData as any);
      setSavedReportData(savedData);
      setDraftReportData(savedData);
      setHasUnsavedChanges(false);
      showSuccess('Reporte RIB actualizado exitosamente.');
      await fetchSummaries();
    } catch (err) {
      showError('Error al guardar el reporte RIB.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectReport = (ruc: string) => {
    setRucInput(ruc);
    handleSearch(ruc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ClipboardList className="h-6 w-6 mr-3 text-[#00FF80]" />
            RIB - Reporte Tributario
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
              {searchedFicha && (
                <Button onClick={clearSearch} variant="outline" className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Mostrar warnings de auto-completado */}
          {autoFillWarnings.length > 0 && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">⚠️ Advertencias en el auto-completado:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {autoFillWarnings.map((warning, index) => (
                      <li key={index}>
                        <strong>Año {warning.year}:</strong> {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {searchedFicha ? (
            <div className="space-y-8">
              {/* Indicador de auto-completado */}
              {draftReportData && !savedReportData && Object.keys(draftReportData).length > 3 && (
                <Alert className="bg-[#00FF80]/10 border-[#00FF80]/20 text-[#00FF80]">
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>✨ Los datos han sido completados automáticamente desde los reportes tributarios existentes.</span>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black ml-4"
                      >
                        Guardar Auto-completado
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Sección del Deudor */}
              <div className="space-y-6">
                <div className="border-l-4 border-[#00FF80] pl-4">
                  <h2 className="text-xl font-bold text-white mb-2">DATOS DEL DEUDOR</h2>
                  <p className="text-gray-400 text-sm">Información financiera de {searchedFicha.nombre_empresa}</p>
                </div>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                      {searchedFicha.nombre_empresa}: Estado de situación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RibReporteTributarioTable
                      ruc={searchedFicha.ruc}
                      data={draftReportData}
                      onDataChange={handleDataChange}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Estados de resultados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EstadosResultadosTable
                      data={draftReportData}
                      onDataChange={handleDataChange}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Índices financieros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IndicesFinancierosTable
                      data={draftReportData}
                      onDataChange={handleDataChange}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-800"></div>

              {/* Sección del Proveedor */}
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-bold text-white mb-2">DATOS DEL PROVEEDOR</h2>
                  <p className="text-gray-400 text-sm">Información financiera del proveedor (opcional)</p>
                </div>

                <ProveedorSection
                  data={draftReportData}
                  onDataChange={handleDataChange}
                />
              </div>
              
              {(savedReportData || draftReportData) && (
                <ReporteStatusManager
                  report={draftReportData as RibReporteTributario}
                  creatorName={creatorName}
                  onStatusChange={handleStatusChange}
                  onSave={handleSave}
                  isSaving={isSaving}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              )}
            </div>
          ) : (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Reportes RIB Guardados</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummaries ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                  </div>
                ) : reportSummaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay reportes RIB guardados</p>
                    <p className="text-sm mt-2">Busca una empresa para crear su reporte tributario</p>
                  </div>
                ) : (
                  <RibReporteTributarioList reports={reportSummaries} onSelectReport={handleSelectReport} />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RibReporteTributarioPage;