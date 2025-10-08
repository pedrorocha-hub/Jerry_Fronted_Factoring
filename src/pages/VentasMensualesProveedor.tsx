import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesProveedorService } from '@/services/ventasMensualesProveedorService';
import VentasMensualesTable from '@/components/ventas-mensuales-proveedor/VentasMensualesTable';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

export interface SalesData {
  [year: number]: {
    [month: string]: number | null;
  };
}

const VentasMensualesProveedorPage = () => {
  const { isAdmin } = useSession();
  const [rucInput, setRucInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFicha, setSearchedFicha] = useState<FichaRuc | null>(null);
  const [salesData, setSalesData] = useState<SalesData>({});

  const handleSearch = async () => {
    if (!rucInput || rucInput.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setSalesData({});

    try {
      const fichaData = await FichaRucService.getByRuc(rucInput);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const reportes = await VentasMensualesProveedorService.getByRuc(rucInput);
        
        const initialSalesData: SalesData = {};
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
        
        reportes.forEach(reporte => {
          if (reporte.anio) {
            initialSalesData[reporte.anio] = {};
            months.forEach(month => {
              const key = month as keyof typeof reporte;
              initialSalesData[reporte.anio][month] = reporte[key] as number | null;
            });
          }
        });
        setSalesData(initialSalesData);

      } else {
        setError('Ficha RUC no encontrada. No se puede continuar.');
        showError('Ficha RUC no encontrada.');
      }
    } catch (err) {
      setError('Ocurrió un error al buscar la empresa.');
      showError('Error al buscar la empresa.');
    } finally {
      setSearching(false);
    }
  };

  const handleDataChange = (year: number, month: string, value: number | null) => {
    setSalesData(prev => ({
      ...prev,
      [year]: {
        ...prev[year],
        [month]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!searchedFicha) return;
    setSaving(true);
    try {
      for (const yearStr of Object.keys(salesData)) {
        const year = Number(yearStr);
        const yearData = salesData[year];
        
        const payload = {
          ruc: searchedFicha.ruc,
          anio: year,
          ...yearData
        };
        
        await VentasMensualesProveedorService.upsert(payload);
      }
      showSuccess('Datos de ventas mensuales guardados exitosamente.');
    } catch (err) {
      showError('Error al guardar los datos de ventas.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white">Ventas Mensuales del Proveedor</h1>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar Proveedor por RUC</CardTitle>
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
                <CardTitle className="flex items-center text-white">
                  <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                  {searchedFicha.nombre_empresa}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VentasMensualesTable data={salesData} onDataChange={handleDataChange} />
                {isAdmin && (
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar Cambios
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VentasMensualesProveedorPage;