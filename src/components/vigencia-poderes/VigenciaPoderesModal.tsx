import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Edit, Scale, Calendar, Users, Building2, FileText } from 'lucide-react';
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
import { VigenciaPoderesWithRepresentante, VigenciaPoderesUpdate } from '@/types/vigencia-poderes';
import { VigenciaPoderesService } from '@/services/vigenciaPoderesService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface VigenciaPoderesModalProps {
  vigencia: VigenciaPoderesWithRepresentante | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const VigenciaPoderesModal: React.FC<VigenciaPoderesModalProps> = ({
  vigencia,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<VigenciaPoderesUpdate>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vigencia) {
      setFormData({
        fecha_inicio_vigencia: vigencia.fecha_inicio_vigencia || '',
        fecha_fin_vigencia: vigencia.fecha_fin_vigencia || '',
        tipo_poder: vigencia.tipo_poder,
        alcance_poderes: vigencia.alcance_poderes || '',
        estado: vigencia.estado
      });
    }
    setMode(initialMode);
  }, [vigencia, initialMode]);

  const handleInputChange = (field: keyof VigenciaPoderesUpdate, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!vigencia) return;

    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);

    try {
      await VigenciaPoderesService.update(vigencia.id, formData);
      dismissToast(loadingToast);
      showSuccess('Vigencia de poderes actualizada exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error actualizando vigencia de poderes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string, fechaFin?: string) => {
    // Verificar si está próximo a vencer (30 días)
    const isProximoAVencer = fechaFin && estado === 'Vigente' && 
      new Date(fechaFin) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let variant = '';
    switch (estado) {
      case 'Vigente':
        variant = isProximoAVencer 
          ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
          : 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'Vencido':
        variant = 'bg-red-100 text-red-800 border-red-200';
        break;
      case 'Revocado':
        variant = 'bg-gray-100 text-gray-800 border-gray-200';
        break;
      default:
        variant = 'bg-gray-100 text-gray-800 border-gray-200';
    }

    return (
      <Badge className={variant}>
        {isProximoAVencer ? 'Próximo a vencer' : estado}
      </Badge>
    );
  };

  const getTipoPowerBadge = (tipo?: string) => {
    if (!tipo) return null;
    
    const variants = {
      'General': 'bg-blue-50 text-blue-700 border-blue-200',
      'Especial': 'bg-purple-50 text-purple-700 border-purple-200',
      'Administrativo': 'bg-green-50 text-green-700 border-green-200',
      'Judicial': 'bg-orange-50 text-orange-700 border-orange-200',
      'Otros': 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
      <Badge variant="outline" className={variants[tipo as keyof typeof variants] || variants.Otros}>
        {tipo}
      </Badge>
    );
  };

  if (!vigencia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-6 w-6 text-blue-600" />
              <div>
                <span className="text-xl font-bold">
                  {mode === 'view' ? 'Ver' : 'Editar'} Vigencia de Poderes
                </span>
                <div className="text-sm text-gray-500">
                  {vigencia.representante_legal?.nombre_completo || 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('edit')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode('view')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Información del Poder */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Scale className="h-5 w-5 mr-2 text-blue-600" />
              Información del Poder
            </h3>

            <div>
              <Label htmlFor="tipo_poder">Tipo de Poder</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {getTipoPowerBadge(vigencia.tipo_poder)}
                </div>
              ) : (
                <Select
                  value={formData.tipo_poder || ''}
                  onValueChange={(value) => handleInputChange('tipo_poder', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de poder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Especial">Especial</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Judicial">Judicial</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {getEstadoBadge(vigencia.estado, vigencia.fecha_fin_vigencia)}
                </div>
              ) : (
                <Select
                  value={formData.estado || ''}
                  onValueChange={(value) => handleInputChange('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vigente">Vigente</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                    <SelectItem value="Revocado">Revocado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="alcance_poderes">Alcance de los Poderes</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[100px]">
                  <span>{vigencia.alcance_poderes || 'No especificado'}</span>
                </div>
              ) : (
                <Textarea
                  id="alcance_poderes"
                  value={formData.alcance_poderes || ''}
                  onChange={(e) => handleInputChange('alcance_poderes', e.target.value)}
                  placeholder="Firmar contratos, realizar cobros, representar ante entidades, etc."
                  rows={4}
                />
              )}
            </div>
          </div>

          {/* Información de Vigencia */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Información de Vigencia
            </h3>

            <div>
              <Label htmlFor="fecha_inicio_vigencia">Fecha de Inicio de Vigencia</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {vigencia.fecha_inicio_vigencia 
                      ? new Date(vigencia.fecha_inicio_vigencia).toLocaleDateString('es-ES')
                      : 'No especificada'
                    }
                  </span>
                </div>
              ) : (
                <Input
                  id="fecha_inicio_vigencia"
                  type="date"
                  value={formData.fecha_inicio_vigencia || ''}
                  onChange={(e) => handleInputChange('fecha_inicio_vigencia', e.target.value)}
                />
              )}
            </div>

            <div>
              <Label htmlFor="fecha_fin_vigencia">Fecha de Fin de Vigencia</Label>
              {mode === 'view' ? (
                <div className="mt-1 p-3 bg-gray-50 rounded-md flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {vigencia.fecha_fin_vigencia 
                      ? new Date(vigencia.fecha_fin_vigencia).toLocaleDateString('es-ES')
                      : 'No especificada'
                    }
                  </span>
                </div>
              ) : (
                <Input
                  id="fecha_fin_vigencia"
                  type="date"
                  value={formData.fecha_fin_vigencia || ''}
                  onChange={(e) => handleInputChange('fecha_fin_vigencia', e.target.value)}
                />
              )}
            </div>

            {/* Representante Legal Asociado */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                Representante Legal
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="font-medium text-blue-900">
                  {vigencia.representante_legal?.nombre_completo || 'N/A'}
                </div>
                <div className="text-sm text-blue-700">
                  Doc: {vigencia.representante_legal?.numero_documento_identidad || 'N/A'}
                </div>
                {vigencia.representante_legal?.cargo && (
                  <div className="text-sm text-blue-600">
                    Cargo: {vigencia.representante_legal.cargo}
                  </div>
                )}
              </div>
            </div>

            {/* Empresa Asociada */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                Empresa Asociada
              </h4>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="font-medium text-green-900">
                  {vigencia.representante_legal?.ficha_ruc?.nombre_empresa || 'N/A'}
                </div>
                <div className="text-sm text-green-700 font-mono">
                  RUC: {vigencia.representante_legal?.ficha_ruc?.ruc || 'N/A'}
                </div>
              </div>
            </div>

            {/* Información de Auditoría */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información de Registro</h4>
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  <strong>Creado:</strong> {new Date(vigencia.created_at).toLocaleString('es-ES')}
                </div>
                <div>
                  <strong>Actualizado:</strong> {new Date(vigencia.updated_at).toLocaleString('es-ES')}
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
          {mode === 'edit' && (
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

export default VigenciaPoderesModal;