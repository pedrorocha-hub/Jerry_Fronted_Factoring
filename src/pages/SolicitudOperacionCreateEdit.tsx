import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Building2, FilePlus, Loader2, AlertCircle, CheckCircle, FileText, ShieldCheck, User, Briefcase, XCircle, ArrowLeft, Calendar, RefreshCw, PlusCircle, Trash2, Plus, ClipboardCopy, TrendingUp, Save } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FichaRuc } from '@/types/ficha-ruc';
import { SolicitudOperacion, SolicitudOperacionRiesgo, SolicitudOperacionWithRiesgos, SolicitudStatus } from '@/types/solicitud-operacion';
import { SolicitudOperacionService } from '@/services/solicitudOperacionService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

const SolicitudOperacionCreateEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useSession();
  const isCreateMode = !id;

  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [solicitud, setSolicitud] = useState<Partial<SolicitudOperacionWithRiesgos>>({});
  const [riesgos, setRiesgos] = useState<Partial<SolicitudOperacionRiesgo>[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const loadSolicitud = useCallback(async (solicitudId: string) => {
    setSearching(true);
    try {
      const data = await SolicitudOperacionService.getById(solicitudId);
      if (data) {
        setSolicitud(data);
        setRiesgos(data.riesgos || []);
        const ficha = await FichaRucService.getByRuc(data.ruc);
        setSearchedFicha(ficha);
      } else {
        showError('No se encontró la solicitud.');
        navigate('/solicitudes-operacion');
      }
    } catch (err) {
      showError('Error al cargar la solicitud.');
    } finally {
      setSearching(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!isCreateMode && id) {
      loadSolicitud(id);
    }
  }, [id, isCreateMode, loadSolicitud]);

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const fichaData = await FichaRucService.getByRuc(rucInput);
      if (fichaData) {
        setSearchedFicha(fichaData);
        setSolicitud({ ruc: rucInput, status: 'Borrador' });
        setRiesgos([]);
      } else {
        setError('Ficha RUC no encontrada. No se puede crear una solicitud.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSolicitud(prev => ({ ...prev, [id]: value }));
    setIsDirty(true);
  };

  const handleStatusChange = (status: SolicitudStatus) => {
    setSolicitud(prev => ({ ...prev, status }));
    setIsDirty(true);
  };

  const handleRiesgoChange = (index: number, field: keyof SolicitudOperacionRiesgo, value: string) => {
    const newRiesgos = [...riesgos];
    (newRiesgos[index] as any)[field] = value;
    setRiesgos(newRiesgos);
    setIsDirty(true);
  };

  const addRiesgo = () => {
    setRiesgos([...riesgos, {}]);
    setIsDirty(true);
  };

  const removeRiesgo = (index: number) => {
    setRiesgos(riesgos.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedSolicitud;
      if (isCreateMode) {
        savedSolicitud = await SolicitudOperacionService.create(solicitud);
        showSuccess('Solicitud creada exitosamente.');
      } else {
        savedSolicitud = await SolicitudOperacionService.update(id!, solicitud);
        showSuccess('Solicitud actualizada exitosamente.');
      }

      // Handle riesgos
      const { error: deleteError } = await supabase.from('solicitud_operacion_riesgos').delete().eq('solicitud_id', savedSolicitud.id);
      if (deleteError) throw deleteError;

      const riesgosToInsert = riesgos.map(r => ({ ...r, solicitud_id: savedSolicitud.id }));
      if (riesgosToInsert.length > 0) {
        const { error: insertError } = await supabase.from('solicitud_operacion_riesgos').insert(riesgosToInsert);
        if (insertError) throw insertError;
      }

      setIsDirty(false);
      if (isCreateMode) {
        navigate(`/solicitudes-operacion/editar/${savedSolicitud.id}`);
      } else {
        loadSolicitud(id!);
      }
    } catch (err) {
      showError('Error al guardar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  if (isCreateMode) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-white">Crear Solicitud de Operación</h1>
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader><CardTitle className="text-white">Buscar Empresa por RUC</CardTitle></CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Ingrese RUC de 11 dígitos" value={rucInput} onChange={(e) => setRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
            </CardContent>
          </Card>
          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
          {searchedFicha && <Button onClick={handleSave} disabled={saving}>{saving ? 'Creando...' : 'Crear Borrador y Continuar'}</Button>}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Editar Solicitud de Operación</h1>
            <Button variant="outline" onClick={() => navigate('/solicitudes-operacion')} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>
          </div>

          <div className="space-y-6">
            {searchedFicha && (
              <div className="space-y-6">
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">Información de la Empresa</CardTitle></CardHeader>
                  <CardContent>
                    <p><strong>RUC:</strong> {searchedFicha.ruc}</p>
                    <p><strong>Razón Social:</strong> {searchedFicha.nombre_empresa}</p>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">Datos Generales</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="proveedor">Proveedor</Label><Input id="proveedor" value={solicitud.proveedor || ''} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                    <div><Label htmlFor="deudor">Deudor</Label><Input id="deudor" value={solicitud.deudor || ''} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                    <div><Label htmlFor="producto">Producto</Label><Input id="producto" value={solicitud.producto || ''} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                    <div><Label htmlFor="moneda_operacion">Moneda</Label><Input id="moneda_operacion" value={solicitud.moneda_operacion || ''} onChange={handleInputChange} className="bg-gray-900/50 border-gray-700" /></div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">Riesgos</CardTitle></CardHeader>
                  <CardContent>
                    {riesgos.map((riesgo, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                        <Input placeholder="LP" value={riesgo.lp || ''} onChange={(e) => handleRiesgoChange(index, 'lp', e.target.value)} className="bg-gray-900/50 border-gray-700" />
                        <Input placeholder="Riesgo Aprobado" value={riesgo.riesgo_aprobado || ''} onChange={(e) => handleRiesgoChange(index, 'riesgo_aprobado', e.target.value)} className="bg-gray-900/50 border-gray-700" />
                        <Button variant="ghost" onClick={() => removeRiesgo(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <Button onClick={addRiesgo}><Plus className="h-4 w-4 mr-2" />Añadir Riesgo</Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
                      Análisis Crediticio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Gestiona el análisis de comportamiento crediticio asociado a este expediente.
                    </p>
                    <Button
                      onClick={() => navigate(`/comportamiento-crediticio/manage/${id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!id}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Gestionar Comportamiento Crediticio
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">Completar Datos</CardTitle></CardHeader>
                  <CardContent>
                    <Label htmlFor="status">Estado</Label>
                    <Select value={solicitud.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Borrador">Borrador</SelectItem>
                        <SelectItem value="En Revisión">En Revisión</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSave} disabled={saving || !isDirty} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar Cambios
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SolicitudOperacionCreateEditPage;