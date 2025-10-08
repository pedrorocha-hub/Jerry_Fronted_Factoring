import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, Save, BarChart3, X, ClipboardList } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesProveedorService, VentasMensualesProveedorSummary } from '@/services/ventasMensualesProveedorService';
import VentasMensualesTable from '@/components/ventas-mensuales-proveedor/VentasMensualesTable';
import VentasMensualesProveedorList from '@/components/ventas-mensuales-proveedor/VentasMensualesProveedorList';
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
  const [summaries, setSummaries] = useState<VentasMensualesProveedorSummary[]>([]);
  const [loadingSummaries, setLoadingSummaries] = useState(true);

  const fetchSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const summaryData = await VentasMensualesProveedorService.getAllSummaries();
      setSummaries(summaryData);
    } catch (err) {
      showError('Error al cargar la lista de reportes de ventas.');
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  const clearSearch = () => {
    setRucInput('');
    setError(null);
    setSearchedFicha(null);
    setSalesData({});
  };

  const handleSearch = async (rucToSearch?: string) => {
    const ruc = rucToSearch || rucInput;
    if (!ruc || ruc.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }
    setSearching(true);
    setError(null);
    setSearchedFicha(null);
    setSalesData({});
    setRucInput(ruc);

    try {
      const fichaData = await FichaRucService.getByRuc(ruc);
      if (fichaData) {
        setSearchedFicha(fichaData);
        const reportes = await VentasMensualesProveedorService.getByRuc(ruc);
        
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
        
        await VentasMensualesProveedorService.upsert(payload as any);
      }
      showSuccess('Datos de ventas mensuales guardados exitosamente.');
      await fetchSummaries();
    } catch (err) {
      showError('Error al guardar los datos de ventas.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectReport = (ruc: string) => {
    handleSearch(ruc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-[#00FF80]" />
            Ventas Mensuales del Proveedor
          </h1>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Buscar o Editar Proveedor por RUC</CardTitle>
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

          {error && <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {searchedFicha ? (
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
          ) : (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Proveedores con Ventas Registradas</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSummaries ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                  </div>
                ) : summaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay ventas de proveedores guardadas</p>
                    <p className="text-sm mt-2">Busca un proveedor por su RUC para empezar a registrar sus ventas</p>
                  </div>
                ) : (
                  <VentasMensualesProveedorList reports={summaries} onSelectReport={handleSelectReport} />
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