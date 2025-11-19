import React, { useState, useEffect } from 'react';
import { Save, User, CreditCard, Briefcase } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gerente, GerenteInsert, GerenteUpdate } from '@/types/gerencia';

interface GerenteModalProps {
  gerente: Gerente | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: GerenteInsert | GerenteUpdate) => void;
  loading: boolean;
  readonly?: boolean;
}

const GerenteModal: React.FC<GerenteModalProps> = ({ gerente, isOpen, onClose, onSave, loading, readonly = false }) => {
  const [formData, setFormData] = useState<GerenteInsert | GerenteUpdate>({
    nombre: '',
    dni: '',
    cargo: '',
    vinculo: '',
    calificacion: '',
    comentario: '',
    ruc: ''
  });

  useEffect(() => {
    if (gerente) {
      setFormData(gerente);
    } else {
      setFormData({
        nombre: '',
        dni: '',
        cargo: '',
        vinculo: '',
        calificacion: '',
        comentario: '',
        ruc: ''
      });
    }
  }, [gerente]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (readonly) return;
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Briefcase className="text-[#00FF80]" />
            <span>{readonly ? 'Ver Gerente' : (gerente ? 'Editar Gerente' : 'Agregar Nuevo Gerente')}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input id="nombre" value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={readonly} />
            </div>
            <div>
              <Label htmlFor="dni">DNI *</Label>
              <Input id="dni" value={formData.dni} onChange={e => handleInputChange('dni', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={readonly} />
            </div>
          </div>
          <div>
            <Label htmlFor="cargo">Cargo *</Label>
            <Input id="cargo" value={formData.cargo || ''} onChange={e => handleInputChange('cargo', e.target.value)} placeholder="Ej: Gerente General" className="bg-gray-900/50 border-gray-700" disabled={readonly} />
          </div>
          <div>
            <Label htmlFor="vinculo">Vínculo</Label>
            <Input id="vinculo" value={formData.vinculo || ''} onChange={e => handleInputChange('vinculo', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={readonly} />
          </div>
          <div>
            <Label htmlFor="calificacion">Calificación</Label>
            <Input id="calificacion" value={formData.calificacion || ''} onChange={e => handleInputChange('calificacion', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={readonly} />
          </div>
          <div>
            <Label htmlFor="comentario">Comentario</Label>
            <Textarea id="comentario" value={formData.comentario || ''} onChange={e => handleInputChange('comentario', e.target.value)} className="bg-gray-900/50 border-gray-700" disabled={readonly} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300">{readonly ? 'Cerrar' : 'Cancelar'}</Button>
          {!readonly && (
            <Button onClick={handleSubmit} disabled={loading} className="bg-[#00FF80] text-black hover:bg-[#00FF80]/90">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GerenteModal;