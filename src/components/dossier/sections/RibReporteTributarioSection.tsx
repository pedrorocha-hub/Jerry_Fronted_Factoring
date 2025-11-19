import React from 'react';
import { ClipboardEdit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DossierRib } from '@/types/dossier';

interface RibReporteTributarioSectionProps {
  dossier: DossierRib;
}

const RibReporteTributarioSection: React.FC<RibReporteTributarioSectionProps> = ({ dossier }) => {
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
          <ClipboardEdit className="h-5 w-5 mr-2 text-[#00FF80]" />
          4. RIB - Reporte Tributario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {dossier.ribReporteTributario.map((reporte, index) => (
            <div key={index} className="border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">
                  Reporte {reporte.anio} - {reporte.tipo_entidad === 'proveedor' ? 'Proveedor' : 'Deudor'}
                </h4>
                <Badge variant="outline" className={getStatusColor(reporte.status)}>
                  {reporte.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-400">Total Activos</Label>
                  <p className="text-white font-mono">{formatCurrency(reporte.total_activos)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Total Pasivos</Label>
                  <p className="text-white font-mono">{formatCurrency(reporte.total_pasivos)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Total Patrimonio</Label>
                  <p className="text-white font-mono">{formatCurrency(reporte.total_patrimonio)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Ingreso Ventas</Label>
                  <p className="text-white font-mono">{formatCurrency(reporte.ingreso_ventas)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Utilidad Bruta</Label>
                  <p className="text-white font-mono">{formatCurrency(reporte.utilidad_bruta)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Solvencia</Label>
                  <p className="text-white font-mono">{reporte.solvencia || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RibReporteTributarioSection;