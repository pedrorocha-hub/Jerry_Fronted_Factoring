import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VentasMensuales, VentasStatus } from '@/types/ventasMensuales';
import { Loader2, Save, AlertTriangle, User, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VentasStatusManagerProps {
  report: VentasMensuales;
  creatorName: string | null;
  onStatusChange: (newStatus: VentasStatus) => void;
  onValidatedByChange: (name: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const VentasStatusManager: React.FC<VentasStatusManagerProps> = ({ report, creatorName, onStatusChange, onValidatedByChange, onSave, isSaving, hasUnsavedChanges }) => {
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('es-ES');

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Completar datos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasUnsavedChanges && (
          <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Tienes cambios sin guardar en la solicitud.</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Estado de solicitud</label>
            <Select value={report.status || 'Borrador'} onValueChange={(value: VentasStatus) => onStatusChange(value)}>
              <SelectTrigger className="w-full bg-gray-900/50 border-gray-700">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Borrador">Borrador</SelectItem>
                <SelectItem value="En revisión">En revisión</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <strong>Creado por:</strong><span className="ml-2">{creatorName || 'Sistema'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <strong>Fecha de creación:</strong><span className="ml-2">{formatDate(report.created_at)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <strong>Última modificación:</strong><span className="ml-2">{formatDate(report.updated_at)}</span>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="validado_por" className="text-sm font-medium text-gray-400 mb-2 block">Validado por</Label>
          <Input
            id="validado_por"
            value={report.validado_por || ''}
            onChange={(e) => onValidatedByChange(e.target.value)}
            className="bg-gray-900/50 border-gray-700"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={!hasUnsavedChanges || isSaving} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Actualizar Solicitud
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasStatusManager;