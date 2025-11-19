import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Receipt, Calendar, DollarSign, Building2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FacturaNegociarWithFicha, FacturaNegociarUpdate } from '@/types/factura-negociar';
import { FacturaNegociarService } from '@/services/facturaNegociarService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

interface FacturaNegociarModalProps {
  factura: FacturaNegociarWithFicha | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const FacturaNegociarModal: React.FC<FacturaNegociarModalProps> = ({
  factura,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const { isAdmin } = useSession();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<FacturaNegociarUpdate>({});
  const [loading, setLoading] = useState(false);

  const isReadOnly = mode === 'view' || !isAdmin;

  useEffect(() => {
    if (factura) {
      setFormData({
        numero_factura: factura.numero_factura,
        fecha_emision: factura.fecha_emision || '',
        fecha_vencimiento: factura.fecha_vencimiento || '',
        monto_total: factura.monto_total || 0,
        monto_igv: factura.monto_igv || 0,
        monto_neto: factura.monto_neto || 0,
        estado_negociacion: factura.estado_negociacion,
        fecha_negociacion: factura.fecha_negociacion || '',
        monto_negociado: factura.monto_negociado || 0
      });
    }
    setMode(initialMode);
  }, [factura, initialMode]);

  const handleInputChange = (field: keyof FacturaNegociarUpdate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showError('No tienes permisos para guardar cambios.');
      return;
    }
    if (!factura) return;

    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);

    try {
      await FacturaNegociarService.update(factura.id, formData);
      dismissToast(loadingToast);
      showSuccess('Factura actualizada exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error actualizando factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string, fechaVencimiento?: string) => {
    const isProximoAVencer = fechaVencimiento && estado === 'Pendiente' && 
      new Date(fechaVencimiento) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let variant = '';
    switch (estado) {
      case 'Pendiente':
        variant = isProximoAVencer 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-blue-100 text-blue-800 border-blue-200';
        break;
      case 'Negociada':
        variant = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'Vencida':
        variant = 'bg-red-100 text-red-800 border-red-200';
        break;
      default:
        variant = 'bg-gray-100 text-gray-800 border-gray-200';
    }

    return (
      <Badge className={variant}>
        {isProximoAVencer ? 'Próxima a vencer' : estado}
      </Badge>
    );
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  if (!factura) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Receipt className="h-6 w-6 text-blue-600" />
              <div>
                <span className="text-xl font-bold">
                  {isReadOnly ? 'Ver' : 'Editar'} Factura a Negociar
                </span>
                <div className="text-sm text-gray-500 font-mono">
                  {factura.numero_factura}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && mode === 'view' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('edit')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : isAdmin && mode === 'edit' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('view')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              ) : null}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Información de la Factura */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-blue-600" />
              Información de la Factura
            </h3>

            <div>
              <Label htmlFor="numero_factura">Número de Factura *</Label>
              {isReadOnly ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-mono font-medium">{factura.numero_factura}</span>
                </div>
              ) : (
                <Input
                  id="numero_factura"
                  value={formData.numero_factura || ''}
                  onChange={(e) => handleInputChange('numero_factura', e.target.value)}
                  placeholder="F001-00000001"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_emision">Fecha de Emisión</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-3 bg-gray-50 rounded-md flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {factura.fecha_emision 
                        ? new Date(factura.fecha_emision).toLocaleDateString('es-ES')
                        : 'No especificada'
                      }
                    </span>
                  </div>
                ) : (
                  <Input
                    id="fecha_emision"
                    type="date"
                    value={formData.fecha_emision || ''}
                    onChange={(e) => handleInputChange('fecha_emision', e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-3 bg-gray-50 rounded-md flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {factura.fecha_vencimiento 
                        ? new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES')
                        : 'No especificada'
                      }
                    </span>
                  </div>
                ) : (
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento || ''}
                    onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
                  />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="estado_negociacion">Estado de Negociación</Label>
              {isReadOnly ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {getEstadoBadge(factura.estado_negociacion, factura.fecha_vencimiento)}
                </div>
              ) : (
                <Select
                  value={formData.estado_negociacion || ''}
                  onValueChange={(value) => handleInputChange('estado_negociacion', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Negociada">Negociada</SelectItem>
                    <SelectItem value="Vencida">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Información Financiera */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Información Financiera
            </h3>

            <div>
              <Label htmlFor="monto_total">Monto Total</Label>
              {isReadOnly ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-medium text-green-600">
                    {formatCurrency(factura.monto_total)}
                  </span>
                </div>
              ) : (
                <Input
                  id="monto_total"
                  type="number"
                  step="0.01"
                  value={formData.monto_total || ''}
                  onChange={(e) => handleInputChange('monto_total', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monto_igv">Monto IGV</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <span>{formatCurrency(factura.monto_igv)}</span>
                  </div>
                ) : (
                  <Input
                    id="monto_igv"
                    type="number"
                    step="0.01"
                    value={formData.monto_igv || ''}
                    onChange={(e) => handleInputChange('monto_igv', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="monto_neto">Monto Neto</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <span>{formatCurrency(factura.monto_neto)}</span>
                  </div>
                ) : (
                  <Input
                    id="monto_neto"
                    type="number"
                    step="0.01"
                    value={formData.monto_neto || ''}
                    onChange={(e) => handleInputChange('monto_neto', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                )}
              </div>
            </div>

            {/* Información de Negociación */}
            {(factura.estado_negociacion === 'Negociada' || formData.estado_negociacion === 'Negociada') && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Información de Negociación</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha_negociacion">Fecha de Negociación</Label>
                    {isReadOnly ? (
                      <div className="mt-1 p-3 bg-green-50 rounded-md flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-400" />
                        <span>
                          {factura.fecha_negociacion 
                            ? new Date(factura.fecha_negociacion).toLocaleDateString('es-ES')
                            : 'No especificada'
                          }
                        </span>
                      </div>
                    ) : (
                      <Input
                        id="fecha_negociacion"
                        type="date"
                        value={formData.fecha_negociacion || ''}
                        onChange={(e) => handleInputChange('fecha_negociacion', e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="monto_negociado">Monto Negociado</Label>
                    {isReadOnly ? (
                      <div className="mt-1 p-3 bg-green-50 rounded-md">
                        <span className="font-medium text-green-600">
                          {formatCurrency(factura.monto_negociado)}
                        </span>
                      </div>
                    ) : (
                      <Input
                        id="monto_negociado"
                        type="number"
                        step="0.01"
                        value={formData.monto_negociado || ''}
                        onChange={(e) => handleInputChange('monto_negociado', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empresa Asociada */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                Empresa Asociada
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-medium text-blue-900">
                  {factura.ficha_ruc?.nombre_empresa || 'N/A'}
                </div>
                <div className="text-sm text-blue-700 font-mono">
                  RUC: {factura.ficha_ruc?.ruc || 'N/A'}
                </div>
              </div>
            </div>

            {/* Información de Auditoría */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información de Registro</h4>
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  <strong>Creado:</strong> {new Date(factura.created_at).toLocaleString('es-ES')}
                </div>
                <div>
                  <strong>Actualizado:</strong> {new Date(factura.updated_at).toLocaleString('es-ES')}
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
          {mode === 'edit' && isAdmin && (
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

export default FacturaNegociarModal;