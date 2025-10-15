import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, XCircle } from 'lucide-react';
import { RibReporteTributarioService, RibReporteTributario } from '@/services/ribReporteTributarioService';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import AsyncSelect from 'react-select/async';

type FormData = {
  solicitud: { value: string; label: string } | null;
  anio: number;
  deudor: Partial<RibReporteTributario>;
  proveedor: Partial<RibReporteTributario>;
};

const formSchema = z.object({
  anio: z.number().min(2000).max(2100),
  solicitud: z.object({
    value: z.string().uuid(),
    label: z.string(),
  }).nullable(),
});

type RibReporteTributarioFormProps = {
  initialData?: {
    deudorReport: Partial<RibReporteTributario> | null;
    proveedorReport: Partial<RibReporteTributario> | null;
  } | null;
  onClose: () => void;
};

const RibReporteTributarioForm: React.FC<RibReporteTributarioFormProps> = ({ initialData, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solicitud: null,
      anio: new Date().getFullYear(),
      deudor: {},
      proveedor: {},
    },
  });

  const solicitud = watch('solicitud');

  useEffect(() => {
    if (initialData) {
      const deudor = initialData.deudorReport;
      const anio = deudor?.anio || new Date().getFullYear();
      setValue('anio', anio);
      setValue('deudor', deudor || {});
      setValue('proveedor', initialData.proveedorReport || {});
      if (deudor?.solicitud_id) {
        // We don't have the label here, so we can't fully populate the AsyncSelect
        // This is a limitation we can address later if needed.
        setValue('solicitud', { value: deudor.solicitud_id, label: `ID: ${deudor.solicitud_id.substring(0,8)}...` });
      }
    }
  }, [initialData, setValue]);

  const searchSolicitudes = async (inputValue: string) => {
    if (!inputValue) return [];
    const { data, error } = await supabase.rpc('search_solicitudes', { search_term: inputValue });
    if (error) {
      console.error(error);
      return [];
    }
    return data || [];
  };

  const onSubmit = async (formData: FormData) => {
    if (!solicitud) {
      showError("Por favor, seleccione una solicitud de operación.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const commonData = {
        solicitud_id: solicitud.value,
        anio: formData.anio,
        user_id: user?.id,
        status: 'Borrador' as const,
      };

      const deudorData = { ...initialData?.deudorReport, ...formData.deudor, ...commonData, tipo_entidad: 'deudor' as const };
      const proveedorData = { ...initialData?.proveedorReport, ...formData.proveedor, ...commonData, tipo_entidad: 'proveedor' as const };

      await RibReporteTributarioService.upsert(deudorData);
      if (proveedorData.ruc) { // Only save proveedor if RUC is present
        await RibReporteTributarioService.upsert(proveedorData);
      }

      showSuccess('Reporte guardado exitosamente.');
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const renderFields = (type: 'deudor' | 'proveedor') => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${type}.ruc`}>RUC</Label>
          <Controller
            name={`${type}.ruc`}
            control={control}
            render={({ field }) => <Input {...field} value={field.value || ''} placeholder="RUC" />}
          />
        </div>
        <div>
          <Label htmlFor={`${type}.ingreso_ventas`}>Ingreso por Ventas</Label>
          <Controller
            name={`${type}.ingreso_ventas`}
            control={control}
            render={({ field }) => <Input type="number" {...field} value={field.value || ''} placeholder="0.00" />}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${type}.total_activos`}>Total Activos</Label>
          <Controller
            name={`${type}.total_activos`}
            control={control}
            render={({ field }) => <Input type="number" {...field} value={field.value || ''} placeholder="0.00" />}
          />
        </div>
        <div>
          <Label htmlFor={`${type}.total_pasivos`}>Total Pasivos</Label>
          <Controller
            name={`${type}.total_pasivos`}
            control={control}
            render={({ field }) => <Input type="number" {...field} value={field.value || ''} placeholder="0.00" />}
          />
        </div>
        <div>
          <Label htmlFor={`${type}.total_patrimonio`}>Total Patrimonio</Label>
          <Controller
            name={`${type}.total_patrimonio`}
            control={control}
            render={({ field }) => <Input type="number" {...field} value={field.value || ''} placeholder="0.00" />}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">
          {initialData ? 'Editar' : 'Nuevo'} Reporte Tributario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="solicitud">Solicitud de Operación</Label>
              <Controller
                name="solicitud"
                control={control}
                render={({ field }) => (
                  <AsyncSelect
                    {...field}
                    cacheOptions
                    defaultOptions
                    loadOptions={searchSolicitudes}
                    placeholder="Buscar por RUC, nombre o ID..."
                    isDisabled={!!initialData}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="anio">Año del Reporte</Label>
              <Controller
                name="anio"
                control={control}
                render={({ field }) => <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />}
              />
            </div>
          </div>

          <Tabs defaultValue="deudor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deudor">Deudor</TabsTrigger>
              <TabsTrigger value="proveedor">Proveedor</TabsTrigger>
            </TabsList>
            <TabsContent value="deudor" className="mt-4">{renderFields('deudor')}</TabsContent>
            <TabsContent value="proveedor" className="mt-4">{renderFields('proveedor')}</TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar Reporte
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RibReporteTributarioForm;