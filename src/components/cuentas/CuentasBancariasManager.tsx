import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  CuentaBancaria, 
  CuentaBancariaInsert,
  TIPO_CUENTA_LABELS,
  MONEDA_LABELS,
  TipoCuenta,
  Moneda
} from '@/types/cuenta-bancaria';
import { CuentaBancariaService } from '@/services/cuentaBancariaService';
import { showSuccess, showError } from '@/utils/toast';

interface CuentasBancariasManagerProps {
  documentoId?: string;
  ruc?: string;
  readonly?: boolean;
}

const CuentasBancariasManager: React.FC<CuentasBancariasManagerProps> = ({ 
  documentoId, 
  ruc,
  readonly = false 
}) => {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaBancaria | null>(null);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CuentaBancariaInsert>>({
    banco: '',
    tipo_cuenta: undefined,
    moneda_cuenta: undefined,
    numero_cuenta: '',
    codigo_cuenta_interbancaria: '',
    titular_cuenta: '',
  });

  useEffect(() => {
    loadCuentas();
  }, [documentoId, ruc]);

  const loadCuentas = async () => {
    if (!documentoId && !ruc) return;
    try {
      setLoading(true);
      const data = documentoId 
        ? await CuentaBancariaService.getByDocumentoId(documentoId)
        : await CuentaBancariaService.getByRuc(ruc!);
      setCuentas(data);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      showError('Error cargando cuentas bancarias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;
    
    try {
      const cleanFormData: CuentaBancariaInsert = {
        ...formData,
        documento_id: documentoId,
        ruc: ruc,
        banco: formData.banco?.trim() || undefined,
        codigo_cuenta_interbancaria: formData.codigo_cuenta_interbancaria?.trim() || undefined,
        titular_cuenta: formData.titular_cuenta?.trim() || undefined,
      };

      if (editingCuenta) {
        await CuentaBancariaService.update(editingCuenta.id, cleanFormData);
        showSuccess('Cuenta bancaria actualizada');
      } else {
        await CuentaBancariaService.create(cleanFormData);
        showSuccess('Cuenta bancaria creada');
      }
      
      await loadCuentas();
      resetForm();
    } catch (error) {
      console.error('Error guardando cuenta:', error);
      showError(error instanceof Error ? error.message : 'Error guardando cuenta');
    }
  };

  const handleEdit = (cuenta: CuentaBancaria) => {
    setEditingCuenta(cuenta);
    setFormData({
      banco: cuenta.banco || '',
      tipo_cuenta: cuenta.tipo_cuenta,
      moneda_cuenta: cuenta.moneda_cuenta,
      numero_cuenta: cuenta.numero_cuenta || '',
      codigo_cuenta_interbancaria: cuenta.codigo_cuenta_interbancaria || '',
      titular_cuenta: cuenta.titular_cuenta || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (readonly) return;
    try {
      await CuentaBancariaService.delete(id);
      showSuccess('Cuenta bancaria eliminada');
      await loadCuentas();
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      showError('Error eliminando cuenta bancaria');
    }
  };

  const resetForm = () => {
    setFormData({
      banco: '',
      tipo_cuenta: undefined,
      moneda_cuenta: undefined,
      numero_cuenta: '',
      codigo_cuenta_interbancaria: '',
      titular_cuenta: '',
    });
    setEditingCuenta(null);
    setShowForm(false);
  };

  const toggleShowNumber = (cuentaId: string) => {
    setShowNumbers(prev => ({
      ...prev,
      [cuentaId]: !prev[cuentaId]
    }));
  };

  const maskNumber = (number: string, show: boolean) => {
    if (show || !number) return number;
    return number.replace(/\d(?=\d{4})/g, '*');
  };

  const getMonedaBadge = (moneda?: Moneda) => {
    if (!moneda) return null;
    const variants = {
      'PEN': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'USD': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'EUR': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    };
    return <Badge className={variants[moneda]}>{MONEDA_LABELS[moneda].symbol}</Badge>;
  };

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF80]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-[#00FF80]" />
          <h3 className="text-lg font-semibold text-white">
            Cuentas Bancarias ({cuentas.length})
          </h3>
        </div>
        
        {!readonly && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()}
                className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border border-gray-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingCuenta ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Banco</Label>
                    <Input value={formData.banco || ''} onChange={(e) => setFormData(prev => ({ ...prev, banco: e.target.value }))} placeholder="Nombre del banco" className="bg-gray-900/50 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300">Tipo de Cuenta</Label>
                    <Select value={formData.tipo_cuenta || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_cuenta: value as TipoCuenta | undefined }))}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue placeholder="Seleccionar tipo (opcional)" /></SelectTrigger>
                      <SelectContent className="bg-[#121212] border-gray-800">
                        {Object.entries(TIPO_CUENTA_LABELS).map(([key, label]) => <SelectItem key={key} value={key} className="text-white hover:bg-gray-800">{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Moneda</Label>
                  <Select value={formData.moneda_cuenta || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, moneda_cuenta: value as Moneda | undefined }))}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue placeholder="Seleccionar moneda (opcional)" /></SelectTrigger>
                    <SelectContent className="bg-[#121212] border-gray-800">
                      {Object.entries(MONEDA_LABELS).map(([key, { label, symbol }]) => <SelectItem key={key} value={key} className="text-white hover:bg-gray-800">{symbol} {label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Número de Cuenta</Label>
                    <Input value={formData.numero_cuenta || ''} onChange={(e) => setFormData(prev => ({ ...prev, numero_cuenta: e.target.value }))} placeholder="Ej: 0011-0123-0123456789" className="bg-gray-900/50 border-gray-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300">Código CCI</Label>
                    <Input value={formData.codigo_cuenta_interbancaria || ''} onChange={(e) => setFormData(prev => ({ ...prev, codigo_cuenta_interbancaria: e.target.value }))} placeholder="Ej: 00211012345678901234" className="bg-gray-900/50 border-gray-700 text-white" />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Titular de la Cuenta</Label>
                  <Input value={formData.titular_cuenta || ''} onChange={(e) => setFormData(prev => ({ ...prev, titular_cuenta: e.target.value }))} placeholder="Nombre del titular" className="bg-gray-900/50 border-gray-700 text-white" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</Button>
                  <Button type="submit" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">{editingCuenta ? 'Actualizar' : 'Crear'} Cuenta</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {cuentas.length === 0 ? (
        <Card className="bg-[#121212] border border-gray-800">
          <CardContent className="p-6">
            <div className="text-center py-8 text-gray-400">
              <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p>No hay cuentas bancarias registradas</p>
              <p className="text-sm">Las cuentas aparecerán aquí cuando se procesen los documentos</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cuentas.map((cuenta) => (
            <Card key={cuenta.id} className="bg-[#121212] border border-gray-800 hover:border-[#00FF80]/30 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-[#00FF80]" />
                          <h4 className="font-semibold text-white">{cuenta.banco || 'Banco no especificado'}</h4>
                          {getMonedaBadge(cuenta.moneda_cuenta)}
                        </div>
                        <p className="text-sm text-gray-400 ml-8 mt-1">{cuenta.tipo_cuenta ? TIPO_CUENTA_LABELS[cuenta.tipo_cuenta] : 'Tipo de cuenta no especificado'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 bg-gray-900/30 p-3 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm w-12">Cuenta:</span>
                        <code className="flex-1 bg-transparent text-[#00FF80] text-sm font-mono">{maskNumber(cuenta.numero_cuenta || '', showNumbers[cuenta.id])}</code>
                        <Button variant="ghost" size="sm" onClick={() => toggleShowNumber(cuenta.id)} className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                          {showNumbers[cuenta.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                      {cuenta.codigo_cuenta_interbancaria && (
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm w-12">CCI:</span>
                          <code className="flex-1 bg-transparent text-[#00FF80] text-sm font-mono">{maskNumber(cuenta.codigo_cuenta_interbancaria, showNumbers[cuenta.id])}</code>
                        </div>
                      )}
                    </div>
                    {cuenta.titular_cuenta && (
                      <div className="text-sm">
                        <span className="text-gray-400">Titular:</span>
                        <span className="ml-2 text-white">{cuenta.titular_cuenta}</span>
                      </div>
                    )}
                  </div>
                  {!readonly && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(cuenta)} title="Editar" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Eliminar" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#121212] border border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Eliminar cuenta bancaria?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">Esta acción no se puede deshacer. La cuenta bancaria será eliminada permanentemente.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cuenta.id)} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuentasBancariasManager;