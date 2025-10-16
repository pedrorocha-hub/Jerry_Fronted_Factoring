import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, Loader2, AlertCircle, ClipboardList, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { RibReporteTributarioDocument, RibReporteTributarioService } from '@/services/ribReporteTributarioService';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  
  const [documentData, setDocumentData] = useState<RibReporteTributarioDocument | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);

  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      handleLoadForEdit(id);
    }
  }, [isEditMode, id]);

  const handleLoadForEdit = async (reportId: string) => {
    setSearching(true);
    try {
      const existingDocument = await RibReporteTributarioService.getById(reportId);
      if (existingDocument) {
        const fichaData = await FichaRucService.getByRuc(existingDocument.deudor.ruc);
        setSearchedFicha(fichaData);
        setRucInput(existingDocument.deudor.ruc);
        setDocumentData(existingDocument);
        
        if (existingDocument.user_id) {
          const profile = await ProfileService.getProfileById(existingDocument.user_id);
          setCreatorName(profile?.full_name || 'Desconocido');
        }
        
        if (existingDocument.solicitud_id) {
          const { data: solicitud } = await supabase
            .from('solicitudes_operacion')
            .select('id, ruc, created_at')
            .eq('id', existingDocument.solicitud_id)
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
      } else {
        showError('No se encontró el reporte para editar.');
        navigate('/rib-reporte-tributario');
      }
    } catch (err) {
      showError('Error al cargar el reporte para editar.');
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchForNew = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setDocumentData(null);
    setHasUnsavedChanges(false);

    try {
      const fichaData = await FichaRucService.getByRuc(rucInput);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const situacion = await EstadoSituacionService.getEstadoSituacion(rucInput);
        
        // Crear estructura de documento con deudor
        const newDocument: RibReporteTributarioDocument = {
          deudor: {
            ruc: rucInput,
            tipo_entidad: 'deudor',
            anio: 2024,
            cuentas_por_cobrar_giro: situacion.data_2024.cuentas_por_cobrar_del_giro,
            total_activos: situacion.data_2024.total_activos,
            cuentas_por_pagar_giro: situacion.data_2024.cuentas_por_pagar_del_giro,
            total_pasivos: situacion.data_2024.total_pasivos,
            capital_pagado: situacion.data_2024.capital_pagado,
            total_patrimonio: situacion.data_2024.total_patrimonio,
            total_pasivo_patrimonio: situacion.data_2024.total_pasivo_y_patrimonio
          },
          proveedor: null,
          solicitud_id: null,
          status: 'Borrador',
          user_id: null
        };
        
        setDocumentData(newDocument);
        setHasUnsavedChanges(true);
        showSuccess('Datos autocompletados desde Reportes Tributarios. Puede editar y guardar como un nuevo reporte.');
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

  const handleDeudorDataChange = (updatedData: any) => {
    if (documentData) {
      setDocumentData({
        ...documentData,
        deudor: { ...documentData.deudor, ...updatedData }
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleProveedorDataChange = (updatedData: any) => {
    if (documentData) {
      setDocumentData({
        ...documentData,
        proveedor: updatedData
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleStatusChange = (newStatus: Status) => {
    if (documentData) {
      setDocumentData({ ...documentData, status: newStatus });
      setHasUnsavedChanges(true);
    }
  };

  const handleSolicitudIdChange = (solicitudId: string | null) => {
    if (documentData) {
      setDocumentData({ ...documentData, solicitud_id: solicitudId });
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!documentData || !documentData.deudor.ruc) {
      showError('No hay datos para guardar');
      return;
    }
    
    if (!documentData.solicitud_id) {
      showError('Debe asociar el reporte a una Solicitud de Operación antes de guardar.');
      return;
    }
    
    setIsSaving(true);
    try {
      const savedDocument = await RibReporteTributarioService.save(documentData);
      setDocumentData(savedDocument);
      setHasUnsavedChanges(false);
      showSuccess('Reporte RIB guardado exitosamente.');
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
            <Button 
              variant="outline" 
              onClick={() => navigate('/rib-reporte-tributario')} 
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </div>

          {!isEditMode && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Buscar Empresa por RUC</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Ingrese RUC de 11 dígitos" 
                    value={rucInput} 
                    onChange={(e) => setRucInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchForNew()} 
                    maxLength={11} 
                    className="pl-10 bg-gray-900/50 border-gray-700" 
                  />
                </div>
                <Button 
                  onClick={handleSearchForNew} 
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

          {searchedFicha && documentData && (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="border-l-4 border-[#00FF80] pl-4">
                  <h2 className="text-xl font-bold text-white mb-2">
                    ESTADO DE SITUACIÓN FINANCIERA - DATOS DEL DEUDOR
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Información financiera consolidada de {searchedFicha.nombre_empresa} (2022-2024)
                  </p>
                </div>
                
                <EstadoSituacionTable ruc={searchedFicha.ruc} />
                
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
                      data={documentData.deudor} 
                      onDataChange={handleDeudorDataChange} 
                    />
                  </CardContent>
                </Card>
                
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Estados de resultados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EstadosResultadosTable 
                      data={documentData.deudor} 
                      onDataChange={handleDeudorDataChange} 
                    />
                  </CardContent>
                </Card>
                
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Índices financieros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IndicesFinancierosTable 
                      data={documentData.deudor} 
                      onDataChange={handleDeudorDataChange} 
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="border-t border-gray-800"></div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-xl font-bold text-white mb-2">DATOS DEL PROVEEDOR</h2>
                  <p className="text-gray-400 text-sm">Información financiera del proveedor (opcional)</p>
                </div>
                
                <ProveedorSection 
                  data={documentData.proveedor} 
                  onDataChange={handleProveedorDataChange} 
                />
              </div>
              
              <ReporteStatusManager
                solicitudId={documentData.solicitud_id}
                status={documentData.status as Status}
                createdAt={documentData.created_at}
                updatedAt={documentData.updated_at}
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

export default RibReporteTributarioForm;