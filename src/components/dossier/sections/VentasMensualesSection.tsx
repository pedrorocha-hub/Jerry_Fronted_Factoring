// Componente para las ventas del deudor con lógica corregida y simplificada
const DeudorVentasCard: React.FC<{ ruc: string; proveedorRuc: string }> = ({ ruc, proveedorRuc }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ficha, setFicha] = useState<FichaRuc | null>(null);
  const [salesData, setSalesData] = useState<SalesData>({});

  const extractSalesData = (report: any | null): SalesData => {
    const salesData: SalesData = {};
    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    years.forEach(year => {
      salesData[year] = {};
      months.forEach(month => {
        const key = `${month}_${year}_deudor`;
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

      // Primero, intentar buscar en el reporte del proveedor
      if (proveedorRuc) {
        const ventasReporte = await VentasMensualesService.getByProveedorRuc(proveedorRuc);
        
        if (ventasReporte && ventasReporte.deudor_ruc === ruc) {
          const deudorData = extractSalesData(ventasReporte);
          if (hasDataInSalesData(deudorData)) {
            setSalesData(deudorData);
            hasData = true;
          }
        }
      }

      // Si no hay datos, intentar con el RUC del deudor directamente
      if (!hasData) {
        const ventasReporteDeudor = await VentasMensualesService.getByProveedorRuc(ruc);
        if (ventasReporteDeudor) {
          const deudorData = extractSalesData(ventasReporteDeudor);
          if (hasDataInSalesData(deudorData)) {
            setSalesData(deudorData);
            hasData = true;
          }
        }
      }

      // Si aún no hay datos, buscar en reportes tributarios
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