import React, { useState, useEffect } from 'react';
import { Save, Eye, Edit, CreditCard, Building2, Hash, User } from 'lucide-react';
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
import { CuentaBancaria, CuentaBancariaUpdate, TIPO_CUENTA_LABELS, MONEDA_LABELS, TipoCuenta, Moneda } from '@/types/cuenta-bancaria';
import { CuentaBancariaService } from '@/services/cuentaBancariaService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';

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
  const { isAdmin } = useSession();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<Partial<CuentaBancariaUpdate>>({});
  const [loading, setLoading] = useState(false);

  const isReadOnly = mode === 'view' || !isAdmin;

  useEffect(() => {
    if (cuenta) {
      setFormData({
        banco: cuenta.banco,
        numero_cuenta: cuenta.numero_cuenta,
        tipo_cuenta: cuenta.tipo_cuenta,
        codigo_cuenta_interbancaria: cuenta.codigo_cuenta_interbancaria || '',
        moneda_cuenta: cuenta.moneda_cuenta,
        titular_cuenta: cuenta.titular_cuenta,
        ruc: cuenta.ruc,
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
    const finalValue = (value === '--NONE--' || value === '') ? undefined : value;
    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      showError('No tienes permisos para guardar cambios.');
      return;
    }
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
      showError(`Error al actualizar la cuenta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!cuenta) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-[#00FF80]" />
              <div>
                <span className="text-xl font-bold">
                  {isReadOnly ? 'Ver' : 'Editar'} Cuenta Bancaria
                </span>
                <div className="text-sm text-gray-400 font-mono">
                  {cuenta.numero_cuenta}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && mode === 'view' ? (
                <Button variant="outline" size="sm" onClick={() => setMode('edit')} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              ) : isAdmin && mode === 'edit' ? (
                <Button variant="outline" size="sm" onClick={() => setMode('view')} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  <Eye className="h-4 w-4 mr-2" /> Ver
                </Button>
              ) : null}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Form fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Banco</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md">{cuenta.banco}</div> : <Input value={formData.banco || ''} onChange={e => handleInputChange('banco', e.target.value)} className="bg-gray-900/50 border-gray-700" />}
            </div>
            <div>
              <Label className="text-gray-300">Titular</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md">{cuenta.titular_cuenta}</div> : <Input value={formData.titular_cuenta || ''} onChange={e => handleInputChange('titular_cuenta', e.target.value)} className="bg-gray-900/50 border-gray-700" />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Número de Cuenta</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md font-mono">{cuenta.numero_cuenta}</div> : <Input value={formData.numero_cuenta || ''} onChange={e => handleInputChange('numero_cuenta', e.target.value)} className="bg-gray-900/50 border-gray-700" />}
            </div>
            <div>
              <Label className="text-gray-300">CCI</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md font-mono">{cuenta.codigo_cuenta_interbancaria || 'N/A'}</div> : <Input value={formData.codigo_cuenta_interbancaria || ''} onChange={e => handleInputChange('codigo_cuenta_interbancaria', e.target.value)} className="bg-gray-900/50 border-gray-700" />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Tipo de Cuenta</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md">{cuenta.tipo_cuenta ? TIPO_CUENTA_LABELS[cuenta.tipo_cuenta] : 'N/A'}</div> : (
                <Select value={formData.tipo_cuenta || ''} onValueChange={v => handleSelectChange('tipo_cuenta', v)}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-gray-800 text-white">
                    {Object.entries(TIPO_CUENTA_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="hover:bg-gray-800">{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label className="text-gray-300">Moneda</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md">{cuenta.moneda_cuenta ? MONEDA_LABELS[cuenta.moneda_cuenta].label : 'N/A'}</div> : (
                <Select value={formData.moneda_cuenta || ''} onValueChange={v => handleSelectChange('moneda_cuenta', v)}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-gray-800 text-white">
                    {Object.entries(MONEDA_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="hover:bg-gray-800">{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</Button>
          {mode === 'edit' && isAdmin && (
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