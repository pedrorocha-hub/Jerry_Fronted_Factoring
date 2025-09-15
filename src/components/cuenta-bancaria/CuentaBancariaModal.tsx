import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, CreditCard, Building2, DollarSign, Hash } from 'lucide-react';
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
import { CuentaBancaria, CuentaBancariaUpdate, BANCOS_PERU, TIPO_CUENTA_LABELS, MONEDA_LABELS, ESTADO_CUENTA_LABELS, TipoCuenta, Moneda, EstadoCuenta } from '@/types/cuenta-bancaria';
import { CuentaBancariaService } from '@/services/cuentaBancariaService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface CuentaBancariaModalProps {
  cuenta: CuentaBancaria | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const CuentaBancariaModal: React.FC<CuentaBancariaModalProps> = ({
  cuenta,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<Partial<CuentaBancariaUpdate>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cuenta) {
      setFormData({
        nombre_banco: cuenta.nombre_banco,
        numero_cuenta: cuenta.numero_cuenta,
        tipo_cuenta: cuenta.tipo_cuenta,
        codigo_cci: cuenta.codigo_cci || '',
        moneda_cuenta: cuenta.moneda_cuenta,
        titular_cuenta: cuenta.titular_cuenta,
        estado_cuenta: cuenta.estado_cuenta
      });
    }
    setMode(initialMode);
  }, [cuenta, initialMode]);

  const handleInputChange = (field: keyof CuentaBancariaUpdate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!cuenta) return;

    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);

    try {
      await CuentaBancariaService.update(cuenta.id, formData);
      dismissToast(loadingToast);
      showSuccess('Cuenta bancaria actualizada exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error actualizando cuenta bancaria: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado?: EstadoCuenta) => {
    if (!estado) return null;
    const variants = {
      'Activa': 'bg-green-100 text-green-800 border-green-200',
      'Inactiva': 'bg-gray-100 text-gray-800 border-gray-200',
      'Bloqueada': 'bg-red-100 text-red-800 border-red-200',
      'Cerrada': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return <Badge className={variants[estado] || variants.Inactiva}>{estado}</Badge>;
  };

  const getMonedaBadge = (moneda?: Moneda) => {
    if (!moneda) return null;
    const { symbol } = MONEDA_LABELS[moneda];
    const variants = {
      'PEN': 'bg-blue-100 text-blue-800 border-blue-200',
      'USD': 'bg-green-100 text-green-800 border-green-200',
      'EUR': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return <Badge className={variants[moneda] || variants.PEN}>{symbol}</Badge>;
  };

  const getTipoCuentaBadge = (tipo?: TipoCuenta) => {
    if (!tipo) return null;
    const variants = {
      'Corriente': 'bg-blue-50 text-blue-700 border-blue-200',
      'Ahorros': 'bg-green-50 text-green-700 border-green-200',
      'Plazo Fijo': 'bg-purple-50 text-purple-700 border-purple-200',
      'CTS': 'bg-orange-50 text-orange-700 border-orange-200',
      'Otros': 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return <Badge variant="outline" className={variants[tipo] || variants.Otros}>{tipo}</Badge>;
  };

  if (!cuenta) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <div>
                <span className="text-xl font-bold">
                  {mode === 'view' ? 'Ver' : 'Editar'} Cuenta Bancaria
                </span>
                <div className="text-sm text-gray-500 font-mono">
                  {cuenta.numero_cuenta}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' ? (
                <Button variant="outline" size="sm" onClick={() => setMode('edit')}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setMode('view')}>
                  <Eye className="h-4 w-4 mr-2" /> Ver
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Información de la Cuenta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
              Información de la Cuenta
            </h3>
            <div>
              <Label htmlFor="nombre_banco">Nombre del Banco *</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-medium">{cuenta.nombre_banco}</span>
                </div>
              ) : (
                <Select value={formData.nombre_banco || ''} onValueChange={(value) => handleInputChange('nombre_banco', value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar banco" /></SelectTrigger>
                  <SelectContent>
                    {BANCOS_PERU.map(banco => <SelectItem key={banco} value={banco}>{banco}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="numero_cuenta">Número de Cuenta *</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-mono font-medium">{cuenta.numero_cuenta}</span>
                </div>
              ) : (
                <Input id="numero_cuenta" value={formData.numero_cuenta || ''} onChange={(e) => handleInputChange('numero_cuenta', e.target.value)} />
              )}
            </div>
            <div>
              <Label htmlFor="tipo_cuenta">Tipo de Cuenta</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{getTipoCuentaBadge(cuenta.tipo_cuenta)}</div>
              ) : (
                <Select value={formData.tipo_cuenta || ''} onValueChange={(value) => handleInputChange('tipo_cuenta', value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_CUENTA_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="codigo_cci">Código CCI</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-mono">{cuenta.codigo_cci || 'No especificado'}</span>
                </div>
              ) : (
                <Input id="codigo_cci" value={formData.codigo_cci || ''} onChange={(e) => handleInputChange('codigo_cci', e.target.value)} />
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Información Adicional
            </h3>
            <div>
              <Label htmlFor="moneda_cuenta">Moneda *</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{getMonedaBadge(cuenta.moneda_cuenta)}</div>
              ) : (
                <Select value={formData.moneda_cuenta || ''} onValueChange={(value) => handleInputChange('moneda_cuenta', value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar moneda" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(MONEDA_LABELS).map(([key, { label, symbol }]) => <SelectItem key={key} value={key}>{symbol} - {label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="titular_cuenta">Titular *</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <span className="font-medium">{cuenta.titular_cuenta}</span>
                </div>
              ) : (
                <Input id="titular_cuenta" value={formData.titular_cuenta || ''} onChange={(e) => handleInputChange('titular_cuenta', e.target.value)} />
              )}
            </div>
            <div>
              <Label htmlFor="estado_cuenta">Estado *</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">{getEstadoBadge(cuenta.estado_cuenta)}</div>
              ) : (
                <Select value={formData.estado_cuenta || ''} onValueChange={(value) => handleInputChange('estado_cuenta', value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ESTADO_CUENTA_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            {cuenta.ficha_ruc && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-gray-400" /> Empresa Asociada
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-medium text-blue-900">{cuenta.ficha_ruc.nombre_empresa}</div>
                  <div className="text-sm text-blue-700 font-mono">RUC: {cuenta.ficha_ruc.ruc}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CuentaBancariaModal;