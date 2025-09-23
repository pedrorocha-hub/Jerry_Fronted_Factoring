import React, { useState, useEffect } from 'react';
import { Search, Building2, FilePlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { Rib } from '@/types/rib';
import { FichaRucService } from '@/services/fichaRucService';
import { RibService } from '@/services/ribService';
import { showSuccess, showError } from '@/utils/toast';
import RibTable from '@/components/rib/RibTable';

const RibPage = () => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [rucInput, setRucInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [ribs, setRibs] = useState<Rib[]>([]);

  useEffect(() => {
    loadRibs();
  }, []);

  const loadRibs = async () => {
    try {
      setLoading(true);
      const data = await RibService.getAll();
      setRibs(data);
    } catch (err) {
      showError('No se pudieron cargar las fichas Rib existentes.');
    } finally {
      setLoading(false);
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
      } else {
        setError('Ficha RUC no encontrada. Asegúrese de que exista antes de crear un Rib.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la Ficha RUC.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateRib = async () => {
    if (!searchedFicha) return;
    setCreating(true);
    try {
      await RibService.create({ ruc: searchedFicha.ruc, status: 'draft' });
      showSuccess(`Ficha Rib creada para ${searchedFicha.nombre_empresa}`);
      await loadRibs();
      setView('list');
      setSearchedFicha(null);
      setRucInput('');
    } catch (err) {
      showError('No se pudo crear la ficha Rib.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRib = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta ficha Rib?')) {
      try {
        await RibService.delete(id);
        showSuccess('Ficha Rib eliminada.');
        await loadRibs();
      } catch (err) {
        showError('No se pudo eliminar la ficha Rib.');
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Fichas Rib</h1>
              <p className="text-gray-400">Reporte de Inicio Básico de empresa</p>
            </div>
            <Button onClick={() => setView(view === 'list' ? 'create' : 'list')} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              <FilePlus className="h-4 w-4 mr-2" />
              {view === 'list' ? 'Crear Ficha Rib' : 'Ver Lista'}
            </Button>
          </div>

          {view === 'create' && (
            <div className="space-y-6">
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader><CardTitle className="text-white">1. Buscar Ficha RUC</CardTitle></CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input placeholder="Ingrese RUC para buscar" value={rucInput} onChange={(e) => setRucInput(e.target.value)} maxLength={11} className="pl-10 bg-gray-900/50 border-gray-700" />
                  </div>
                  <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto">
                    {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Buscar
                  </Button>
                </CardContent>
              </Card>

              {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

              {searchedFicha && (
                <Card className="bg-[#121212] border border-gray-800">
                  <CardHeader><CardTitle className="flex items-center justify-between text-white"><div className="flex items-center"><Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />Datos de la Empresa</div><Badge className="bg-green-500/10 text-green-400 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Encontrada</Badge></CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-gray-400">RUC</Label><p className="font-mono text-white">{searchedFicha.ruc}</p></div>
                    <div><Label className="text-gray-400">Razón Social</Label><p className="text-white">{searchedFicha.nombre_empresa}</p></div>
                    <div><Label className="text-gray-400">Estado</Label><p className="text-white">{searchedFicha.estado_contribuyente}</p></div>
                    <div><Label className="text-gray-400">Inicio de Actividades</Label><p className="text-white">{searchedFicha.fecha_inicio_actividades ? new Date(searchedFicha.fecha_inicio_actividades).toLocaleDateString() : 'N/A'}</p></div>
                    <div className="md:col-span-2"><Label className="text-gray-400">Domicilio Fiscal</Label><p className="text-white text-sm">{searchedFicha.domicilio_fiscal}</p></div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button onClick={handleCreateRib} disabled={creating} size="lg" className="w-full bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                      {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FilePlus className="h-4 w-4 mr-2" />}
                      Confirmar y Crear Ficha Rib
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {view === 'list' && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="text-white">Fichas Rib Creadas</CardTitle></CardHeader>
              <CardContent>
                {loading ? <div className="text-center py-8 text-gray-400">Cargando...</div> : <RibTable ribs={ribs} onDelete={handleDeleteRib} />}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RibPage;