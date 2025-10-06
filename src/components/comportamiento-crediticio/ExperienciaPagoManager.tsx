import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExperienciaPagoInterna, ExperienciaPagoInternaInsert, ExperienciaPagoInternaUpdate } from '@/types/experienciaPagoInterna';
import { ExperienciaPagoInternaService } from '@/services/experienciaPagoInternaService';
import { toast } from 'sonner';
import { differenceInDays, parseISO } from 'date-fns';
import { useSession } from '@/contexts/SessionContext';

interface ExperienciaPagoManagerProps {
  comportamientoCrediticioId: string;
}

const ExperienciaPagoManager: React.FC<ExperienciaPagoManagerProps> = ({ comportamientoCrediticioId }) => {
  const { isAdmin } = useSession();
  const [experiencias, setExperiencias] = useState<ExperienciaPagoInterna[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperiencia, setEditingExperiencia] = useState<ExperienciaPagoInterna | null>(null);

  const emptyForm: ExperienciaPagoInternaInsert = {
    comportamiento_crediticio_id: comportamientoCrediticioId,
    deudor: '',
    fecha_otorgamiento: '',
    fecha_vencimiento: '',
    moneda: 'PEN',
    fecha_pago: '',
    monto: 0,
  };
  const [formData, setFormData] = useState<ExperienciaPagoInternaInsert | ExperienciaPagoInternaUpdate>(emptyForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await ExperienciaPagoInternaService.getByComportamientoId(comportamientoCrediticioId);
        setExperiencias(data);
      } catch (error) {
        toast.error('Error al cargar la experiencia de pago interna.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [comportamientoCrediticioId]);

  const handleOpenModal = (experiencia: ExperienciaPagoInterna | null = null) => {
    setEditingExperiencia(experiencia);
    if (experiencia) {
      setFormData({
        deudor: experiencia.deudor,
        fecha_otorgamiento: experiencia.fecha_otorgamiento,
        fecha_vencimiento: experiencia.fecha_vencimiento,
        moneda: experiencia.moneda,
        fecha_pago: experiencia.fecha_pago,
        monto: experiencia.monto,
      });
    } else {
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingExperiencia) {
        await ExperienciaPagoInternaService.update(editingExperiencia.id, formData as ExperienciaPagoInternaUpdate);
        toast.success('Experiencia de pago actualizada.');
      } else {
        await ExperienciaPagoInternaService.create(formData as ExperienciaPagoInternaInsert);
        toast.success('Experiencia de pago agregada.');
      }
      const data = await ExperienciaPagoInternaService.getByComportamientoId(comportamientoCrediticioId);
      setExperiencias(data);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar la experiencia de pago.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await ExperienciaPagoInternaService.delete(id);
        toast.success('Registro eliminado.');
        setExperiencias(experiencias.filter(exp => exp.id !== id));
      } catch (error) {
        toast.error('Error al eliminar el registro.');
      }
    }
  };

  const calculateDiasAtraso = (fechaVencimiento: string | null, fechaPago: string | null) => {
    if (!fechaVencimiento || !fechaPago) return '-';
    const dias = differenceInDays(parseISO(fechaPago), parseISO(fechaVencimiento));
    return dias > 0 ? dias : 0;
  };

  const totalMontoSoles = useMemo(() => {
    return experiencias
      .filter(exp => exp.moneda === 'PEN' && exp.monto)
      .reduce((sum, exp) => sum + (exp.monto || 0), 0);
  }, [experiencias]);

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Experiencia Interna de pago (Del deudor)</CardTitle>
          {isAdmin && (
            <Button onClick={() => handleOpenModal()} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-300">Deudor</TableHead>
              <TableHead className="text-gray-300">F. Otorg.</TableHead>
              <TableHead className="text-gray-300">F. Venc.</TableHead>
              <TableHead className="text-gray-300">Moneda</TableHead>
              <TableHead className="text-gray-300">F. Pago</TableHead>
              <TableHead className="text-gray-300">Monto</TableHead>
              <TableHead className="text-gray-300">Días Atraso</TableHead>
              {isAdmin && <TableHead className="text-right text-gray-300">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-gray-400">Cargando...</TableCell></TableRow>
            ) : experiencias.length === 0 ? (
              <TableRow><TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-gray-400">No hay registros.</TableCell></TableRow>
            ) : (
              experiencias.map(exp => (
                <TableRow key={exp.id} className="border-gray-800">
                  <TableCell>{exp.deudor}</TableCell>
                  <TableCell>{exp.fecha_otorgamiento ? new Date(exp.fecha_otorgamiento).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{exp.fecha_vencimiento ? new Date(exp.fecha_vencimiento).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{exp.moneda}</TableCell>
                  <TableCell>{exp.fecha_pago ? new Date(exp.fecha_pago).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{exp.monto?.toLocaleString('es-PE', { style: 'currency', currency: exp.moneda || 'PEN' })}</TableCell>
                  <TableCell>{calculateDiasAtraso(exp.fecha_vencimiento, exp.fecha_pago)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(exp)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="border-gray-800 font-bold text-white">
              <TableCell colSpan={5} className="text-right">Total (Soles)</TableCell>
              <TableCell>{totalMontoSoles.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</TableCell>
              <TableCell colSpan={isAdmin ? 2 : 1}></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#121212] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingExperiencia ? 'Editar' : 'Agregar'} Experiencia de Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deudor</Label>
                <Input value={formData.deudor || ''} onChange={e => setFormData({...formData, deudor: e.target.value})} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label>Monto</Label>
                <Input type="number" value={formData.monto || ''} onChange={e => setFormData({...formData, monto: parseFloat(e.target.value) || 0})} className="bg-gray-900/50 border-gray-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Moneda</Label>
                <Select value={formData.moneda || 'PEN'} onValueChange={value => setFormData({...formData, moneda: value})}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="PEN">PEN</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Fecha Otorgamiento</Label>
                <Input type="date" value={formData.fecha_otorgamiento || ''} onChange={e => setFormData({...formData, fecha_otorgamiento: e.target.value})} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label>Fecha Vencimiento</Label>
                <Input type="date" value={formData.fecha_vencimiento || ''} onChange={e => setFormData({...formData, fecha_vencimiento: e.target.value})} className="bg-gray-900/50 border-gray-700" />
              </div>
              <div>
                <Label>Fecha Pago</Label>
                <Input type="date" value={formData.fecha_pago || ''} onChange={e => setFormData({...formData, fecha_pago: e.target.value})} className="bg-gray-900/50 border-gray-700" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExperienciaPagoManager;