import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit, Trash2, Loader2, Save, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/integrations/supabase/client';
import { SolicitudOperacionExpInt, SolicitudOperacionExpIntInsert, SolicitudOperacionExpIntUpdate } from '@/types/solicitudOperacionExpInt';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import { format, differenceInDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface ExperienciaPagoManagerProps {
  comportamientoCrediticioId: string | undefined;
  disabled: boolean;
}

const ExperienciaPagoManager: React.FC<ExperienciaPagoManagerProps> = ({ comportamientoCrediticioId, disabled }) => {
  const { isAdmin } = useSession();
  const [experiencias, setExperiencias] = useState<SolicitudOperacionExpInt[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentExp, setCurrentExp] = useState<Partial<SolicitudOperacionExpInt> | null>(null);
  const [saving, setSaving] = useState(false);
  const [tipoCambio, setTipoCambio] = useState(3.75);
  const [comentarios, setComentarios] = useState('');
  const [isComentariosDirty, setIsComentariosDirty] = useState(false);
  const [savingComentarios, setSavingComentarios] = useState(false);

  // State for date pickers
  const [fechaOtorgamiento, setFechaOtorgamiento] = useState<Date | undefined>();
  const [fechaVencimiento, setFechaVencimiento] = useState<Date | undefined>();
  const [fechaPago, setFechaPago] = useState<Date | undefined>();

  const fetchExperiencias = useCallback(async () => {
    if (!comportamientoCrediticioId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitud_operacion_exp_int')
        .select('*')
        .eq('comportamiento_crediticio_id', comportamientoCrediticioId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setExperiencias(data || []);

      const { data: parentReport, error: parentError } = await supabase
        .from('comportamiento_crediticio')
        .select('deudor_comentarios')
        .eq('id', comportamientoCrediticioId)
        .single();
      if (parentError) throw parentError;
      if (parentReport) {
        setComentarios(parentReport.deudor_comentarios || '');
      }

    } catch (error) {
      showError('Error al cargar la experiencia de pago.');
    } finally {
      setLoading(false);
    }
  }, [comportamientoCrediticioId]);

  useEffect(() => {
    fetchExperiencias();
  }, [fetchExperiencias]);

  const resetForm = () => {
    setCurrentExp(null);
    setFechaOtorgamiento(undefined);
    setFechaVencimiento(undefined);
    setFechaPago(undefined);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (exp: SolicitudOperacionExpInt) => {
    setCurrentExp(exp);
    setFechaOtorgamiento(exp.fecha_otorgamiento ? new Date(`${exp.fecha_otorgamiento}T00:00:00`) : undefined);
    setFechaVencimiento(exp.fecha_vencimiento ? new Date(`${exp.fecha_vencimiento}T00:00:00`) : undefined);
    setFechaPago(exp.fecha_pago ? new Date(`${exp.fecha_pago}T00:00:00`) : undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        const { error } = await supabase.from('solicitud_operacion_exp_int').delete().eq('id', id);
        if (error) throw error;
        showSuccess('Registro eliminado.');
        fetchExperiencias();
      } catch (error) {
        showError('Error al eliminar el registro.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comportamientoCrediticioId) return;
    setSaving(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const dataToSave = {
      deudor: formData.get('deudor') as string,
      moneda: formData.get('moneda') as string,
      monto: parseFloat(formData.get('monto') as string),
      fecha_otorgamiento: fechaOtorgamiento ? format(fechaOtorgamiento, 'yyyy-MM-dd') : null,
      fecha_vencimiento: fechaVencimiento ? format(fechaVencimiento, 'yyyy-MM-dd') : null,
      fecha_pago: fechaPago ? format(fechaPago, 'yyyy-MM-dd') : null,
    };

    try {
      if (currentExp?.id) {
        const { error } = await supabase
          .from('solicitud_operacion_exp_int')
          .update(dataToSave as SolicitudOperacionExpIntUpdate)
          .eq('id', currentExp.id);
        if (error) throw error;
        showSuccess('Registro actualizado.');
      } else {
        const { error } = await supabase
          .from('solicitud_operacion_exp_int')
          .insert({ ...dataToSave, comportamiento_crediticio_id: comportamientoCrediticioId } as SolicitudOperacionExpIntInsert);
        if (error) throw error;
        showSuccess('Registro creado.');
      }
      setDialogOpen(false);
      fetchExperiencias();
    } catch (error) {
      showError('Error al guardar el registro.');
    } finally {
      setSaving(false);
    }
  };

  const calcularDiasAtraso = (fechaVencimientoStr: string | null, fechaPagoStr: string | null): number | string => {
    if (!fechaVencimientoStr) return '-';
    const fechaVencimiento = new Date(`${fechaVencimientoStr}T00:00:00`);
    if (fechaPagoStr) {
      const fechaPago = new Date(`${fechaPagoStr}T00:00:00`);
      const dias = differenceInDays(fechaPago, fechaVencimiento);
      return dias > 0 ? dias : 0;
    } else {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (hoy > fechaVencimiento) {
        return differenceInDays(hoy, fechaVencimiento);
      }
      return 0;
    }
  };

  const totales = useMemo(() => {
    const totalSoles = experiencias.reduce((acc, exp) => (exp.moneda === 'Soles' && exp.monto ? acc + exp.monto : acc), 0);
    const totalDolares = experiencias.reduce((acc, exp) => (exp.moneda === 'Dólares' && exp.monto ? acc + exp.monto : acc), 0);
    return { totalSoles, totalDolares };
  }, [experiencias]);

  const handleComentariosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComentarios(e.target.value);
    setIsComentariosDirty(true);
  };

  const handleSaveComentarios = async () => {
      if (!comportamientoCrediticioId) return;
      setSavingComentarios(true);
      try {
          const { error } = await supabase
              .from('comportamiento_crediticio')
              .update({ deudor_comentarios: comentarios })
              .eq('id', comportamientoCrediticioId);
          if (error) throw error;
          showSuccess('Comentarios guardados.');
          setIsComentariosDirty(false);
      } catch (error) {
          showError('Error al guardar los comentarios.');
      } finally {
          setSavingComentarios(false);
      }
  };

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Experiencia Interna de pago</CardTitle>
        {isAdmin && (
          <Button onClick={handleAddNew} disabled={disabled} size="sm" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {disabled && (
          <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-300 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Guarde el reporte principal para poder agregar la experiencia de pago.</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" /></div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-800/20">
                  <TableHead className="text-gray-300">Deudor</TableHead>
                  <TableHead className="text-gray-300">F. Otorgamiento</TableHead>
                  <TableHead className="text-gray-300">F. Vencimiento</TableHead>
                  <TableHead className="text-gray-300">Moneda</TableHead>
                  <TableHead className="text-gray-300">Monto</TableHead>
                  <TableHead className="text-gray-300">F. Pago</TableHead>
                  <TableHead className="text-gray-300">Días Atraso</TableHead>
                  <TableHead className="text-right text-gray-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiencias.length > 0 ? (
                  experiencias.map((exp) => {
                    const diasAtraso = calcularDiasAtraso(exp.fecha_vencimiento, exp.fecha_pago);
                    return (
                      <TableRow key={exp.id} className="border-gray-800 hover:bg-gray-800/20">
                        <TableCell>{exp.deudor}</TableCell>
                        <TableCell>{exp.fecha_otorgamiento ? format(new Date(`${exp.fecha_otorgamiento}T00:00:00`), 'dd/MM/yyyy') : '-'}</TableCell>
                        <TableCell>{exp.fecha_vencimiento ? format(new Date(`${exp.fecha_vencimiento}T00:00:00`), 'dd/MM/yyyy') : '-'}</TableCell>
                        <TableCell>{exp.moneda}</TableCell>
                        <TableCell>{exp.monto ? exp.monto.toLocaleString('es-PE', { style: 'currency', currency: exp.moneda === 'Soles' ? 'PEN' : 'USD' }) : '-'}</TableCell>
                        <TableCell>{exp.fecha_pago ? format(new Date(`${exp.fecha_pago}T00:00:00`), 'dd/MM/yyyy') : '-'}</TableCell>
                        <TableCell>{diasAtraso}</TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(exp)} className="text-gray-400 hover:text-white"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">No hay registros de experiencia de pago.</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="border-gray-800 font-bold text-white hover:bg-gray-800/20">
                  <TableCell colSpan={4} className="text-right">Totales:</TableCell>
                  <TableCell>
                    <div>{totales.totalSoles.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}</div>
                    <div>{totales.totalDolares.toLocaleString('es-PE', { style: 'currency', currency: 'USD' })}</div>
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="mt-6 pt-4 border-t border-gray-800">
              <Label htmlFor="experiencia-comentarios" className="text-gray-300 font-medium">Comentarios</Label>
              <Textarea
                id="experiencia-comentarios"
                value={comentarios}
                onChange={handleComentariosChange}
                placeholder="Comentar en resumen sobre la experiencia del deudor propuesto (número de documentos cancelados, monto total en soles y/o dólares). Si el histórico es muy extenso, detallar sólo los cancelados del último año, pero en el resumen si comentar la experiencia total"
                className="bg-gray-900/50 border-gray-700 mt-2 min-h-[100px]"
                disabled={disabled || !isAdmin}
              />
              {isAdmin && isComentariosDirty && (
                <div className="flex justify-end mt-2">
                  <Button onClick={handleSaveComentarios} disabled={savingComentarios} size="sm" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                    {savingComentarios ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Comentarios
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1e1e1e] border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{currentExp?.id ? 'Editar' : 'Agregar'} Experiencia de Pago</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="deudor">Deudor</Label>
              <Input id="deudor" name="deudor" defaultValue={currentExp?.deudor || ''} className="bg-gray-900/50 border-gray-700" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_otorgamiento">Fecha de Otorgamiento</Label>
                <DatePicker date={fechaOtorgamiento} setDate={setFechaOtorgamiento} />
              </div>
              <div>
                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                <DatePicker date={fechaVencimiento} setDate={setFechaVencimiento} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="moneda">Moneda</Label>
                <Select name="moneda" defaultValue={currentExp?.moneda || ''}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue placeholder="Seleccione" /></SelectTrigger>
                  <SelectContent><SelectItem value="Soles">Soles</SelectItem><SelectItem value="Dólares">Dólares</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="monto">Monto</Label>
                <Input id="monto" name="monto" type="number" step="0.01" defaultValue={currentExp?.monto || ''} className="bg-gray-900/50 border-gray-700" />
              </div>
            </div>
            <div>
              <Label htmlFor="fecha_pago">Fecha de Pago</Label>
              <DatePicker date={fechaPago} setDate={setFechaPago} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={saving} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExperienciaPagoManager;