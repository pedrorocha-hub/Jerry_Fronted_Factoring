import React, { useState, useEffect } from 'react';
import { Save, Eye, Edit, CreditCard, Building2, DollarSign, Hash } from 'lucide-react';
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
import { CuentaBancaria, CuentaBancariaUpdate, TIPO_CUENTA_LABELS, MONEDA_LABELS, ESTADO_CUENTA_LABELS, TipoCuenta, Moneda, EstadoCuenta } from '@/types/cuenta-bancaria';
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
        codigo_cuenta_interbancaria: cuenta.codigo_cuenta_interbancaria || '',
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

  const handleSelectChange = (field: keyof CuentaBancariaUpdate, value: string) => {
    const finalValue = value === '' ? undefined : value;
    setFormData(prev => ({
      ...prev,
      [field]: finalValue
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
      console.error("Error al actualizar la cuenta:", error);
      
      let errorMessage = 'Ocurrió un error inesperado.';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showError(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado?: EstadoCuenta) => {
    if (!estado) return null;
    const variants = {
      'Activa': 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20',
      'Inactiva': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      'Cerrada': 'bg-red-500/10 text-red-400 border border-red-500/20',
      'Bloqueada': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    };
    return <Badge className={variants[estado] || variants.Inactiva}>{estado}</Badge>;
  };

  const getMonedaBadge = (moneda?: Moneda) => {
    if (!moneda) return null;
    const { symbol } = MONEDA_LABELS[moneda];
    const variants = {
      'PEN': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'USD': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'EUR': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    };
    return <Badge className={variants[moneda] || variants.PEN}>{symbol}</Badge>;
  };

  const getTipoCuentaBadge = (tipo?: TipoCuenta) => {
    if (!tipo) return null;
    const variants = {
      'Corriente': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'Ahorros': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'Plazo Fijo': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      'CTS': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      'Otros': 'bg-gray-800 text-gray-300 border border-gray-700',
    };
    return <Badge variant="outline" className={variants[tipo] || variants.Otros}>{tipo}</Badge>;
  };

  if (!cuenta) return null;

  const renderField = (label: string, id: string, content: React.ReactNode) => (
    <div>
      <Label htmlFor={id} className="text-gray-400 text-sm">{label}</Label>
      {content}
    </div>
  );

  const renderViewMode = (value: React.ReactNode) => (
    <div className="mt-1 p-3 bg-gray-900/50 border border-gray-700 rounded-md min-h-[40px] flex items-center">
      {value}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-[#00FF80]" />
              <div>
                <span className="text-xl font-bold">
                  {mode === 'view' ? 'Ver' : 'Editar'} Cuenta Bancaria
                </span>
                <div className="text-sm text-gray-400 font-mono">
                  {cuenta.numero_cuenta}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' ? (
                <Button variant="outline" size="sm" onClick={() => setMode('edit')} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setMode('view')} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Eye className="h-4 w-4 mr-2" /> Ver
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          <div className="space-y-4 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold flex items-center text-[#00FF80]">
              <CreditCard className="h-5 w-5 mr-2" />
              Información de la Cuenta
            </h3>
            {renderField('Nombre del Banco *', 'nombre_banco', mode === 'view' ? renderViewMode(<span className="font-medium">{cuenta.nombre_banco}</span>) : (
              <Input id="nombre_banco" value={formData.nombre_banco || ''} onChange={(e) => handleInputChange('nombre_banco', e.target.value)} placeholder="Nombre del banco" className="bg-gray-900/50 border-gray-700" />
            ))}
            {renderField('Número de Cuenta *', 'numero_cuenta', mode === 'view' ? renderViewMode(<span className="font-mono font-medium">{cuenta.numero_cuenta}</span>) : (
              <Input id="numero_cuenta" value={formData.numero_cuenta || ''} onChange={(e) => handleInputChange('numero_cuenta', e.target.value)} className="bg-gray-900/50 border-gray-700" />
            ))}
            {renderField('Tipo de Cuenta', 'tipo_cuenta', mode === 'view' ? renderViewMode(getTipoCuentaBadge(cuenta.tipo_cuenta)) : (
              <Select value={formData.tipo_cuenta || ''} onValueChange={(value) => handleSelectChange('tipo_cuenta', value)}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-gray-800 text-white">
                  <SelectItem value="" className="text-gray-400 italic">-- Sin especificar --</SelectItem>
                  {Object.entries(TIPO_CUENTA_LABELS).map(([key, label]) => <SelectItem key={key} value={key} className="hover:bg-gray-800">{label}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
            {renderField('Código CCI', 'codigo_cuenta_interbancaria', mode === 'view' ? renderViewMode(
              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-mono">{cuenta.codigo_cuenta_interbancaria || 'No especificado'}</span>
              </div>
            ) : (
              <Input id="codigo_cuenta_interbancaria" value={formData.codigo_cuenta_interbancaria || ''} onChange={(e) => handleInputChange('codigo_cuenta_interbancaria', e.target.value)} className="bg-gray-900/50 border-gray-700" />
            ))}
          </div>

          <div className="space-y-4 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
            <h3 className="text-lg font-semibold flex items-center text-[#00FF80]">
              <DollarSign className="h-5 w-5 mr-2" />
              Información Adicional
            </h3>
            {renderField('Moneda *', 'moneda_cuenta', mode === 'view' ? renderViewMode(getMonedaBadge(cuenta.moneda_cuenta)) : (
              <Select value={formData.moneda_cuenta || ''} onValueChange={(value) => handleSelectChange('moneda_cuenta', value)}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue placeholder="Seleccionar moneda" /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-gray-800 text-white">
                  <SelectItem value="" className="text-gray-400 italic">-- Sin especificar --</SelectItem>
                  {Object.entries(MONEDA_LABELS).map(([key, { label, symbol }]) => <SelectItem key={key} value={key} className="hover:bg-gray-800">{symbol} - {label}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
            {renderField('Titular *', 'titular_cuenta', mode === 'view' ? renderViewMode(<span className="font-medium">{cuenta.titular_cuenta}</span>) : (
              <Input id="titular_cuenta" value={formData.titular_cuenta || ''} onChange={(e) => handleInputChange('titular_cuenta', e.target.value)} className="bg-gray-900/50 border-gray-700" />
            ))}
            {renderField('Estado *', 'estado_cuenta', mode === 'view' ? renderViewMode(getEstadoBadge(cuenta.estado_cuenta)) : (
              <Select value={formData.estado_cuenta || ''} onValueChange={(value) => handleSelectChange('estado_cuenta', value)}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-gray-800 text-white">
                  {Object.entries(ESTADO_CUENTA_LABELS).map(([key, label]) => <SelectItem key={key} value={key} className="hover:bg-gray-800">{label}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
            {cuenta.ficha_ruc && (
              <div className="pt-4 border-t border-gray-800">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-gray-500" /> Empresa Asociada
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="font-medium text-[#00FF80]">{cuenta.ficha_ruc.nombre_empresa}</div>
                  <div className="text-sm text-gray-400 font-mono">RUC: {cuenta.ficha_ruc.ruc}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} disabled={loading} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              <Save className="h-4 w-4 mr-2" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CuentaBancariaModal;