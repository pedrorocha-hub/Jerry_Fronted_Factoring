import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DossierRib } from '@/types/dossier';

interface ComportamientoCrediticioSectionProps {
  dossier: DossierRib;
}

const ComportamientoCrediticioSection: React.FC<ComportamientoCrediticioSectionProps> = ({ dossier }) => {
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
          <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
          3. Comportamiento Crediticio
        </CardTitle>
        <Badge variant="outline" className={getStatusColor(dossier.comportamientoCrediticio.status)}>
          {dossier.comportamientoCrediticio.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Proveedor - Equifax</h4>
            <div>
              <Label className="text-gray-400">Calificación</Label>
              <p className="text-white">{dossier.comportamientoCrediticio.equifax_calificacion || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-400">Score</Label>
              <p className="text-white">{dossier.comportamientoCrediticio.equifax_score || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-400">Deuda Directa</Label>
              <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_directa)}</p>
            </div>
            <div>
              <Label className="text-gray-400">Deuda Indirecta</Label>
              <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_indirecta)}</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-medium">Proveedor - Sentinel</h4>
            <div>
              <Label className="text-gray-400">Calificación</Label>
              <p className="text-white">{dossier.comportamientoCrediticio.sentinel_calificacion || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-400">Score</Label>
              <p className="text-white">{dossier.comportamientoCrediticio.sentinel_score || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-gray-400">Deuda Directa</Label>
              <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_directa)}</p>
            </div>
            <div>
              <Label className="text-gray-400">Deuda Indirecta</Label>
              <p className="text-white font-mono">{formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_indirecta)}</p>
            </div>
          </div>
        </div>
        
        {/* Información del Deudor si existe */}
        {dossier.comportamientoCrediticio.deudor && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <h4 className="text-white font-medium mb-4">Información del Deudor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400">Deudor</Label>
                  <p className="text-white">{dossier.comportamientoCrediticio.deudor}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Calificación Equifax</Label>
                  <p className="text-white">{dossier.comportamientoCrediticio.deudor_equifax_calificacion || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Score Equifax</Label>
                  <p className="text-white">{dossier.comportamientoCrediticio.deudor_equifax_score || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400">Calificación Sentinel</Label>
                  <p className="text-white">{dossier.comportamientoCrediticio.deudor_sentinel_calificacion || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Score Sentinel</Label>
                  <p className="text-white">{dossier.comportamientoCrediticio.deudor_sentinel_score || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComportamientoCrediticioSection;