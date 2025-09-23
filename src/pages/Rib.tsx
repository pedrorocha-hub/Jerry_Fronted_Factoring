import React, { useState, useEffect } from 'react';
import { Search, Building2, FilePlus, Loader2, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FichaRuc } from '@/types/ficha-ruc';
import { Rib } from '@/types/rib';
import { RibService } from '@/services/ribService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import RibTable from '@/components/rib/RibTable';

const RibPage = () => {
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [ribFormData, setRibFormData] = useState<{ status: 'draft' | 'completed' | 'in_review' }>({
    status: 'draft',
  });
  const [ribs, setRibs] = useState<Rib[]>([]);
  const [loadingRibs, setLoadingRibs] = useState(true);

  useEffect(() => {
    loadRibs();
  }, []);

  const loadRibs = async () => {
    setLoadingRibs(true);
    try {
      const data = await RibService.getAll();
      setRibs(data);
    } catch (err) {
      showError('No se pudieron cargar las fichas Rib existentes.');
    } finally {
      setLoadingRibs(false);
    }
  };

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);

    try {
      const data = await FichaRucService.getByRuc(rucInput);
      if (data) {
        setSearchedFicha(data);
        showSuccess('Ficha RUC encontrada.');
      } else {
        setError('Ficha RUC no encontrada. Asegúrese de que exista antes de crear un Rib.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la Ficha RUC.');
      showError('Error al buscar la Ficha RUC.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateRib = async () => {
    if (!searchedFicha) return;
    setCreating(true);
    try {
      await RibService.create({ 
        ruc: searchedFicha.ruc, 
        status: ribFormData.status 
      });
      showSuccess(`Ficha Rib creada para ${searchedFicha.nombre_empresa}`);
      setSearchedFicha(null);
      setRucInput('');
      setError(null);
      await loadRibs();
    } catch (err) {
      showError('No se pudo crear la ficha Rib.');
    } finally {
      setCreating(false);
    }
  };

  const handleEditRib = (rib: Rib) => {
    showError('La edición aún no está implementada.');
    console.log('Edit:', rib);
  };

  const handleDeleteRib = (rib: Rib) => {
    showError('La eliminación aún no está implementada.');
    console.log('Delete:', rib);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-[#00FF80]" />
                Crear Ficha Rib
              </h1>
              <p className="text-gray-400">Reporte de Inicio Básico de empresa</p>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="text-white">1. Buscar Empresa por RUC</CardTitle></CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Ingrese RUC de 11 dígitos" 
                    value={rucInput} 
                    onChange={(e) => setRucInput(e.target.value)} 
                    maxLength={11} 
                    className="pl-10 bg-gray-900/50 border-gray-700" 
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                  {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Buscar Empresa
                </Button>
              </CardContent>
            </Card>

            {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

            {searchedFicha && (
              <div className="space-y-6">
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                        Datos de la Empresa
                      </div>
                      <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Encontrada
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-gray-400">RUC</Label><Input value={searchedFicha.ruc} disabled className="bg-gray-900/50 border-gray-700 font-mono" /></div>
                      <div><Label className="text-gray-400">Razón Social</Label><Input value={searchedFicha.nombre_empresa} disabled className="bg-gray-900/50 border-gray-700" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label className="text-gray-400">Estado</Label><Input value={searchedFicha.estado_contribuyente || 'N/A'} disabled className="bg-gray-900/50 border-gray-700" /></div>
                      <div><Label className="text-gray-400">Inicio de Actividades</Label><Input value={searchedFicha.fecha_inicio_actividades ? new Date(searchedFicha.fecha_inicio_actividades).toLocaleDateString() : 'N/A'} disabled className="bg-gray-900/50 border-gray-700" /></div>
                    </div>
                    <div><Label className="text-gray-400">Domicilio Fiscal</Label><Textarea value={searchedFicha.domicilio_fiscal || 'N/A'} disabled rows={2} className="bg-gray-900/50 border-gray-700" /></div>
                  </CardContent>
                </Card>

                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="text-white">2. Completar Datos del Rib</CardTitle></CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="status" className="text-gray-400">Estado de la Ficha Rib</Label>
                      <Select value={ribFormData.status} onValueChange={(value) => setRibFormData({ status: value as 'draft' | 'completed' | 'in_review' })}>
                        <SelectTrigger className="bg-gray-900/50 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-gray-800 text-white">
                          <SelectItem value="draft" className="hover:bg-gray-800">Borrador</SelectItem>
                          <SelectItem value="in_review" className="hover:bg-gray-800">En Revisión</SelectItem>
                          <SelectItem value="completed" className="hover:bg-gray-800">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleCreateRib} disabled={creating} size="lg" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                    {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FilePlus className="h-4 w-4 mr-2" />}
                    Confirmar y Crear Ficha Rib
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Fichas Rib Creadas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRibs ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : (
                <RibTable ribs={ribs} onEdit={handleEditRib} onDelete={handleDeleteRib} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RibPage;