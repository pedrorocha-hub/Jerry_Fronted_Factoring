import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

const ComportamientoCrediticioPage = () => {
  const { isAdmin } = useSession();
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  
  const [formData, setFormData] = useState({
    proveedor: '',
  });

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);

    try {
      const fichaData = await FichaRucService.getByRuc(rucInput);
      if (fichaData) {
        setSearchedFicha(fichaData);
        setFormData({ proveedor: fichaData.nombre_empresa });
        showSuccess('Empresa encontrada.');
      } else {
        setError('Ficha RUC no encontrada. No se puede crear un reporte de comportamiento crediticio.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la empresa.');
      showError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <TrendingUp className="h-6 w-6 mr-3 text-[#00FF80]" />
            Comportamiento Crediticio
          </h1>

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
                  maxLength={11} 
                  className="pl-10 bg-gray-900/50 border-gray-700" 
                />
              </div>
              <Button onClick={handleSearch} disabled={searching} className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Buscar
              </Button>
            </CardContent>
          </Card>

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {searchedFicha && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Nuevo Reporte de Comportamiento Crediticio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input id="proveedor" value={formData.proveedor} disabled className="bg-gray-800 border-gray-700 text-gray-400" />
                </div>
                {/* Aquí se agregarán más campos en el futuro */}
                <p className="text-sm text-gray-500 text-center py-4">Más campos para el reporte se agregarán aquí...</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Reportes Creados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-400">
                <p>La tabla con los reportes de comportamiento crediticio aparecerá aquí.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default ComportamientoCrediticioPage;