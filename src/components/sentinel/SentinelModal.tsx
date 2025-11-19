import React, { useState, useEffect } from 'react';
import { Shield, Save, Eye, Edit, Calendar, User, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sentinel, UpdateSentinelData } from '@/services/sentinelService';
import { SentinelService } from '@/services/sentinelService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import SentinelAuditLogViewer from '@/components/audit/SentinelAuditLogViewer';

interface SentinelModalProps {
  sentinel: Sentinel | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const SentinelModal: React.FC<SentinelModalProps> = ({
  sentinel,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const { isAdmin } = useSession();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<UpdateSentinelData>({});
  const [loading, setLoading] = useState(false);

  const isReadOnly = mode === 'view' || !isAdmin;

  useEffect(() => {
    if (sentinel) {
      setFormData({
        ruc: sentinel.ruc,
        score: sentinel.score || '',
        comportamiento_calificacion: sentinel.comportamiento_calificacion || '',
        deuda_directa: sentinel.deuda_directa || undefined,
        deuda_indirecta: sentinel.deuda_indirecta || undefined,
        impagos: sentinel.impagos || undefined,
        deudas_sunat: sentinel.deudas_sunat || undefined,
        protestos: sentinel.protestos || undefined,
      });
    }
    setMode(initialMode);
  }, [sentinel, initialMode]);

  const handleInputChange = (field: keyof UpdateSentinelData, value: string | number) => {
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
    if (!sentinel) return;

    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);

    try {
      const dataToUpdate = {
        ...formData,
        deuda_directa: typeof formData.deuda_directa === 'string' ? parseFloat(formData.deuda_directa) || null : formData.deuda_directa,
        deuda_indirecta: typeof formData.deuda_indirecta === 'string' ? parseFloat(formData.deuda_indirecta) || null : formData.deuda_indirecta,
        impagos: typeof formData.impagos === 'string' ? parseFloat(formData.impagos) || null : formData.impagos,
        deudas_sunat: typeof formData.deudas_sunat === 'string' ? parseFloat(formData.deudas_sunat) || null : formData.deudas_sunat,
        protestos: typeof formData.protestos === 'string' ? parseFloat(formData.protestos) || null : formData.protestos,
      };
      await SentinelService.update(sentinel.id, dataToUpdate);
      dismissToast(loadingToast);
      showSuccess('Documento Sentinel actualizado exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error actualizando documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (amount === null || amount === undefined) return 'S/ 0';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!sentinel) return null;

  const formFields = [
    { id: 'deuda_directa', label: 'Deuda Directa' },
    { id: 'deuda_indirecta', label: 'Deuda Indirecta' },
    { id: 'impagos', label: 'Impagos' },
    { id: 'deudas_sunat', label: 'Deudas SUNAT' },
    { id: 'protestos', label: 'Protestos' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] border-gray-800 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-[#00FF80]" />
              <div>
                <span className="text-xl font-bold">
                  {isReadOnly ? 'Ver' : 'Editar'} Documento Sentinel
                </span>
                <div className="text-sm text-gray-400 font-mono">
                  RUC: {sentinel.ruc}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SentinelAuditLogViewer sentinelId={sentinel.id} />
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

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score" className="text-gray-300">Score / Calificación</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md">{sentinel.score || 'N/A'}</div> : <Input id="score" value={formData.score || ''} onChange={(e) => handleInputChange('score', e.target.value)} className="bg-gray-900/50 border-gray-700" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comportamiento_calificacion" className="text-gray-300">Calificación del Comportamiento</Label>
              {isReadOnly ? <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md">{sentinel.comportamiento_calificacion || 'N/A'}</div> : <Input id="comportamiento_calificacion" value={formData.comportamiento_calificacion || ''} onChange={(e) => handleInputChange('comportamiento_calificacion', e.target.value)} className="bg-gray-900/50 border-gray-700" />}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            {formFields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-gray-300">{field.label}</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md font-mono">
                    {formatCurrency(sentinel[field.id as keyof Sentinel] as number | null)}
                  </div>
                ) : (
                  <Input 
                    id={field.id} 
                    type="number" 
                    step="0.01" 
                    value={formData[field.id as keyof UpdateSentinelData] as string || ''} 
                    onChange={(e) => handleInputChange(field.id as keyof UpdateSentinelData, e.target.value)} 
                    className="bg-gray-900/50 border-gray-700" 
                  />
                )}
              </div>
            ))}
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

export default SentinelModal;