import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Users, Calendar, MapPin, User, Building2, CreditCard } from 'lucide-react';
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
import { RepresentanteLegalWithFicha, RepresentanteLegalUpdate } from '@/types/representante-legal';
import { RepresentanteLegalService } from '@/services/representanteLegalService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface RepresentanteLegalModalProps {
  representante: RepresentanteLegalWithFicha | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const RepresentanteLegalModal: React.FC<RepresentanteLegalModalProps> = ({
  representante,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<RepresentanteLegalUpdate>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (representante) {
      setFormData({
        nombre_completo: representante.nombre_completo,
        numero_documento_identidad: representante.numero_documento_identidad,
        cargo: representante.cargo || '',
        vigencia_poderes: representante.vigencia_poderes || '',
        estado_civil: representante.estado_civil || '',
        domicilio: representante.domicilio || ''
      });
    }
    setMode(initialMode);
  }, [representante, initialMode]);

  const handleInputChange = (field: keyof RepresentanteLegalUpdate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!representante) return;

    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);

    try {
      await RepresentanteLegalService.update(representante.id, formData);
      dismissToast(loadingToast);
      showSuccess('Representante legal actualizado exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error actualizando representante legal: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeBadge = (documento: string) => {
    const isDNI = documento.length === 8 && /^\d+$/.test(documento);
    const isCE = documento.length > 8;
    
    return (
      <Badge 
        className={
          isDNI 
            ? 'bg-[#00FF80]/10 text-[#00FF80] border border-[#00FF80]/20' 
            : isCE 
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            : 'bg-gray-800 text-gray-300 border border-gray-700'
        }
      >
        {isDNI ? 'DNI' : isCE ? 'CE' : 'DOC'}
      </Badge>
    );
  };

  if (!representante) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121212] border border-gray-800 text-white">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#00FF80]/10 rounded-lg border border-[#00FF80]/20">
                <Users className="h-6 w-6 text-[#00FF80]" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  {mode === 'view' ? 'Ver' : 'Editar'} Representante Legal
                </span>
                <div className="text-sm text-gray-400">
                  {representante.nombre_completo}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('edit')}
                  className="border-gray-700 text-gray-300 hover:bg-[#00FF80]/10 hover:text-[#00FF80] hover:border-[#00FF80]/30"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('view')}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center text-white">
              <User className="h-5 w-5 mr-2 text-[#00FF80]" />
              Información Personal
            </h3>

            <div>
              <Label htmlFor="nombre_completo" className="text-gray-300">Nombre Completo *</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                  <span className="font-medium text-white">{representante.nombre_completo}</span>
                </div>
              ) : (
                <Input
                  id="nombre_completo"
                  value={formData.nombre_completo || ''}
                  onChange={(e) => handleInputChange('nombre_completo', e.target.value)}
                  placeholder="Nombre completo del representante"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                />
              )}
            </div>

            <div>
              <Label htmlFor="numero_documento_identidad" className="text-gray-300">Documento de Identidad *</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-900/50 rounded-md flex items-center space-x-2 border border-gray-800">
                  <span className="font-mono font-medium text-white">{representante.numero_documento_identidad}</span>
                  {getDocumentTypeBadge(representante.numero_documento_identidad)}
                </div>
              ) : (
                <Input
                  id="numero_documento_identidad"
                  value={formData.numero_documento_identidad || ''}
                  onChange={(e) => handleInputChange('numero_documento_identidad', e.target.value)}
                  placeholder="DNI, CE u otro documento"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50 font-mono"
                />
              )}
            </div>

            <div>
              <Label htmlFor="estado_civil" className="text-gray-300">Estado Civil</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                  <span className="text-white">{representante.estado_civil || 'No especificado'}</span>
                </div>
              ) : (
                <Select
                  value={formData.estado_civil || ''}
                  onValueChange={(value) => handleInputChange('estado_civil', value)}
                >
                  <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
                    <SelectValue placeholder="Seleccionar estado civil" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-gray-800">
                    <SelectItem value="Soltero(a)" className="text-white hover:bg-gray-800">Soltero(a)</SelectItem>
                    <SelectItem value="Casado(a)" className="text-white hover:bg-gray-800">Casado(a)</SelectItem>
                    <SelectItem value="Divorciado(a)" className="text-white hover:bg-gray-800">Divorciado(a)</SelectItem>
                    <SelectItem value="Viudo(a)" className="text-white hover:bg-gray-800">Viudo(a)</SelectItem>
                    <SelectItem value="Conviviente" className="text-white hover:bg-gray-800">Conviviente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="domicilio" className="text-gray-300">Domicilio</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-900/50 rounded-md min-h-[80px] border border-gray-800">
                  <span className="text-white">{representante.domicilio || 'No especificado'}</span>
                </div>
              ) : (
                <Textarea
                  id="domicilio"
                  value={formData.domicilio || ''}
                  onChange={(e) => handleInputChange('domicilio', e.target.value)}
                  placeholder="Dirección completa del domicilio"
                  rows={3}
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                />
              )}
            </div>
          </div>

          {/* Información Empresarial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center text-white">
              <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
              Información Empresarial
            </h3>

            <div>
              <Label htmlFor="cargo" className="text-gray-300">Cargo</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                  <span className="text-white">{representante.cargo || 'No especificado'}</span>
                </div>
              ) : (
                <Input
                  id="cargo"
                  value={formData.cargo || ''}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  placeholder="Gerente General, Administrador, etc."
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                />
              )}
            </div>

            <div>
              <Label htmlFor="vigencia_poderes" className="text-gray-300">Vigencia de Poderes</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-900/50 rounded-md border border-gray-800">
                  <span className="text-white">{representante.vigencia_poderes || 'No especificada'}</span>
                </div>
              ) : (
                <Input
                  id="vigencia_poderes"
                  value={formData.vigencia_poderes || ''}
                  onChange={(e) => handleInputChange('vigencia_poderes', e.target.value)}
                  placeholder="Vigencia de los poderes otorgados"
                  className="bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
                />
              )}
            </div>

            {/* Empresa Asociada */}
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                Empresa Asociada
              </h4>
              <div className="bg-[#00FF80]/10 p-4 rounded-lg border border-[#00FF80]/20">
                <div className="font-medium text-[#00FF80]">
                  {representante.ficha_ruc?.nombre_empresa || 'N/A'}
                </div>
                <div className="text-sm text-gray-300 font-mono">
                  RUC: {representante.ficha_ruc?.ruc || 'N/A'}
                </div>
              </div>
            </div>

            {/* Información de Auditoría */}
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Información de Registro</h4>
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  <strong>Creado:</strong> {new Date(representante.created_at).toLocaleString('es-ES')}
                </div>
                <div>
                  <strong>Actualizado:</strong> {new Date(representante.updated_at).toLocaleString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Cancelar
          </Button>
          {mode === 'edit' && (
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

export default RepresentanteLegalModal;