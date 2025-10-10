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
      setError("RUC del proveedor no disponible en el dossier.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Cargar fichas RUC
      const fichaPromises = [FichaRucService.getByRuc(ruc)];
      if (deudorRuc) {
        fichaPromises.push(FichaRucService.getByRuc(deudorRuc));
      }
      const [mainFicha, deudorFichaData] = await Promise.all(fichaPromises);
      setFicha(mainFicha);
      if (deudorFichaData) {
        setDeudorFicha(deudorFichaData);
      }

      // Intentar cargar desde ventas mensuales
      const ventasReporte = await VentasMensualesService.getByProveedorRuc(ruc);
      
      let providerHasData = false;
      let deudorHasData = false;

      if (ventasReporte) {
        setVentasReport(ventasReporte);
        
        // Extraer datos del proveedor
        const proveedorData = extractSalesData(ventasReporte, 'proveedor');
        if (hasDataInSalesData(proveedorData)) {
          setProveedorSalesData(proveedorData);
          providerHasData = true;
        }

        // Extraer datos del deudor si existe
        if (ventasReporte.deudor_ruc && deudorRuc) {
          const deudorData = extractSalesData(ventasReporte, 'deudor');
          if (hasDataInSalesData(deudorData)) {
            setDeudorSalesData(deudorData);
            deudorHasData = true;
          }
        }
      }

      // Si no hay datos del proveedor, buscar en reportes tributarios
      if (!providerHasData) {
        try {
          const reportesTributariosProveedor = await ReporteTributarioService.getReportesByRuc(ruc);
          if (reportesTributariosProveedor && reportesTributariosProveedor.length > 0) {
            const proveedorData = extractSalesDataFromReporteTributario(reportesTributariosProveedor);
            if (hasDataInSalesData(proveedorData)) {
              setProveedorSalesData(proveedorData);
              providerHasData = true;
            }
          }
        } catch (err) {
          console.warn('Error loading reporte tributario for proveedor:', err);
        }
      }

      // Si no hay datos del deudor y existe deudorRuc, buscar en reportes tributarios
      if (deudorRuc && !deudorHasData) {
        try {
          const reportesTributariosDeudor = await ReporteTributarioService.getReportesByRuc(deudorRuc);
          if (reportesTributariosDeudor && reportesTributariosDeudor.length > 0) {
            const deudorData = extractSalesDataFromReporteTributario(reportesTributariosDeudor);
            if (hasDataInSalesData(deudorData)) {
              setDeudorSalesData(deudorData);
              deudorHasData = true;
            }
          }
        } catch (err) {
          console.warn('Error loading reporte tributario for deudor:', err);
        }
      }

      // Si no había reporte de ventas pero sí datos, crear uno virtual
      if (!ventasReporte && (providerHasData || deudorHasData)) {
        setVentasReport({
          proveedor_ruc: ruc,
          deudor_ruc: deudorRuc || null,
          status: 'Autocompletado (No guardado)',
          updated_at: new Date().toISOString()
        });
      }

      // Si no hay datos de ningún tipo
      if (!providerHasData && !deudorHasData) {
        setError('No se encontraron datos de ventas mensuales ni reportes tributarios para este RUC.');
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
  }, [ruc, deudorRuc]);

  const hasProviderData = hasDataInSalesData(proveedorSalesData);
  const hasDeudorData = hasDataInSalesData(deudorSalesData);
  const hasData = hasProviderData || hasDeudorData;

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
            <p className="text-gray-500 text-xs mt-2">
              Debug: RUCs buscados = {ruc}{deudorRuc ? `, ${deudorRuc}` : ''} | 
              Proveedor: {hasProviderData ? 'Sí' : 'No'} | 
              Deudor: {hasDeudorData ? 'Sí' : 'No'}
            </p>
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
        <div className="space-y-8">
          {ventasReport && (
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
          )}

          {hasProviderData && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                <h3 className="text-white font-medium">Ventas del Proveedor: {ficha?.nombre_empresa || ruc}</h3>
              </div>
              <VentasMensualesTable data={proveedorSalesData} onDataChange={() => {}} />
            </div>
          )}

          {hasDeudorData && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-400" />
                <h3 className="text-white font-medium">Ventas del Deudor: {deudorFicha?.nombre_empresa || deudorRuc}</h3>
              </div>
              <VentasMensualesTable data={deudorSalesData} onDataChange={() => {}} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasMensualesSection;