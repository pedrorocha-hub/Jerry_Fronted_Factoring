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

// Componente para las ventas del proveedor
const ProveedorVentasCard: React.FC<{ ruc: string }> = ({ ruc }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ficha, setFicha] = useState<FichaRuc | null>(null);
  const [salesData, setSalesData] = useState<SalesData>({});

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
      const fichaData = await FichaRucService.getByRuc(ruc);
      setFicha(fichaData);

      const ventasReporte = await VentasMensualesService.getByProveedorRuc(ruc);
      
      let hasData = false;

      if (ventasReporte) {
        const proveedorData = extractSalesData(ventasReporte, 'proveedor');
        if (hasDataInSalesData(proveedorData)) {
          setSalesData(proveedorData);
          hasData = true;
        }
      }

      if (!hasData) {
        const reportesTributarios = await ReporteTributarioService.getReportesByRuc(ruc);
        if (reportesTributarios?.length > 0) {
          const proveedorData = extractSalesDataFromReporteTributario(reportesTributarios);
          if (hasDataInSalesData(proveedorData)) {
            setSalesData(proveedorData);
            hasData = true;
          }
        }
      }

      if (!hasData) {
        setError('No se encontraron datos de ventas mensuales para el proveedor.');
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del proveedor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ruc]);

  const hasData = hasDataInSalesData(salesData);

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
            Ventas del Proveedor: {ruc}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando datos del proveedor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
          Ventas del Proveedor: {ficha?.nombre_empresa || ruc}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <VentasMensualesTable data={salesData} onDataChange={() => {}} />
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p>{error || 'No se encontraron datos de ventas para el proveedor.'}</p>
            <Button onClick={fetchData} variant="outline" size="sm" className="mt-4">
              <Search className="h-4 w-4 mr-2" />Reintentar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para las ventas del deudor
const DeudorVentasCard: React.FC<{ ruc: string; proveedorRuc: string }> = ({ ruc, proveedorRuc }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ficha, setFicha] = useState<FichaRuc | null>(null);
  const [salesData, setSalesData] = useState<SalesData>({});

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
      setError("RUC del deudor no disponible.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fichaData = await FichaRucService.getByRuc(ruc);
      setFicha(fichaData);

      let hasData = false;

      // Lógica corregida:
      // 1. Buscar el reporte de ventas del PROVEEDOR.
      const ventasReportePrincipal = await VentasMensualesService.getByProveedorRuc(proveedorRuc);
      
      // 2. Si existe y el deudor coincide, extraer los datos del deudor de ESE reporte.
      if (ventasReportePrincipal && ventasReportePrincipal.deudor_ruc === ruc) {
        const deudorData = extractSalesData(ventasReportePrincipal, 'deudor');
        if (hasDataInSalesData(deudorData)) {
          setSalesData(deudorData);
          hasData = true;
        }
      }

      // 3. Si no se encontraron datos, buscar si el deudor tiene su propio reporte de ventas (como proveedor).
      if (!hasData) {
        const ventasReporteDeudor = await VentasMensualesService.getByProveedorRuc(ruc);
        if (ventasReporteDeudor) {
          const deudorData = extractSalesData(ventasReporteDeudor, 'proveedor');
          if (hasDataInSalesData(deudorData)) {
            setSalesData(deudorData);
            hasData = true;
          }
        }
      }

      // 4. Como último recurso, buscar en los reportes tributarios del deudor.
      if (!hasData) {
        const reportesTributarios = await ReporteTributarioService.getReportesByRuc(ruc);
        if (reportesTributarios?.length > 0) {
          const deudorData = extractSalesDataFromReporteTributario(reportesTributarios);
          if (hasDataInSalesData(deudorData)) {
            setSalesData(deudorData);
            hasData = true;
          }
        }
      }

      if (!hasData) {
        setError('No se encontraron datos de ventas mensuales para el deudor.');
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del deudor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ruc, proveedorRuc]);

  const hasData = hasDataInSalesData(salesData);

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Building2 className="h-5 w-5 mr-2 text-blue-400" />
            Ventas del Deudor: {ruc}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando datos del deudor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Building2 className="h-5 w-5 mr-2 text-blue-400" />
          Ventas del Deudor: {ficha?.nombre_empresa || ruc}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <VentasMensualesTable data={salesData} onDataChange={() => {}} />
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p>{error || 'No se encontraron datos de ventas para el deudor.'}</p>
            <Button onClick={fetchData} variant="outline" size="sm" className="mt-4">
              <Search className="h-4 w-4 mr-2" />Reintentar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const VentasMensualesSection: React.FC<VentasMensualesSectionProps> = ({ dossier }) => {
  const ruc = dossier.solicitudOperacion.ruc;
  const deudorRuc = dossier.solicitudOperacion.deudor;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
          5. Ventas Mensuales
        </h3>
      </div>

      {/* Proveedor Card */}
      <ProveedorVentasCard ruc={ruc} />

      {/* Deudor Card (only if deudorRuc exists) */}
      {deudorRuc && (
        <DeudorVentasCard ruc={deudorRuc} proveedorRuc={ruc} />
      )}
    </div>
  );
};

export default VentasMensualesSection;