import React from 'react';
import { BarChart3 } from 'lucide-react';
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

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-[#00FF80]" />
          5. Ventas Mensuales
        </CardTitle>
        <Badge variant="outline" className={getStatusColor(dossier.ventasMensuales.status)}>
          {dossier.ventasMensuales.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Ventas del Proveedor */}
          <div>
            <h4 className="text-white font-medium mb-4">Ventas del Proveedor</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { mes: 'Enero 2024', valor: dossier.ventasMensuales.enero_2024_proveedor },
                { mes: 'Febrero 2024', valor: dossier.ventasMensuales.febrero_2024_proveedor },
                { mes: 'Marzo 2024', valor: dossier.ventasMensuales.marzo_2024_proveedor },
                { mes: 'Abril 2024', valor: dossier.ventasMensuales.abril_2024_proveedor },
                { mes: 'Mayo 2024', valor: dossier.ventasMensuales.mayo_2024_proveedor },
                { mes: 'Junio 2024', valor: dossier.ventasMensuales.junio_2024_proveedor }
              ].map((item, index) => (
                <div key={index}>
                  <Label className="text-gray-400 text-xs">{item.mes}</Label>
                  <p className="text-white font-mono text-sm">{formatCurrency(item.valor)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ventas del Deudor si existen */}
          {dossier.ventasMensuales.deudor_ruc && (
            <div className="pt-6 border-t border-gray-800">
              <h4 className="text-white font-medium mb-4">Ventas del Deudor</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { mes: 'Enero 2024', valor: dossier.ventasMensuales.enero_2024_deudor },
                  { mes: 'Febrero 2024', valor: dossier.ventasMensuales.febrero_2024_deudor },
                  { mes: 'Marzo 2024', valor: dossier.ventasMensuales.marzo_2024_deudor },
                  { mes: 'Abril 2024', valor: dossier.ventasMensuales.abril_2024_deudor },
                  { mes: 'Mayo 2024', valor: dossier.ventasMensuales.mayo_2024_deudor },
                  { mes: 'Junio 2024', valor: dossier.ventasMensuales.junio_2024_deudor }
                ].map((item, index) => (
                  <div key={index}>
                    <Label className="text-gray-400 text-xs">{item.mes}</Label>
                    <p className="text-white font-mono text-sm">{formatCurrency(item.valor)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasMensualesSection;