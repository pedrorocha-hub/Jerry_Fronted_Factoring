import React, { useEffect, useState } from 'react';
import { TrendingUp, Building2, AlertCircle, Search, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DossierRib } from '@/types/dossier';
import { VentasMensualesService, VentasMensualesData } from '@/services/ventasMensualesService';

interface VentasMensualesSectionProps {
  dossier: DossierRib;
}

const VentasMensualesSection: React.FC<VentasMensualesSectionProps> = ({ dossier }) => {
  const [ventasData, setVentasData] = useState<VentasMensualesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ruc = dossier.solicitudOperacion.ruc;
  const nombreEmpresa = dossier.fichaRuc?.nombre_empresa || 'Empresa no identificada';

  const fetchVentasMensuales = async () => {
    if (!ruc) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Buscando ventas mensuales para RUC:', ruc);
      
      const ventasReporte = await VentasMensualesService.getByProveedorRuc(ruc);
      
      console.log('📊 Resultado del servicio:', ventasReporte);

      if (ventasReporte) {
        setVentasData(ventasReporte);
        console.log('✅ Datos de ventas mensuales encontrados');
      } else {
        console.log('ℹ️ No se encontraron datos específicos de ventas mensuales');
        setError('No se encontraron datos de ventas mensuales para este RUC');
      }

    } catch (err) {
      console.error('💥 Error al cargar ventas mensuales:', err);
      setError('Error al cargar datos de ventas mensuales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentasMensuales();
  }, [ruc]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || amount === 0) return 'S/ 0';
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'PEN', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getMonthlyData = (data: VentasMensualesData, year: number, type: 'proveedor' | 'deudor') => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
    return months.map(month => {
      const key = `${month}_${year}_${type}` as keyof VentasMensualesData;
      return {
        month,
        value: data[key] as number || 0
      };
    });
  };

  const calculateYearTotal = (monthlyData: { month: string; value: number }[]) => {
    return monthlyData.reduce((total, month) => total + month.value, 0);
  };

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

  // Si no hay datos específicos, mostrar información básica
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
          <div className="space-y-4">
            {/* Información básica de la empresa */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-medium flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-[#00FF80]" />
                    {nombreEmpresa}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">RUC: {ruc}</p>
                </div>
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Sin datos específicos
                </Badge>
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="text-center py-6">
              <Info className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No se encontraron datos específicos de ventas mensuales</p>
              <p className="text-gray-500 text-sm">
                Los datos de ventas mensuales no están disponibles para este RUC en el sistema.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                RUC consultado: {ruc}
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

            {/* Información sobre qué datos se necesitarían */}
            <div className="border border-gray-800 rounded-lg p-4">
              <h5 className="text-white text-sm font-medium mb-2">Datos que se mostrarían si estuvieran disponibles:</h5>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• Ventas mensuales del proveedor (2023-2025)</li>
                <li>• Ventas mensuales del deudor (si aplica)</li>
                <li>• Totales anuales y comparativos</li>
                <li>• Estado de validación</li>
                <li>• Información del validador</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay datos, mostrar la información completa
  const proveedor2023 = getMonthlyData(ventasData, 2023, 'proveedor');
  const proveedor2024 = getMonthlyData(ventasData, 2024, 'proveedor');
  const deudor2023 = ventasData.deudor_ruc ? getMonthlyData(ventasData, 2023, 'deudor') : null;
  const deudor2024 = ventasData.deudor_ruc ? getMonthlyData(ventasData, 2024, 'deudor') : null;

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
          {/* Header con información general */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">{nombreEmpresa}</h4>
              <p className="text-gray-400 text-sm">
                RUC Proveedor: {ventasData.proveedor_ruc}
                {ventasData.deudor_ruc && ` | RUC Deudor: ${ventasData.deudor_ruc}`}
              </p>
            </div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              {ventasData.status}
            </Badge>
          </div>

          {/* Ventas del Proveedor */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold border-b border-gray-800 pb-2">
              Ventas del Proveedor
            </h3>
            
            {/* 2023 */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Año 2023</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {proveedor2023.map((month, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-gray-400 text-xs capitalize">{month.month}</p>
                    <p className="text-white text-sm font-mono">{formatCurrency(month.value)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total 2023:</span>
                  <span className="text-[#00FF80] font-bold">{formatCurrency(calculateYearTotal(proveedor2023))}</span>
                </div>
              </div>
            </div>

            {/* 2024 */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Año 2024</h4>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {proveedor2024.map((month, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-gray-400 text-xs capitalize">{month.month}</p>
                    <p className="text-white text-sm font-mono">{formatCurrency(month.value)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total 2024:</span>
                  <span className="text-[#00FF80] font-bold">{formatCurrency(calculateYearTotal(proveedor2024))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ventas del Deudor (si existen) */}
          {deudor2023 && deudor2024 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold border-b border-gray-800 pb-2">
                Ventas del Deudor
              </h3>
              
              {/* 2023 Deudor */}
              <div className="bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Año 2023</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {deudor2023.map((month, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-gray-400 text-xs capitalize">{month.month}</p>
                      <p className="text-white text-sm font-mono">{formatCurrency(month.value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total 2023:</span>
                    <span className="text-blue-400 font-bold">{formatCurrency(calculateYearTotal(deudor2023))}</span>
                  </div>
                </div>
              </div>

              {/* 2024 Deudor */}
              <div className="bg-blue-900/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Año 2024</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {deudor2024.map((month, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-gray-400 text-xs capitalize">{month.month}</p>
                      <p className="text-white text-sm font-mono">{formatCurrency(month.value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total 2024:</span>
                    <span className="text-blue-400 font-bold">{formatCurrency(calculateYearTotal(deudor2024))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="border-t border-gray-800 pt-4 text-sm text-gray-400">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span>Estado: </span>
                <span className="text-white">{ventasData.status}</span>
              </div>
              <div>
                <span>Última actualización: </span>
                <span className="text-white">{new Date(ventasData.updated_at).toLocaleDateString()}</span>
              </div>
              {ventasData.validado_por && (
                <div className="col-span-2">
                  <span>Validado por: </span>
                  <span className="text-white">{ventasData.validado_por}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasMensualesSection;