import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, FileText, Calendar, DollarSign, Building2, Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ReporteTributarioWithFicha, ReporteTributarioUpdate } from '@/types/reporte-tributario';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface ReporteTributarioModalProps {
  reporte: ReporteTributarioWithFicha | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const ReporteTributarioModal: React.FC<ReporteTributarioModalProps> = ({
  reporte,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<ReporteTributarioUpdate>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reporte) {
      setFormData({
        anio_reporte: reporte.anio_reporte,
        ingresos_netos: reporte.ingresos_netos || 0,
        costo_ventas: reporte.costo_ventas || 0,
        gastos_operativos: reporte.gastos_operativos || 0,
        utilidad_bruta: reporte.utilidad_bruta || 0,
        utilidad_operativa: reporte.utilidad_operativa || 0,
        utilidad_neta: reporte.utilidad_neta || 0,
        activo_total: reporte.activo_total || 0,
        pasivo_total: reporte.pasivo_total || 0,
        patrimonio_total: reporte.patrimonio_total || 0,
        ratio_endeudamiento: reporte.ratio_endeudamiento || 0,
        ratio_liquidez: reporte.ratio_liquidez || 0
      });
    }
    setMode(initialMode);
  }, [reporte, initialMode]);

  const handleInputChange = (field: keyof ReporteTributarioUpdate, value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: numericValue
      };

      // Calcular automáticamente algunos campos
      if (field === 'ingresos_netos' || field === 'costo_ventas') {
        const ingresos = field === 'ingresos_netos' ? numericValue : (prev.ingresos_netos || 0);
        const costos = field === 'costo_ventas' ? numericValue : (prev.costo_ventas || 0);
        newData.utilidad_bruta = ingresos - costos;
      }

      if (field === 'utilidad_bruta' || field === 'gastos_operativos') {
        const utilidadBruta = field === 'utilidad_bruta' ? numericValue : (prev.utilidad_bruta || 0);
        const gastos = field === 'gastos_operativos' ? numericValue : (prev.gastos_operativos || 0);
        newData.utilidad_operativa = utilidadBruta - gastos;
      }

      if (field === 'activo_total' || field === 'pasivo_total') {
        const activos = field === 'activo_total' ? numericValue : (prev.activo_total || 0);
        const pasivos = field === 'pasivo_total' ? numericValue : (prev.pasivo_total || 0);
        newData.patrimonio_total = activos - pasivos;
        
        if (activos > 0) {
          newData.ratio_endeudamiento = pasivos / activos;
        }
      }

      return newData;
    });
  };

  const handleSave = async () => {
    if (!reporte) return;

    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);

    try {
      await ReporteTributarioService.update(reporte.id, formData);
      dismissToast(loadingToast);
      showSuccess('Reporte tributario actualizado exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error actualizando reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatPercentage = (ratio?: number) => {
    if (!ratio) return '0.00%';
    return `${(ratio * 100).toFixed(2)}%`;
  };

  const getMargenNeto = () => {
    const ingresos = formData.ingresos_netos || reporte?.ingresos_netos || 0;
    const utilidadNeta = formData.utilidad_neta || reporte?.utilidad_neta || 0;
    if (ingresos === 0) return 0;
    return (utilidadNeta / ingresos) * 100;
  };

  if (!reporte) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <span className="text-xl font-bold">
                  {mode === 'view' ? 'Ver' : 'Editar'} Reporte Tributario
                </span>
                <div className="text-sm text-gray-500">
                  {reporte.ficha_ruc?.nombre_empresa} - {reporte.anio_reporte}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('edit')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('view')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Información General
            </h3>

            <div>
              <Label>Empresa</Label>
              <div className="mt-1 p-3 bg-blue-50 rounded-md">
                <div className="font-medium text-blue-900">
                  {reporte.ficha_ruc?.nombre_empresa || 'N/A'}
                </div>
                <div className="text-sm text-blue-700 font-mono">
                  RUC: {reporte.ficha_ruc?.ruc || 'N/A'}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="anio_reporte">Año del Reporte</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">{reporte.anio_reporte}</span>
                </div>
              ) : (
                <Input
                  id="anio_reporte"
                  type="number"
                  value={formData.anio_reporte || ''}
                  onChange={(e) => handleInputChange('anio_reporte', parseInt(e.target.value) || 0)}
                  placeholder="2024"
                />
              )}
            </div>

            {/* Ratios Calculados */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Calculator className="h-4 w-4 mr-2 text-gray-400" />
                Ratios Calculados
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Margen Neto:</span>
                  <span className={`text-sm font-medium ${
                    getMargenNeto() >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {getMargenNeto().toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Endeudamiento:</span>
                  <span className="text-sm font-medium">
                    {formatPercentage(formData.ratio_endeudamiento || reporte.ratio_endeudamiento)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Liquidez:</span>
                  <span className="text-sm font-medium">
                    {(formData.ratio_liquidez || reporte.ratio_liquidez || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de Resultados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Estado de Resultados
            </h3>

            <div>
              <Label htmlFor="ingresos_netos">Ingresos Netos</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-green-600">
                    {formatCurrency(reporte.ingresos_netos)}
                  </span>
                </div>
              ) : (
                <Input
                  id="ingresos_netos"
                  type="number"
                  step="0.01"
                  value={formData.ingresos_netos || ''}
                  onChange={(e) => handleInputChange('ingresos_netos', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="costo_ventas">Costo de Ventas</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span>{formatCurrency(reporte.costo_ventas)}</span>
                </div>
              ) : (
                <Input
                  id="costo_ventas"
                  type="number"
                  step="0.01"
                  value={formData.costo_ventas || ''}
                  onChange={(e) => handleInputChange('costo_ventas', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="utilidad_bruta">Utilidad Bruta</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className={`font-medium ${
                    (reporte.utilidad_bruta || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(reporte.utilidad_bruta)}
                  </span>
                </div>
              ) : (
                <Input
                  id="utilidad_bruta"
                  type="number"
                  step="0.01"
                  value={formData.utilidad_bruta || ''}
                  onChange={(e) => handleInputChange('utilidad_bruta', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="gastos_operativos">Gastos Operativos</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span>{formatCurrency(reporte.gastos_operativos)}</span>
                </div>
              ) : (
                <Input
                  id="gastos_operativos"
                  type="number"
                  step="0.01"
                  value={formData.gastos_operativos || ''}
                  onChange={(e) => handleInputChange('gastos_operativos', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="utilidad_operativa">Utilidad Operativa</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className={`font-medium ${
                    (reporte.utilidad_operativa || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(reporte.utilidad_operativa)}
                  </span>
                </div>
              ) : (
                <Input
                  id="utilidad_operativa"
                  type="number"
                  step="0.01"
                  value={formData.utilidad_operativa || ''}
                  onChange={(e) => handleInputChange('utilidad_operativa', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="utilidad_neta">Utilidad Neta</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className={`font-medium ${
                    (reporte.utilidad_neta || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(reporte.utilidad_neta)}
                  </span>
                </div>
              ) : (
                <Input
                  id="utilidad_neta"
                  type="number"
                  step="0.01"
                  value={formData.utilidad_neta || ''}
                  onChange={(e) => handleInputChange('utilidad_neta', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>
          </div>

          {/* Balance General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Balance General
            </h3>

            <div>
              <Label htmlFor="activo_total">Activo Total</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-blue-600">
                    {formatCurrency(reporte.activo_total)}
                  </span>
                </div>
              ) : (
                <Input
                  id="activo_total"
                  type="number"
                  step="0.01"
                  value={formData.activo_total || ''}
                  onChange={(e) => handleInputChange('activo_total', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="pasivo_total">Pasivo Total</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-red-600">
                    {formatCurrency(reporte.pasivo_total)}
                  </span>
                </div>
              ) : (
                <Input
                  id="pasivo_total"
                  type="number"
                  step="0.01"
                  value={formData.pasivo_total || ''}
                  onChange={(e) => handleInputChange('pasivo_total', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="patrimonio_total">Patrimonio Total</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-green-600">
                    {formatCurrency(reporte.patrimonio_total)}
                  </span>
                </div>
              ) : (
                <Input
                  id="patrimonio_total"
                  type="number"
                  step="0.01"
                  value={formData.patrimonio_total || ''}
                  onChange={(e) => handleInputChange('patrimonio_total', e.target.value)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div>
              <Label htmlFor="ratio_endeudamiento">Ratio de Endeudamiento</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span>{formatPercentage(reporte.ratio_endeudamiento)}</span>
                </div>
              ) : (
                <Input
                  id="ratio_endeudamiento"
                  type="number"
                  step="0.0001"
                  value={formData.ratio_endeudamiento || ''}
                  onChange={(e) => handleInputChange('ratio_endeudamiento', e.target.value)}
                  placeholder="0.0000"
                />
              )}
            </div>

            <div>
              <Label htmlFor="ratio_liquidez">Ratio de Liquidez</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span>{(reporte.ratio_liquidez || 0).toFixed(4)}</span>
                </div>
              ) : (
                <Input
                  id="ratio_liquidez"
                  type="number"
                  step="0.0001"
                  value={formData.ratio_liquidez || ''}
                  onChange={(e) => handleInputChange('ratio_liquidez', e.target.value)}
                  placeholder="0.0000"
                />
              )}
            </div>

            {/* Información de Auditoría */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información de Registro</h4>
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  <strong>Creado:</strong> {new Date(reporte.created_at).toLocaleString('es-ES')}
                </div>
                <div>
                  <strong>Actualizado:</strong> {new Date(reporte.updated_at).toLocaleString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReporteTributarioModal;