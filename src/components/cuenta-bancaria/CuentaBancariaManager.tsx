import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2, CreditCard, Hash, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';

interface CuentaBancariaManagerProps {
  ruc: string;
}

const CuentaBancariaManager: React.FC<CuentaBancariaManagerProps> = ({ ruc }) => {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaBancaria | null>(null);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Omit<CuentaBancariaInsert, 'documento_id'>>({
    ruc,
    banco: '',
    tipo_cuenta: undefined,
    moneda_cuenta: undefined,
    numero_cuenta: '',
    codigo_cuenta_interbancaria: '',
    titular_cuenta: '',
  });

  useEffect(() => {
    loadCuentas();
  }, [ruc]);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      const data = await CuentaBancariaService.getByRuc(ruc);
      setCuentas(data);
    } catch (error) {
      showError('Error al cargar las cuentas bancarias');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ruc,
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

  const handleEdit = (cuenta: CuentaBancaria) => {
    setEditingCuenta(cuenta);
    setFormData({
      ruc,
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
    try {
      await CuentaBancariaService.delete(id);
      showSuccess('Cuenta eliminada');
      await loadCuentas();
    } catch (error) {
      showError('Error al eliminar la cuenta');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData, documento_id: 'N/A' }; // Placeholder
      if (editingCuenta) {
        await CuentaBancariaService.update(editingCuenta.id, dataToSubmit);
        showSuccess('Cuenta actualizada');
      } else {
        await CuentaBancariaService.create(dataToSubmit);
        showSuccess('Cuenta creada');
      }
      await loadCuentas();
      resetForm();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al guardar la cuenta');
    }
  };

  const toggleShowNumber = (cuentaId: string) => {
    setShowNumbers(prev => ({ ...prev, [cuentaId]: !prev[cuentaId] }));
  };

  const maskNumber = (number: string, show: boolean) => {
    if (show || !number) return number;
    return number.replace(/\d(?=\d{4})/g, '*');
  };

  const groupedCuentas = cuentas.reduce((acc, cuenta) => {
    const bankName = cuenta.banco || 'Sin Banco Especificado';
    if (!acc[bankName]) {
      acc[bankName] = [];
    }
    acc[bankName].push(cuenta);
    return acc;
  }, {} as Record<string, CuentaBancaria[]>);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Cargando cuentas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <CreditCard className="h-5 w-5 mr-2 text-[#00FF80]" />
          Cuentas Bancarias ({cuentas.length})
        </h3>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#121212] border border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">{editingCuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields here */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Banco</Label>
                  <Input value={formData.banco} onChange={(e) => setFormData(p => ({...p, banco: e.target.value}))} className="bg-gray-900/50 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300">Titular</Label>
                  <Input value={formData.titular_cuenta} onChange={(e) => setFormData(p => ({...p, titular_cuenta: e.target.value}))} className="bg-gray-900/50 border-gray-700 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Número de Cuenta</Label>
                  <Input value={formData.numero_cuenta} onChange={(e) => setFormData(p => ({...p, numero_cuenta: e.target.value}))} className="bg-gray-900/50 border-gray-700 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300">CCI</Label>
                  <Input value={formData.codigo_cuenta_interbancaria} onChange={(e) => setFormData(p => ({...p, codigo_cuenta_interbancaria: e.target.value}))} className="bg-gray-900/50 border-gray-700 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Tipo de Cuenta</Label>
                  <Select value={formData.tipo_cuenta} onValueChange={(v) => setFormData(p => ({...p, tipo_cuenta: v as TipoCuenta}))}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent className="bg-[#121212] border-gray-800">
                      {Object.entries(TIPO_CUENTA_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="text-white hover:bg-gray-800">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Moneda</Label>
                  <Select value={formData.moneda_cuenta} onValueChange={(v) => setFormData(p => ({...p, moneda_cuenta: v as Moneda}))}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent className="bg-[#121212] border-gray-800">
                      {Object.entries(MONEDA_LABELS).map(([k, v]) => <SelectItem key={k} value={k} className="text-white hover:bg-gray-800">{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</Button>
                <Button type="submit" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">{editingCuenta ? 'Actualizar' : 'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedCuentas).length === 0 ? (
        <Card className="bg-[#121212] border border-gray-800">
          <CardContent className="text-center py-12 text-gray-400">
            <Building2 className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            No hay cuentas bancarias registradas para esta empresa.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedCuentas).map(([banco, cuentasDelBanco]) => (
            <Card key={banco} className="bg-[#1a1a1a] border border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-white">
                  <Building2 className="h-5 w-5 mr-3 text-[#00FF80]" />
                  {banco}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cuentasDelBanco.map(cuenta => (
                  <div key={cuenta.id} className="p-3 border border-gray-700 rounded-lg bg-gray-900/50 flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300">{cuenta.tipo_cuenta ? TIPO_CUENTA_LABELS[cuenta.tipo_cuenta] : 'N/A'}</Badge>
                        <Badge variant="outline" className="border-green-500/30 text-green-300">{cuenta.moneda_cuenta ? MONEDA_LABELS[cuenta.moneda_cuenta].symbol : 'N/A'}</Badge>
                        <span className="text-sm text-gray-400">Titular: {cuenta.titular_cuenta || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm w-12">Cuenta:</span>
                        <code className="flex-1 bg-transparent text-white text-sm font-mono">{maskNumber(cuenta.numero_cuenta || '', showNumbers[cuenta.id])}</code>
                      </div>
                      {cuenta.codigo_cuenta_interbancaria && (
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm w-12">CCI:</span>
                          <code className="flex-1 bg-transparent text-white text-sm font-mono">{maskNumber(cuenta.codigo_cuenta_interbancaria, showNumbers[cuenta.id])}</code>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center ml-4">
                      <Button variant="ghost" size="icon" onClick={() => toggleShowNumber(cuenta.id)} className="text-gray-400 hover:text-white h-8 w-8">
                        {showNumbers[cuenta.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cuenta)} className="text-gray-400 hover:text-white h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#121212] border border-gray-800">
                          <AlertDialogHeader><AlertDialogTitle className="text-white">¿Eliminar cuenta?</AlertDialogTitle><AlertDialogDescription className="text-gray-400">Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cuenta.id)} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuentaBancariaManager;