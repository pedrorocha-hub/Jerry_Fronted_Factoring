import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { AsyncCombobox, ComboboxOption } from '@/components/ui/async-combobox';
import { VentasStatus, getVentasStatusDisplay } from '@/types/ventasMensuales';

interface VentasStatusManagerProps {
  status: VentasStatus;
  validadoPor: string | null;
  creatorName: string | null;
  solicitudId: string | null;
  onStatusChange: (status: VentasStatus) => void;
  onValidatedByChange: (name: string | null) => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSolicitudIdChange: (solicitudId: string | null) => void;
  searchSolicitudes: (query: string) => Promise<ComboboxOption[]>;
  initialSolicitudLabel: string | null;
}

const VentasStatusManager: React.FC<VentasStatusManagerProps> = ({
  status,
  validadoPor,
  creatorName,
  solicitudId, // <-- Desestructurado
  onStatusChange,
  onValidatedByChange,
  onSave,
  isSaving,
  hasUnsavedChanges,
  onSolicitudIdChange,
  searchSolicitudes,
  initialSolicitudLabel,
}) => {
  const [localValidadoPor, setLocalValidadoPor] = useState(validadoPor || '');

  useEffect(() => {
    setLocalValidadoPor(validadoPor || '');
  }, [validadoPor]);

  const handleValidatedByChange = (value: string) => {
    setLocalValidadoPor(value);
    onValidatedByChange(value || null);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'en_revision':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completado':
        return 'text-green-400';
      case 'en_revision':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          {getStatusIcon()}
          <span className={`ml-2 ${getStatusColor()}`}>Estado del Reporte - {getVentasStatusDisplay(status)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-gray-300">Estado</Label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger id="status" className="bg-gray-900/50 border-gray-700 text-white">
                <SelectValue placeholder={getVentasStatusDisplay(status)} />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="borrador" className="text-white hover:bg-gray-800">
                  Borrador
                </SelectItem>
                <SelectItem value="en_revision" className="text-white hover:bg-gray-800">
                  En revision
                </SelectItem>
                <SelectItem value="completado" className="text-white hover:bg-gray-800">
                  Completado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validado-por" className="text-gray-300">Validado Por</Label>
            <Input
              id="validado-por"
              value={localValidadoPor}
              onChange={(e) => handleValidatedByChange(e.target.value)}
              placeholder="Nombre del validador"
              className="bg-gray-900/50 border-gray-700 text-white"
            />
          </div>
        </div>

<div className="space-y-2">
  <Label htmlFor="solicitud" className="text-gray-300">Solicitud de Operación</Label>
  <AsyncCombobox
    value={solicitudId}
    placeholder="Buscar solicitud..."
    onSearch={searchSolicitudes}
    onChange={onSolicitudIdChange}
    initialDisplayValue={initialSolicitudLabel}
  />
</div>

        {creatorName && (
          <div className="flex items-center text-sm text-gray-400">
            <User className="h-4 w-4 mr-2" />
            <span>Creado por: {creatorName}</span>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasStatusManager;