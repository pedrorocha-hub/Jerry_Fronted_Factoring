import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DossierRib } from '@/types/dossier';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { VentasMensualesService } from '@/services/ventasMensualesService';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { SalesData } from '@/pages/VentasMensuales';
import CombinedVentasMensualesTable from '@/components/ventas-mensuales/CombinedVentasMensualesTable';

interface VentasMensualesSectionProps {
  dossier: DossierRib;
}

const VentasMensualesSection: React.FC<VentasMensualesSectionProps> = ({ dossier }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fichaProveedor, setFichaProveedor] = useState<FichaRuc | null>(null);
  const [fichaDeudor, setFichaDeudor] = useState<FichaRuc | null>(null);
  const [proveedorSalesData, setProveedorSalesData] = useState<SalesData>({});
  const [deudorSalesData, setDeudorSalesData] = useState<SalesData>({});

  const ruc = dossier.solicitudOperacion.ruc;
  const deudorRuc = dossier.solicitudOperacion.deudor;

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

  const hasDataInSalesData = (salesData: SalesData): boolean => {
    return Object.keys(salesData).length > 0 && 
           Object.values(salesData).some(year => 
             Object.values(year).some(v => v !== null && v !== undefined)
           );
  };

  const fetchData = async () => {
    if (!ruc) {
      setError("RUC del proveedor no disponible.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fichaProveedorData = await FichaRucService.getByRuc(ruc);
      setFichaProveedor(fichaProveedorData);

      if (deudorRuc) {
        const fichaDeudorData = await FichaRucService.getByRuc(deudorRuc);
        setFichaDeudor(fichaDeudorData);
      }

      const ventasReporte = await VentasMensualesService.getByProveedorRuc(ruc);
      
      let hasProveedorData = false;
      let hasDeudorData = false;

      if (ventasReporte) {
        const proveedorData = extractSalesData(ventasReporte, 'proveedor');
        if (hasDataInSalesData(proveedorData)) {
          setProveedorSalesData(proveedorData);
          hasProveedorData = true;
        }

        if (ventasReporte.deudor_ruc) {
          const deudorData = extractSalesData(ventasReporte, 'deudor');
          if (hasDataInSalesData(deudorData)) {
            setDeudorSalesData(deudorData);
            hasDeudorData = true;
          }
        }
      }

      if (!hasProveedorData) {
        const reportesTributarios = await ReporteTributarioService.getReportesByRuc(ruc);
        if (reportesTributarios?.length > 0) {
          const proveedorData = extractSalesDataFromReporteTributario(reportesTributarios);
          if (hasDataInSalesData(proveedorData)) {
            setProveedorSalesData(proveedorData);
            hasProveedorData = true;
          }
        }
      }

      if (deudorRuc && !hasDeudorData) {
        const ventasReporteDeudor = await VentasMensualesService.getByProveedorRuc(deudorRuc);
        if (ventasReporteDeudor) {
          const deudorData = extractSalesData(ventasReporteDeudor, 'proveedor');
          if (hasDataInSalesData(deudorData)) {
            setDeudorSalesData(deudorData);
            hasDeudorData = true;
          }
        }

        if (!hasDeudorData) {
          const reportesTributariosDeudor = await ReporteTributarioService.getReportesByRuc(deudorRuc);
          if (reportesTributariosDeudor?.length > 0) {
            const deudorData = extractSalesDataFromReporteTributario(reportesTributariosDeudor);
            if (hasDataInSalesData(deudorData)) {
              setDeudorSalesData(deudorData);
              hasDeudorData = true;
            }
          }
        }
      }

      if (!hasProveedorData && !hasDeudorData) {
        setError('No se encontraron datos de ventas mensuales.');
      }

    } catch (err: any) {
      console.error('Error al cargar ventas mensuales:', err);
      setError(err.message || 'Error al cargar datos de ventas mensuales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ruc, deudorRuc]);

  const hasProveedorData = hasDataInSalesData(proveedorSalesData);
  const hasDeudorData = hasDataInSalesData(deudorSalesData);
  const hasAnyData = hasProveedorData || hasDeudorData;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
            5. Ventas Mensuales
          </h3>
        </div>
        <Card className="bg-[#121212] border border-gray-800">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando datos de ventas mensuales...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
          5. Ventas Mensuales
        </h3>
      </div>

      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            Comparativo de Ventas Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasAnyData ? (
            <CombinedVentasMensualesTable
              proveedorData={proveedorSalesData}
              deudorData={deudorSalesData}
              proveedorName={fichaProveedor?.nombre_empresa || ruc || 'Proveedor'}
              deudorName={deudorRuc ? (fichaDeudor?.nombre_empresa || deudorRuc) : 'Deudor'}
            />
          ) : (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <p>{error || 'No se encontraron datos de ventas mensuales para el proveedor o deudor.'}</p>
              <Button onClick={fetchData} variant="outline" size="sm" className="mt-4">
                <Search className="h-4 w-4 mr-2" />Reintentar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VentasMensualesSection;