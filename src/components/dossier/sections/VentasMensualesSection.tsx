import React, { useEffect, useState } from 'react';
import { TrendingUp, Building2, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DossierRib } from '@/types/dossier';
import { supabase } from '@/integrations/supabase/client';
import VentasMensualesTable from '@/components/ventas-mensuales/VentasMensualesTable';
import { SalesData } from '@/pages/VentasMensuales';

interface VentasMensualesSectionProps {
  dossier: DossierRib;
}

const VentasMensualesSection: React.FC<VentasMensualesSectionProps> = ({ dossier }) => {
  const [ventasData, setVentasData] = useState<any>(null);
  const [proveedorSalesData, setProveedorSalesData] = useState<SalesData>({});
  const [deudorSalesData, setDeudorSalesData] = useState<SalesData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ruc = dossier.solicitudOperacion.ruc;

  const extractSalesData = (report: any | null, type: 'proveedor' | 'deudor'): SalesData => {
    const salesData: SalesData = {};
    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    years.forEach(year => {
      salesData[year] = {};
      months.forEach(month => {
        const key = `${month}_${year}_${type}`;
        salesData[year][month] = report?.[key] as number | null ?? null;
      });
    });
    return salesData;
  };

  const fetchVentasMensuales = async () => {
    if (!ruc) {
      setError("No se proporcionó un RUC en el dossier.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setVentasData(null);

    try {
      console.log(`[VentasMensualesSection] 🔍 Buscando datos para RUC via RPC: ${ruc}`);

      // Usar la nueva función de base de datos dedicada
      const { data, error: rpcError } = await supabase
        .rpc('get_ventas_mensuales_by_ruc', { ruc_input: ruc });

      console.log(`[VentasMensualesSection] 📊 Resultado de la RPC:`, { data, rpcError });

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.length > 0) {
        const record = data[0];
        console.log('[VentasMensualesSection] ✅ Datos encontrados. Procesando...');
        setVentasData(record);
        
        const proveedorData = extractSalesData(record, 'proveedor');
        setProveedorSalesData(proveedorData);
        
        if (record.deudor_ruc) {
          const deudorData = extractSalesData(record, 'deudor');
          setDeudorSalesData(deudorData);
        }
        console.log('[VentasMensualesSection] 🎉 Datos procesados exitosamente.');
      } else {
        console.log(`[VentasMensualesSection] ❌ No se encontraron registros para el RUC ${ruc}.`);
        setError('No se encontraron datos de ventas mensuales para este RUC.');
      }

    } catch (err: any) {
      console.error('[VentasMensualesSection] 💥 Error al cargar ventas mensuales:', err);
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentasMensuales();
  }, [ruc]);

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
            5. Ventas Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando datos de ventas mensuales...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !ventasData) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
            5. Ventas Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{error || 'No hay datos de ventas mensuales disponibles'}</p>
            <p className="text-gray-500 text-xs mt-2">
              Debug: RUC buscado = {ruc}
            </p>
            <Button 
              onClick={fetchVentasMensuales}
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              <Search className="h-4 w-4 mr-2" />
              Reintentar búsqueda
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
          5. Ventas Mensuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-medium">Análisis de Ventas Mensuales</h4>
              <p className="text-gray-400 text-sm">
                RUC Proveedor: {ventasData.proveedor_ruc}
                {ventasData.deudor_ruc && ` | RUC Deudor: ${ventasData.deudor_ruc}`}
              </p>
              <p className="text-gray-500 text-xs">
                Estado: {ventasData.status} | Actualizado: {new Date(ventasData.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                Ventas del Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VentasMensualesTable 
                data={proveedorSalesData} 
                onDataChange={() => {}}
              />
            </CardContent>
          </Card>

          {ventasData.deudor_ruc && Object.values(deudorSalesData).some(year => Object.values(year).some(month => month !== null)) && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                  Ventas del Deudor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VentasMensualesTable 
                  data={deudorSalesData} 
                  onDataChange={() => {}}
                />
              </CardContent>
            </Card>
          )}

          {ventasData.validado_por && (
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-400 text-sm">
                Validado por: <span className="text-white">{ventasData.validado_por}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasMensualesSection;