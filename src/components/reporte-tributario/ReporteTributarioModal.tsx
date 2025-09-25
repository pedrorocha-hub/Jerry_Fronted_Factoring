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
import { useSession } from '@/contexts/SessionContext';

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
  const { isAdmin } = useSession();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<ReporteTributarioUpdate>({});
  const [loading, setLoading] = useState(false);

  const isReadOnly = mode === 'view' || !isAdmin;

  useEffect(() => {
    if (reporte) {
      setFormData({
        año_reporte: reporte.año_reporte,
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
    if (!isAdmin) {
      showError('No tienes permisos para guardar cambios.');
      return;
    }
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
    if (amount === null || amount === undefined) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const formatPercentage = (ratio?: number) => {
    if (ratio === null || ratio === undefined) return '0.00%';
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#121212] border-gray-800 text-gray-300">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-[#00FF80]" />
              <div>
                <span className="text-xl font-bold text-white">
                  {isReadOnly ? 'Ver' : 'Editar'} Reporte Tributario
                </span>
                <div className="text-sm text-gray-400">
                  {reporte.ficha_ruc?.nombre_empresa} - {reporte.año_reporte}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && mode === 'view' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('edit')}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : isAdmin && mode === 'edit' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('view')}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              ) : null}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Información General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center text-white">
              <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
              Información General
            </h3>

            <div>
              <Label>Empresa</Label>
              <div className="mt-1 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <div className="font-medium text-blue-300">
                  {reporte.ficha_ruc?.nombre_empresa || 'N/A'}
                </div>
                <div className="text-sm text-blue-400 font-mono">
                  RUC: {reporte.ficha_ruc?.ruc || 'N/A'}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="año_reporte">Año del Reporte</Label>
              {isReadOnly ? (
                <div className="mt-1 p-3 bg-gray-900/50 border border-gray-800 rounded-md flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium text-white">{reporte.año_reporte}</span>
                </div>
              ) : (
                <Input
                  id="año_reporte"
                  type="number"
                  value={formData.año_reporte || ''}
                  onChange={(e) => handleInputChange('año_reporte', parseInt(e.target.value) || 0)}
                  placeholder="2024"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                />
              )}
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                <Calculator className="h-4 w-4 mr-2 text-gray-400" />
                Ratios Calculados
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Margen Neto:</span>
                  <span className={`text-sm font-medium ${
                    getMargenNeto() >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {getMargenNeto().toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Endeudamiento:</span>
                  <span className="text-sm font-medium text-white">
                    {formatPercentage(formData.ratio_endeudamiento || reporte.ratio_endeudamiento)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Liquidez:</span>
                  <span className="text-sm font-medium text-white">
                    {(formData.ratio_liquidez || reporte.ratio_liquidez || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de Resultados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center text-white">
              <DollarSign className="h-5 w-5 mr-2 text-green-400" />
              Estado de Resultados
            </h3>

            {[
              { id: 'ingresos_netos', label: 'Ingresos Netos', value: reporte.ingresos_netos },
              { id: 'costo_ventas', label: 'Costo de Ventas', value: reporte.costo_ventas },
              { id: 'utilidad_bruta', label: 'Utilidad Bruta', value: reporte.utilidad_bruta },
              { id: 'gastos_operativos', label: 'Gastos Operativos', value: reporte.gastos_operativos },
              { id: 'utilidad_operativa', label: 'Utilidad Operativa', value: reporte.utilidad_operativa },
              { id: 'utilidad_neta', label: 'Utilidad Neta', value: reporte.utilidad_neta },
            ].map(item => (
              <div key={item.id}>
                <Label htmlFor={item.id}>{item.label}</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-800 rounded-md">
                    <span className={`font-medium ${
                      (item.value || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ) : (
                  <Input
                    id={item.id}
                    type="number"
                    step="0.01"
                    value={formData[item.id as keyof ReporteTributarioUpdate] as number || ''}
                    onChange={(e) => handleInputChange(item.id as keyof ReporteTributarioUpdate, e.target.value)}
                    placeholder="0.00"
                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Balance General */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center text-white">
              <FileText className="h-5 w-5 mr-2 text-purple-400" />
              Balance General
            </h3>

            {[
              { id: 'activo_total', label: 'Activo Total', value: reporte.activo_total },
              { id: 'pasivo_total', label: 'Pasivo Total', value: reporte.pasivo_total },
              { id: 'patrimonio_total', label: 'Patrimonio Total', value: reporte.patrimonio_total },
              { id: 'ratio_endeudamiento', label: 'Ratio de Endeudamiento', value: reporte.ratio_endeudamiento, format: formatPercentage },
              { id: 'ratio_liquidez', label: 'Ratio de Liquidez', value: reporte.ratio_liquidez, format: (v?: number) => (v || 0).toFixed(4) },
            ].map(item => (
              <div key={item.id}>
                <Label htmlFor={item.id}>{item.label}</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-3 bg-gray-900/50 border border-gray-800 rounded-md">
                    <span className="font-medium text-white">
                      {item.format ? item.format(item.value) : formatCurrency(item.value)}
                    </span>
                  </div>
                ) : (
                  <Input
                    id={item.id}
                    type="number"
                    step={item.id.startsWith('ratio') ? "0.0001" : "0.01"}
                    value={formData[item.id as keyof ReporteTributarioUpdate] as number || ''}
                    onChange={(e) => handleInputChange(item.id as keyof ReporteTributarioUpdate, e.target.value)}
                    placeholder="0.00"
                    className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                  />
                )}
              </div>
            ))}

            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Información de Registro</h4>
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

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
            Cancelar
          </Button>
          {mode === 'edit' && isAdmin && (
            <Button onClick={handleSave} disabled={loading} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
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