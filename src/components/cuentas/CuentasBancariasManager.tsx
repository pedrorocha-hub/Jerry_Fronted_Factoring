import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  StarOff,
  Building2,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Hash,
  Link2,
  Unlink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  ESTADO_CUENTA_LABELS,
  TipoCuenta,
  Moneda,
  EstadoCuenta
} from '@/types/cuenta-bancaria';
import { CuentaBancariaService } from '@/services/cuentaBancariaService';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError } from '@/utils/toast';

interface CuentasBancariasManagerProps {
  documentoId: string;
  readonly?: boolean;
}

interface FichaRucOption {
  id: number; // Corregido: INTEGER
  ruc: string;
  nombre_empresa: string; // Cambiado de razon_social a nombre_empresa
}

const CuentasBancariasManager: React.FC<CuentasBancariasManagerProps> = ({ 
  documentoId, 
  readonly = false 
}) => {
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaBancaria | null>(null);
  const [showNumbers, setShowNumbers] = useState<Record<string, boolean>>({});
  const [fichasRuc, setFichasRuc] = useState<FichaRucOption[]>([]);
  const [searchRuc, setSearchRuc] = useState('');

  // Form state - ahora con ficha_ruc_id como number
  const [formData, setFormData] = useState<CuentaBancariaInsert>({
    documento_id: documentoId,
    ficha_ruc_id: undefined,
    nombre_banco: '',
    tipo_cuenta: undefined,
    moneda_cuenta: undefined,
    numero_cuenta: '',
    codigo_cci: '',
    titular_cuenta: '',
    estado_cuenta: 'Activa',
    es_principal: false,
    notas: ''
  });

  useEffect(() => {
    loadCuentas();
    loadFichasRuc();
  }, [documentoId]);

  const loadCuentas = async () => {
    try {
      setLoading(true);
      const data = await CuentaBancariaService.getByDocumentoId(documentoId);
      setCuentas(data);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      showError('Error cargando cuentas bancarias');
    } finally {
      setLoading(false);
    }
  };

  const loadFichasRuc = async () => {
    try {
      const data = await FichaRucService.getAll();
      setFichasRuc(data.map(ficha => ({
        id: ficha.id,
        ruc: ficha.ruc,
        nombre_empresa: ficha.nombre_empresa // Cambiado de razon_social a nombre_empresa
      })));
    } catch (error) {
      console.error('Error cargando fichas RUC:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Limpiar campos vacíos para enviar undefined en lugar de strings vacíos
      const cleanFormData = {
        ...formData,
        ficha_ruc_id: formData.ficha_ruc_id || undefined,
        nombre_banco: formData.nombre_banco?.trim() || undefined,
        codigo_cci: formData.codigo_cci?.trim() || undefined,
        titular_cuenta: formData.titular_cuenta?.trim() || undefined,
        notas: formData.notas?.trim() || undefined,
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
      documento_id: cuenta.documento_id,
      ficha_ruc_id: cuenta.ficha_ruc_id || undefined,
      nombre_banco: cuenta.nombre_banco || '',
      tipo_cuenta: cuenta.tipo_cuenta,
      moneda_cuenta: cuenta.moneda_cuenta,
      numero_cuenta: cuenta.numero_cuenta,
      codigo_cci: cuenta.codigo_cci || '',
      titular_cuenta: cuenta.titular_cuenta || '',
      estado_cuenta: cuenta.estado_cuenta,
      es_principal: cuenta.es_principal,
      notas: cuenta.notas || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await CuentaBancariaService.delete(id);
      showSuccess('Cuenta bancaria eliminada');
      await loadCuentas();
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      showError('Error eliminando cuenta bancaria');
    }
  };

  const handleSetPrincipal = async (id: string) => {
    try {
      await CuentaBancariaService.setPrincipal(id);
      showSuccess('Cuenta marcada como principal');
      await loadCuentas();
    } catch (error) {
      console.error('Error marcando como principal:', error);
      showError('Error marcando cuenta como principal');
    }
  };

  const handleAssociateRuc = async (cuentaId: string, fichaRucId: string) => {
    try {
      const fichaRucIdNumber = parseInt(fichaRucId); // Convertir a number
      await CuentaBancariaService.associateWithFichaRuc(cuentaId, fichaRucIdNumber);
      showSuccess('Cuenta asociada con ficha RUC');
      await loadCuentas();
    } catch (error) {
      console.error('Error asociando con ficha RUC:', error);
      showError('Error asociando cuenta con ficha RUC');
    }
  };

  const resetForm = () => {
    setFormData({
      documento_id: documentoId,
      ficha_ruc_id: undefined,
      nombre_banco: '',
      tipo_cuenta: undefined,
      moneda_cuenta: undefined,
      numero_cuenta: '',
      codigo_cci: '',
      titular_cuenta: '',
      estado_cuenta: 'Activa',
      es_principal: false,
      notas: ''
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

  const getEstadoBadge = (estado: EstadoCuenta) => {
    const variants = {
      'Activa': 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20',
      'Inactiva': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      'Cerrada': 'bg-red-500/10 text-red-400 border border-red-500/20',
      'Bloqueada': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    };

    return (
      <Badge className={variants[estado]}>
        {ESTADO_CUENTA_LABELS[estado]}
      </Badge>
    );
  };

  const getTipoCuentaBadge = (tipo?: TipoCuenta) => {
    if (!tipo) return <Badge className="bg-gray-800 text-gray-300 border border-gray-700">No especificado</Badge>;
    
    const variants = {
      'Corriente': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'Ahorros': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'Plazo Fijo': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      'CTS': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      'Otros': 'bg-gray-800 text-gray-300 border border-gray-700',
    };

    return (
      <Badge className={variants[tipo]}>
        {TIPO_CUENTA_LABELS[tipo]}
      </Badge>
    );
  };

  const getMonedaBadge = (moneda?: Moneda) => {
    if (!moneda) return <Badge className="bg-gray-800 text-gray-300 border border-gray-700">No especificada</Badge>;
    
    const variants = {
      'PEN': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'USD': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'EUR': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    };

    return (
      <Badge className={variants[moneda]}>
        {MONEDA_LABELS[moneda].symbol} {MONEDA_LABELS[moneda].label}
      </Badge>
    );
  };

  const filteredFichasRuc = fichasRuc.filter(ficha => 
    ficha.ruc.includes(searchRuc) || 
    ficha.nombre_empresa.toLowerCase().includes(searchRuc.toLowerCase())
  );

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
      {/* Header */}
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
                {/* Selección de Ficha RUC */}
                <div>
                  <Label className="text-gray-300">Empresa (Ficha RUC)</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar por RUC o nombre de empresa..."
                      value={searchRuc}
                      onChange={(e) => setSearchRuc(e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                    <Select 
                      value={formData.ficha_ruc_id?.toString() || ''} 
                      onValueChange={(value) => {
                        const fichaRucId = value ? parseInt(value) : undefined;
                        setFormData(prev => ({ ...prev, ficha_ruc_id: fichaRucId }));
                        // Auto-completar titular si se selecciona una ficha RUC
                        if (fichaRucId) {
                          const selectedFicha = fichasRuc.find(f => f.id === fichaRucId);
                          if (selectedFicha && !formData.titular_cuenta) {
                            setFormData(prev => ({ ...prev, titular_cuenta: selectedFicha.nombre_empresa }));
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue placeholder="Seleccionar empresa (opcional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-gray-800 max-h-60">
                        <SelectItem value="" className="text-white hover:bg-gray-800">Sin asociar</SelectItem>
                        {filteredFichasRuc.map((ficha) => (
                          <SelectItem key={ficha.id} value={ficha.id.toString()} className="text-white hover:bg-gray-800">
                            <div className="flex flex-col">
                              <span className="font-medium">{ficha.nombre_empresa}</span>
                              <span className="text-xs text-gray-400">RUC: {ficha.ruc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Banco</Label>
                    <Input
                      value={formData.nombre_banco || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre_banco: e.target.value }))}
                      placeholder="Nombre del banco"
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Tipo de Cuenta</Label>
                    <Select 
                      value={formData.tipo_cuenta || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_cuenta: value as TipoCuenta || undefined }))}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue placeholder="Seleccionar tipo (opcional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-gray-800">
                        <SelectItem value="" className="text-white hover:bg-gray-800">Sin especificar</SelectItem>
                        {Object.entries(TIPO_CUENTA_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-white hover:bg-gray-800">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Moneda</Label>
                    <Select 
                      value={formData.moneda_cuenta || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, moneda_cuenta: value as Moneda || undefined }))}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue placeholder="Seleccionar moneda (opcional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-gray-800">
                        <SelectItem value="" className="text-white hover:bg-gray-800">Sin especificar</SelectItem>
                        {Object.entries(MONEDA_LABELS).map(([key, { label, symbol }]) => (
                          <SelectItem key={key} value={key} className="text-white hover:bg-gray-800">
                            {symbol} {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Estado</Label>
                    <Select 
                      value={formData.estado_cuenta} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, estado_cuenta: value as EstadoCuenta }))}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-gray-800">
                        {Object.entries(ESTADO_CUENTA_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key} className="text-white hover:bg-gray-800">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Número de Cuenta *</Label>
                    <Input
                      value={formData.numero_cuenta}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero_cuenta: e.target.value }))}
                      placeholder="Ej: 0011-0123-0123456789"
                      className="bg-gray-900/50 border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Código CCI</Label>
                    <Input
                      value={formData.codigo_cci}
                      onChange={(e) => setFormData(prev => ({ ...prev, codigo_cci: e.target.value }))}
                      placeholder="Ej: 00211012345678901234"
                      className="bg-gray-900/50 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Titular de la Cuenta</Label>
                  <Input
                    value={formData.titular_cuenta}
                    onChange={(e) => setFormData(prev => ({ ...prev, titular_cuenta: e.target.value }))}
                    placeholder="Nombre del titular"
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Notas</Label>
                  <Textarea
                    value={formData.notas}
                    onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                    placeholder="Notas adicionales..."
                    className="bg-gray-900/50 border-gray-700 text-white"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="es_principal"
                    checked={formData.es_principal}
                    onChange={(e) => setFormData(prev => ({ ...prev, es_principal: e.target.checked }))}
                    className="rounded border-gray-700 bg-gray-900/50"
                  />
                  <Label htmlFor="es_principal" className="text-gray-300">
                    Marcar como cuenta principal
                  </Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
                  >
                    {editingCuenta ? 'Actualizar' : 'Crear'} Cuenta
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de cuentas */}
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
                  <div className="flex-1 space-y-3">
                    {/* Header con banco y badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-[#00FF80]" />
                        <h4 className="font-semibold text-white">{cuenta.nombre_banco || 'Banco no especificado'}</h4>
                        {cuenta.es_principal && (
                          <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            <Star className="h-3 w-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      {getEstadoBadge(cuenta.estado_cuenta)}
                    </div>

                    {/* Información de la empresa (Ficha RUC) */}
                    {cuenta.ficha_ruc ? (
                      <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-2 mb-2">
                          <Building className="h-4 w-4 text-[#00FF80]" />
                          <span className="text-sm font-medium text-[#00FF80]">Empresa Asociada</span>
                          <Badge className="bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20">
                            <Link2 className="h-3 w-3 mr-1" />
                            Vinculada
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">RUC:</span>
                            <span className="ml-2 text-white font-mono">{cuenta.ficha_ruc.ruc}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Estado:</span>
                            <span className="ml-2 text-white">{cuenta.ficha_ruc.estado_contribuyente}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400">Empresa:</span>
                            <p className="mt-1 text-white font-medium">{cuenta.ficha_ruc.nombre_empresa}</p>
                          </div>
                          {cuenta.ficha_ruc.actividad_empresa && (
                            <div className="col-span-2">
                              <span className="text-gray-400">Actividad:</span>
                              <p className="mt-1 text-white text-sm">{cuenta.ficha_ruc.actividad_empresa}</p>
                            </div>
                          )}
                          {cuenta.ficha_ruc.domicilio_fiscal && (
                            <div className="col-span-2 flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-400 text-xs">
                                {cuenta.ficha_ruc.domicilio_fiscal}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/20 p-3 rounded-lg border border-gray-800 border-dashed">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Unlink className="h-4 w-4" />
                          <span className="text-sm">Sin empresa asociada</span>
                          {!readonly && (
                            <Select onValueChange={(value) => handleAssociateRuc(cuenta.id, value)}>
                              <SelectTrigger className="ml-auto w-40 h-6 text-xs bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Asociar..." />
                              </SelectTrigger>
                              <SelectContent className="bg-[#121212] border-gray-800">
                                {fichasRuc.slice(0, 5).map((ficha) => (
                                  <SelectItem key={ficha.id} value={ficha.id.toString()} className="text-white hover:bg-gray-800">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium">{ficha.nombre_empresa}</span>
                                      <span className="text-xs text-gray-400">RUC: {ficha.ruc}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Información de la cuenta */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Tipo:</span>
                        <div className="ml-2 inline-block">{getTipoCuentaBadge(cuenta.tipo_cuenta)}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Moneda:</span>
                        <div className="ml-2 inline-block">{getMonedaBadge(cuenta.moneda_cuenta)}</div>
                      </div>
                    </div>

                    {/* Números de cuenta */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Cuenta:</span>
                        <code className="bg-gray-900/50 px-2 py-1 rounded text-[#00FF80] text-sm font-mono">
                          {maskNumber(cuenta.numero_cuenta, showNumbers[cuenta.id])}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowNumber(cuenta.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        >
                          {showNumbers[cuenta.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                      
                      {cuenta.codigo_cci && (
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">CCI:</span>
                          <code className="bg-gray-900/50 px-2 py-1 rounded text-[#00FF80] text-sm font-mono">
                            {maskNumber(cuenta.codigo_cci, showNumbers[cuenta.id])}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Titular */}
                    {cuenta.titular_cuenta && (
                      <div className="text-sm">
                        <span className="text-gray-400">Titular:</span>
                        <span className="ml-2 text-white">{cuenta.titular_cuenta}</span>
                      </div>
                    )}

                    {/* Notas */}
                    {cuenta.notas && (
                      <div className="text-sm">
                        <span className="text-gray-400">Notas:</span>
                        <p className="mt-1 text-gray-300 bg-gray-900/30 p-2 rounded text-xs">
                          {cuenta.notas}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  {!readonly && (
                    <div className="flex flex-col space-y-2 ml-4">
                      {!cuenta.es_principal && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetPrincipal(cuenta.id)}
                          title="Marcar como principal"
                          className="text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(cuenta)}
                        title="Editar"
                        className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Eliminar"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#121212] border border-gray-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">¿Eliminar cuenta bancaria?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Esta acción no se puede deshacer. La cuenta bancaria será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(cuenta.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Eliminar
                            </AlertDialogAction>
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