import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Building2, Calendar, MapPin, User, Users, Briefcase, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FichaRuc, FichaRucUpdate } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import AccionistaManager from './AccionistaManager';
import GerenciaManager from '../gerencia/GerenciaManager';
import CuentasBancariasManager from '../cuentas/CuentasBancariasManager';
import { useSession } from '@/contexts/SessionContext';

interface FichaRucModalProps {
  ficha: FichaRuc | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const FichaRucModal: React.FC<FichaRucModalProps> = ({
  ficha,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const { isAdmin } = useSession();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<FichaRucUpdate>({});
  const [loading, setLoading] = useState(false);

  const isReadOnly = mode === 'view' || !isAdmin;

  useEffect(() => {
    if (ficha) {
      setFormData({
        nombre_empresa: ficha.nombre_empresa,
        ruc: ficha.ruc,
        actividad_empresa: ficha.actividad_empresa || '',
        fecha_inicio_actividades: ficha.fecha_inicio_actividades || '',
        estado_contribuyente: ficha.estado_contribuyente || '',
        domicilio_fiscal: ficha.domicilio_fiscal || '',
        nombre_representante_legal: ficha.nombre_representante_legal || ''
      });
    }
    setMode(initialMode);
  }, [ficha, initialMode]);

  const handleInputChange = (field: keyof FichaRucUpdate, value: string) => {
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
    if (!ficha) return;

    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);

    try {
      await FichaRucService.update(ficha.id, formData);
      dismissToast(loadingToast);
      showSuccess('Ficha RUC actualizada exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error actualizando ficha RUC: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado?: string) => {
    if (!estado) return null;
    
    const isActive = estado.toLowerCase().includes('activo');
    return (
      <Badge 
        className={
          isActive 
            ? 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20' 
            : 'bg-gray-800 text-gray-300 border border-gray-700'
        }
      >
        {estado}
      </Badge>
    );
  };

  if (!ficha) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#121212] border border-gray-800 text-white">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                <Building2 className="h-6 w-6 text-[#00FF80]" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  {mode === 'view' ? 'Ver' : 'Editar'} Ficha RUC
                </span>
                <div className="text-sm text-gray-400 font-mono">
                  RUC: {ficha.ruc}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && mode === 'view' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('edit')}
                  className="border-gray-700 text-gray-300 hover:bg-[#00FF80]/10 hover:text-[#00FF80] hover:border-[#00FF80]/30"
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

        <Tabs defaultValue="general" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900/50">
            <TabsTrigger value="general" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
              <Building2 className="h-4 w-4 mr-2" />
              Información General
            </TabsTrigger>
            <TabsTrigger value="cuentas" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
              <CreditCard className="h-4 w-4 mr-2" />
              Cuentas Bancarias
            </TabsTrigger>
            <TabsTrigger value="accionistas" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
              <Users className="h-4 w-4 mr-2" />
              Accionistas
            </TabsTrigger>
            <TabsTrigger value="gerencia" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
              <Briefcase className="h-4 w-4 mr-2" />
              Gerencia
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center text-white">
                  <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Información Básica
                </h3>

                <div>
                  <Label htmlFor="nombre_empresa" className="text-gray-300">Nombre de la Empresa *</Label>
                  {isReadOnly ? (
                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                      <span className="font-medium text-white">{ficha.nombre_empresa}</span>
                    </div>
                  ) : (
                    <Input
                      id="nombre_empresa"
                      value={formData.nombre_empresa || ''}
                      onChange={(e) => handleInputChange('nombre_empresa', e.target.value)}
                      placeholder="Nombre completo de la empresa"
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="ruc" className="text-gray-300">RUC *</Label>
                  {isReadOnly ? (
                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                      <span className="font-mono font-medium text-white">{ficha.ruc}</span>
                    </div>
                  ) : (
                    <Input
                      id="ruc"
                      value={formData.ruc || ''}
                      onChange={(e) => handleInputChange('ruc', e.target.value)}
                      placeholder="20123456789"
                      maxLength={11}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50 font-mono"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="actividad_empresa" className="text-gray-300">Actividad Empresarial</Label>
                  {isReadOnly ? (
                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md min-h-[80px] border border-gray-800">
                      <span className="text-white">{ficha.actividad_empresa || 'No especificada'}</span>
                    </div>
                  ) : (
                    <Textarea
                      id="actividad_empresa"
                      value={formData.actividad_empresa || ''}
                      onChange={(e) => handleInputChange('actividad_empresa', e.target.value)}
                      placeholder="Descripción de la actividad económica principal"
                      rows={3}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="estado_contribuyente" className="text-gray-300">Estado del Contribuyente</Label>
                  {isReadOnly ? (
                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                      {getEstadoBadge(ficha.estado_contribuyente)}
                    </div>
                  ) : (
                    <Select
                      value={formData.estado_contribuyente || ''}
                      onValueChange={(value) => handleInputChange('estado_contribuyente', value)}
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-gray-800">
                        <SelectItem value="Activo" className="text-white hover:bg-gray-800">Activo</SelectItem>
                        <SelectItem value="Inactivo" className="text-white hover:bg-gray-800">Inactivo</SelectItem>
                        <SelectItem value="Suspendido" className="text-white hover:bg-gray-800">Suspendido</SelectItem>
                        <SelectItem value="Baja de Oficio" className="text-white hover:bg-gray-800">Baja de Oficio</SelectItem>
                        <SelectItem value="Baja Provisional" className="text-white hover:bg-gray-800">Baja Provisional</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center text-white">
                  <MapPin className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Información Adicional
                </h3>

                <div>
                  <Label htmlFor="fecha_inicio_actividades" className="text-gray-300">Fecha de Inicio de Actividades</Label>
                  {isReadOnly ? (
                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md flex items-center border border-gray-800">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-white">
                        {ficha.fecha_inicio_actividades 
                          ? new Date(ficha.fecha_inicio_actividades).toLocaleDateString('es-ES')
                          : 'No especificada'
                        }
                      </span>
                    </div>
                  ) : (
                    <Input
                      id="fecha_inicio_actividades"
                      type="date"
                      value={formData.fecha_inicio_actividades || ''}
                      onChange={(e) => handleInputChange('fecha_inicio_actividades', e.target.value)}
                      className="bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="domicilio_fiscal" className="text-gray-300">Domicilio Fiscal</Label>
                  {isReadOnly ? (
                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md min-h-[80px] border border-gray-800">
                      <span className="text-white">{ficha.domicilio_fiscal || 'No especificado'}</span>
                    </div>
                  ) : (
                    <Textarea
                      id="domicilio_fiscal"
                      value={formData.domicilio_fiscal || ''}
                      onChange={(e) => handleInputChange('domicilio_fiscal', e.target.value)}
                      placeholder="Dirección completa del domicilio fiscal"
                      rows={3}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="nombre_representante_legal" className="text-gray-300">Representante Legal</Label>
                  {isReadOnly ? (
                    <div className="mt-1 p-3 bg-gray-900/50 rounded-md flex items-center border border-gray-800">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-white">{ficha.nombre_representante_legal || 'No especificado'}</span>
                    </div>
                  ) : (
                    <Input
                      id="nombre_representante_legal"
                      value={formData.nombre_representante_legal || ''}
                      onChange={(e) => handleInputChange('nombre_representante_legal', e.target.value)}
                      placeholder="Nombre completo del representante legal"
                      className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                    />
                  )}
                </div>

                {/* Información de Auditoría */}
                <div className="pt-4 border-t border-gray-800">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Información de Registro</h4>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      <strong>Creado:</strong> {new Date(ficha.created_at).toLocaleString('es-ES')}
                    </div>
                    <div>
                      <strong>Actualizado:</strong> {new Date(ficha.updated_at).toLocaleString('es-ES')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cuentas" className="py-6">
            <CuentasBancariasManager ruc={ficha.ruc} readonly={isReadOnly} />
          </TabsContent>

          <TabsContent value="accionistas" className="py-6">
            <AccionistaManager ruc={ficha.ruc} readonly={isReadOnly} />
          </TabsContent>

          <TabsContent value="gerencia" className="py-6">
            <GerenciaManager ruc={ficha.ruc} readonly={isReadOnly} />
          </TabsContent>
        </Tabs>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>
          {isAdmin && mode === 'edit' && (
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FichaRucModal;