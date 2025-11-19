import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, UserPlus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Accionista, AccionistaInsert, AccionistaUpdate } from '@/types/accionista';
import { AccionistaService } from '@/services/accionistaService';
import { showSuccess, showError } from '@/utils/toast';

interface AccionistaManagerProps {
  ruc: string;
  readonly?: boolean;
}

const AccionistaManager: React.FC<AccionistaManagerProps> = ({ ruc, readonly = false }) => {
  const [accionistas, setAccionistas] = useState<Accionista[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccionista, setEditingAccionista] = useState<Accionista | null>(null);
  const [formData, setFormData] = useState<AccionistaInsert>({
    ruc,
    dni: '',
    nombre: '',
    porcentaje: 0,
    vinculo: '',
    calificacion: '',
    comentario: '',
  });

  useEffect(() => {
    loadAccionistas();
  }, [ruc]);

  const loadAccionistas = async () => {
    try {
      setLoading(true);
      const data = await AccionistaService.getByRuc(ruc);
      setAccionistas(data);
    } catch (error) {
      showError('Error al cargar los accionistas');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ruc,
      dni: '',
      nombre: '',
      porcentaje: 0,
      vinculo: '',
      calificacion: '',
      comentario: '',
    });
    setEditingAccionista(null);
    setShowForm(false);
  };

  const handleEdit = (accionista: Accionista) => {
    setEditingAccionista(accionista);
    setFormData({
      ruc,
      dni: accionista.dni,
      nombre: accionista.nombre,
      porcentaje: accionista.porcentaje || 0,
      vinculo: accionista.vinculo || '',
      calificacion: accionista.calificacion || '',
      comentario: accionista.comentario || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await AccionistaService.delete(id);
      showSuccess('Accionista eliminado');
      await loadAccionistas();
    } catch (error) {
      showError('Error al eliminar el accionista');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readonly) return;
    try {
      if (editingAccionista) {
        const updateData: AccionistaUpdate = { ...formData };
        await AccionistaService.update(editingAccionista.id, updateData);
        showSuccess('Accionista actualizado');
      } else {
        await AccionistaService.create(formData);
        showSuccess('Accionista creado');
      }
      await loadAccionistas();
      resetForm();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al guardar el accionista');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando accionistas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <Users className="h-5 w-5 mr-2 text-[#00FF80]" />
          Accionistas ({accionistas.length})
        </h3>
        {!readonly && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Accionista
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border border-gray-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {readonly ? 'Ver Accionista' : (editingAccionista ? 'Editar Accionista' : 'Nuevo Accionista')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">DNI</Label>
                    <Input value={formData.dni} onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))} required className="bg-gray-900/50 border-gray-700 text-white" disabled={readonly} />
                  </div>
                  <div>
                    <Label className="text-gray-300">Nombre Completo</Label>
                    <Input value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} required className="bg-gray-900/50 border-gray-700 text-white" disabled={readonly} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Porcentaje (%)</Label>
                    <Input type="number" step="0.01" min="0" max="100" value={formData.porcentaje || ''} onChange={(e) => setFormData(prev => ({ ...prev, porcentaje: parseFloat(e.target.value) || 0 }))} className="bg-gray-900/50 border-gray-700 text-white" disabled={readonly} />
                  </div>
                  <div>
                    <Label className="text-gray-300">Vínculo</Label>
                    <Input value={formData.vinculo || ''} onChange={(e) => setFormData(prev => ({ ...prev, vinculo: e.target.value }))} className="bg-gray-900/50 border-gray-700 text-white" disabled={readonly} />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Calificación</Label>
                  <Input value={formData.calificacion || ''} onChange={(e) => setFormData(prev => ({ ...prev, calificacion: e.target.value }))} className="bg-gray-900/50 border-gray-700 text-white" disabled={readonly} />
                </div>
                <div>
                  <Label className="text-gray-300">Comentario</Label>
                  <Textarea value={formData.comentario || ''} onChange={(e) => setFormData(prev => ({ ...prev, comentario: e.target.value }))} className="bg-gray-900/50 border-gray-700 text-white" disabled={readonly} />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="border-gray-700 text-gray-300 hover:bg-gray-800">{readonly ? 'Cerrar' : 'Cancelar'}</Button>
                  {!readonly && <Button type="submit" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">{editingAccionista ? 'Actualizar' : 'Crear'}</Button>}
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-900/50">
                <TableHead className="text-gray-300">DNI</TableHead>
                <TableHead className="text-gray-300">Nombre</TableHead>
                <TableHead className="text-gray-300">Porcentaje</TableHead>
                <TableHead className="text-right text-gray-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accionistas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">No hay accionistas registrados.</TableCell>
                </TableRow>
              ) : (
                accionistas.map(acc => (
                  <TableRow key={acc.id} className="border-gray-800">
                    <TableCell className="font-mono text-white">{acc.dni}</TableCell>
                    <TableCell className="text-white">{acc.nombre}</TableCell>
                    <TableCell className="text-white">{acc.porcentaje}%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(acc)} className="text-gray-400 hover:text-[#00FF80]">
                        {readonly ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                      </Button>
                      {!readonly && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#121212] border border-gray-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">¿Eliminar accionista?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">Esta acción no se puede deshacer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(acc.id)} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccionistaManager;