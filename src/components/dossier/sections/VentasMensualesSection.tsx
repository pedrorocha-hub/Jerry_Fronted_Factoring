import React from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DossierRib } from '@/types/dossier';

interface VentasMensualesSectionProps {
  dossier: DossierRib;
}

const VentasMensualesSection: React.FC<VentasMensualesSectionProps> = ({ dossier }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Borrador':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'PEN', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(num);
  };

  const ventasData = dossier.ventasMensuales;

  if (!ventasData) {
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
            <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay datos de ventas mensuales disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Datos de ventas por año para el proveedor
  const ventas2023Proveedor = [
    { mes: 'Enero', valor: ventasData.enero_2023_proveedor },
    { mes: 'Febrero', valor: ventasData.febrero_2023_proveedor },
    { mes: 'Marzo', valor: ventasData.marzo_2023_proveedor },
    { mes: 'Abril', valor: ventasData.abril_2023_proveedor },
    { mes: 'Mayo', valor: ventasData.mayo_2023_proveedor },
    { mes: 'Junio', valor: ventasData.junio_2023_proveedor },
    { mes: 'Julio', valor: ventasData.julio_2023_proveedor },
    { mes: 'Agosto', valor: ventasData.agosto_2023_proveedor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2023_proveedor },
    { mes: 'Octubre', valor: ventasData.octubre_2023_proveedor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2023_proveedor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2023_proveedor }
  ];

  const ventas2024Proveedor = [
    { mes: 'Enero', valor: ventasData.enero_2024_proveedor },
    { mes: 'Febrero', valor: ventasData.febrero_2024_proveedor },
    { mes: 'Marzo', valor: ventasData.marzo_2024_proveedor },
    { mes: 'Abril', valor: ventasData.abril_2024_proveedor },
    { mes: 'Mayo', valor: ventasData.mayo_2024_proveedor },
    { mes: 'Junio', valor: ventasData.junio_2024_proveedor },
    { mes: 'Julio', valor: ventasData.julio_2024_proveedor },
    { mes: 'Agosto', valor: ventasData.agosto_2024_proveedor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2024_proveedor },
    { mes: 'Octubre', valor: ventasData.octubre_2024_proveedor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2024_proveedor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2024_proveedor }
  ];

  // Datos de ventas del deudor si están disponibles
  const ventas2023Deudor = ventasData.deudor_ruc ? [
    { mes: 'Enero', valor: ventasData.enero_2023_deudor },
    { mes: 'Febrero', valor: ventasData.febrero_2023_deudor },
    { mes: 'Marzo', valor: ventasData.marzo_2023_deudor },
    { mes: 'Abril', valor: ventasData.abril_2023_deudor },
    { mes: 'Mayo', valor: ventasData.mayo_2023_deudor },
    { mes: 'Junio', valor: ventasData.junio_2023_deudor },
    { mes: 'Julio', valor: ventasData.julio_2023_deudor },
    { mes: 'Agosto', valor: ventasData.agosto_2023_deudor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2023_deudor },
    { mes: 'Octubre', valor: ventasData.octubre_2023_deudor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2023_deudor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2023_deudor }
  ] : null;

  const ventas2024Deudor = ventasData.deudor_ruc ? [
    { mes: 'Enero', valor: ventasData.enero_2024_deudor },
    { mes: 'Febrero', valor: ventasData.febrero_2024_deudor },
    { mes: 'Marzo', valor: ventasData.marzo_2024_deudor },
    { mes: 'Abril', valor: ventasData.abril_2024_deudor },
    { mes: 'Mayo', valor: ventasData.mayo_2024_deudor },
    { mes: 'Junio', valor: ventasData.junio_2024_deudor },
    { mes: 'Julio', valor: ventasData.julio_2024_deudor },
    { mes: 'Agosto', valor: ventasData.agosto_2024_deudor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2024_deudor },
    { mes: 'Octubre', valor: ventasData.octubre_2024_deudor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2024_deudor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2024_deudor }
  ] : null;

  const calcularTotal = (ventas: { mes: string; valor: any }[]) => {
    return ventas.reduce((total, venta) => {
      const valor = typeof venta.valor === 'string' ? parseFloat(venta.valor.replace(/,/g, '')) : venta.valor;
      return total + (isNaN(valor) || valor === null || valor === undefined ? 0 : valor);
    }, 0);
  };

  const renderVentasTable = (ventas: { mes: string; valor: any }[], titulo: string, año: string) => (
    <div className="border border-gray-800 rounded-lg p-4">
      <h4 className="text-white font-medium mb-4 flex items-center">
        <Calendar className="h-4 w-4 mr-2 text-[#00FF80]" />
        {titulo} - {año}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ventas.map((venta, index) => (
          <div key={index} className="bg-gray-800/30 rounded p-3">
            <Label className="text-gray-400 text-xs">{venta.mes}</Label>
            <p className="text-white font-mono text-sm">{formatCurrency(venta.valor)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <Label className="text-gray-400">Total {año}:</Label>
          <p className="text-[#00FF80] font-mono font-bold">{formatCurrency(calcularTotal(ventas))}</p>
        </div>
      </div>
    </div>
  );

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-medium">Análisis de Ventas Mensuales</h4>
              <p className="text-gray-400 text-sm">
                RUC Proveedor: {ventasData.proveedor_ruc}
                {ventasData.deudor_ruc && ` | RUC Deudor: ${ventasData.deudor_ruc}`}
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor(ventasData.status)}>
              {ventasData.status}
            </Badge>
          </div>

          {/* Ventas del Proveedor */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-2">
              Ventas del Proveedor
            </h3>
            {renderVentasTable(ventas2023Proveedor, "Ventas Proveedor", "2023")}
            {renderVentasTable(ventas2024Proveedor, "Ventas Proveedor", "2024")}
          </div>

          {/* Ventas del Deudor (si están disponibles) */}
          {ventas2023Deudor && ventas2024Deudor && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-2">
                Ventas del Deudor
              </h3>
              {renderVentasTable(ventas2023Deudor, "Ventas Deudor", "2023")}
              {renderVentasTable(ventas2024Deudor, "Ventas Deudor", "2024")}
            </div>
          )}

          {/* Información adicional */}
          {ventasData.validado_por && (
            <div className="border-t border-gray-800 pt-4">
              <Label className="text-gray-400">Validado por:</Label>
              <p className="text-white">{ventasData.validado_por}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasMensualesSection;