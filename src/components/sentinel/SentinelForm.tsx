import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Sentinel } from '@/types/sentinel';
import { SentinelService } from '@/services/sentinelService';
import { showSuccess, showError } from '@/utils/toast';

interface SentinelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sentinel: Sentinel | null;
}

const SentinelForm: React.FC<SentinelFormProps> = ({ isOpen, onClose, onSuccess, sentinel }) => {
  const [ruc, setRuc] = useState('');
  const [status, setStatus] = useState('Borrador');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sentinel) {
      setRuc(sentinel.ruc);
      setStatus(sentinel.status || 'Borrador');
    } else {
      setRuc('');
      setStatus('Borrador');
    }
  }, [sentinel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ruc.length !== 11) {
      showError('El RUC debe tener 11 dígitos.');
      return;
    }
    setIsSaving(true);
    try {
      const data = { ruc, status };
      if (sentinel) {
        await SentinelService.update(sentinel.id, data);
        showSuccess('Documento Sentinel actualizado correctamente.');
      } else {
        await SentinelService.create(data);
        showSuccess('Documento Sentinel creado correctamente.');
      }
      onSuccess();
    } catch (error) {
      showError('Error al guardar el documento.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>{sentinel ? 'Editar' : 'Añadir'} Documento Sentinel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                maxLength={11}
                className="bg-gray-900/50 border-gray-700"
                placeholder="Ingrese 11 dígitos"
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-gray-900/50 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-gray-800 text-white">
                  <SelectItem value="Borrador">Borrador</SelectItem>
                  <SelectItem value="Procesado">Procesado</SelectItem>
                  <SelectItem value="Error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700 text-gray-300">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SentinelForm;