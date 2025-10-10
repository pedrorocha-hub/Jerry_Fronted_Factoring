import React, { useEffect, useState } from 'react';
import { TrendingUp, Building2, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DossierRib } from '@/types/dossier';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesService } from '@/services/ventasMensualesService';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import VentasMensualesTable from '@/components/ventas-mensuales/VentasMensualesTable';
import { SalesData } from '@/pages/VentasMensuales';

interface VentasMensualesSectionProps {
  dossier: DossierRib;
}

const VentasMensualesSection: React.FC<VentasMensualesSectionProps> = ({ dossier }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ficha, setFicha] = useState<FichaRuc | null>(null);
  const [deudorFicha, setDeudorFicha] = useState<FichaRuc | null>(null);
  const [proveedorSalesData, setProveedorSalesData] = useState<SalesData>({});
  const [deudorSalesData, setDeudorSalesData] = useState<SalesData>({});
  const [ventasReport, setVentasReport] = useState<any>(null);

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

  const extractSalesDataFromReporteTributario = (reportes: any[]): SalesData => {
    const salesData: SalesData = {};
    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    years.forEach(year => {
      salesData[year] = {};
      months.forEach(month => {
        salesData[year][month] = null;
      });
    });

    reportes.forEach(reporte => {
      const year = reporte.anio_reporte;
      if (salesData[year]) {
        months.forEach(month => {
          const ingresosKey = `ingresos_${month}`;
          if (reporte[ingresosKey] !== null && reporte[ingresosKey] !== undefined) {
            const value = Number(reporte[ingresosKey]);
            if (!isNaN(value)) {
              salesData[year][month] = value;
            }
          }
        });
      }
    });
    return salesData;
  };

  const fetchData = async () => {
    if (!ruc) {
      setError("RUC no disponible en el dossier.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mainFicha = await FichaRucService.getByRuc(ruc);
      setFicha(mainFicha);

      const ventasReporte = await VentasMensualesService.getByProveedorRuc(ruc);
      
      if (ventasReporte) {
        setVentasReport(ventasReporte);
        setProveedorSalesData(extractSalesData(ventasReporte, 'proveedor'));

        if (ventasReporte.deudor_ruc) {
          const deudorFichaData = await FichaRucService.getByRuc(ventasReporte.deudor_ruc);
          setDeudorFicha(deudorFichaData);
          setDeudorSalesData(extractSalesData(ventasReporte, 'deudor'));
        }
      } else {
        const reportesTributarios = await ReporteTributarioService.getReportesByRuc(ruc);
        
        if (reportesTributarios && reportesTributarios.length > 0) {
          const initialSalesData = extractSalesDataFromReporteTributario(reportesTributarios);
          setProveedorSalesData(initialSalesData);
          setVentasReport({
            proveedor_ruc: ruc,
            status: 'Autocompletado (No guardado)',
            updated_at: new Date().toISOString()
          });
        } else {
          setError('No se encontraron datos de ventas mensuales ni reportes tributarios para este RUC.');
        }
      }
    } catch (err: any) {
      console.error('[VMS] Error fetching data:', err);
      setError(err.message || 'Ocurrió un error al buscar la información.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ruc]);

  const hasData = Object.keys(proveedorSalesData).length > 0 && Object.values(proveedorSalesData).some(year => Object.values(year).some(v => v !== null));

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader><CardTitle className="text-white flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />5. Ventas Mensuales</CardTitle></CardHeader>
        <CardContent><div className="text-center py-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80] mx-auto mb-4"></div><p className="text-gray-400">Cargando datos de ventas mensuales...</p></div></CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader><CardTitle className="text-white flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />5. Ventas Mensuales</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{error || 'No hay datos de ventas mensuales disponibles'}</p>
            <p className="text-gray-500 text-xs mt-2">Debug: RUC buscado = {ruc}</p>
            <Button onClick={fetchData} variant="outline" size="sm" className="mt-4"><Search className="h-4 w-4 mr-2" />Reintentar búsqueda</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />5. Ventas Mensuales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-medium">{ficha?.nombre_empresa || `Análisis para RUC ${ruc}`}</h4>
              <p className="text-gray-400 text-sm">
                RUC Proveedor: {ventasReport.proveedor_ruc}
                {deudorFicha && ` | RUC Deudor: ${deudorFicha.ruc}`}
              </p>
              <p className="text-gray-500 text-xs">
                Estado: {ventasReport.status} | Actualizado: {new Date(ventasReport.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader><CardTitle className="flex items-center text-white"><Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />Ventas del Proveedor</CardTitle></CardHeader>
            <CardContent><VentasMensualesTable data={proveedorSalesData} onDataChange={() => {}} /></CardContent>
          </Card>

          {deudorFicha && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="flex items-center text-white"><Building2 className="h-5 w-5 mr-2 text-blue-400" />Ventas del Deudor: {deudorFicha.nombre_empresa}</CardTitle></CardHeader>
              <CardContent><VentasMensualesTable data={deudorSalesData} onDataChange={() => {}} /></CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasMensualesSection;