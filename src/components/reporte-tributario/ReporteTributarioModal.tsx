import React, { useState, useEffect } from 'react';
import { Save, Eye, Edit, FileText, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReporteTributarioWithFicha, ReporteTributarioUpdate } from '@/types/reporte-tributario';
import { ReporteTributarioService } from '@/services/reporteTributarioService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { useSession } from '@/contexts/SessionContext';
import ReporteTributarioAuditLogViewer from '@/components/audit/ReporteTributarioAuditLogViewer';

interface ReporteTributarioModalProps {
  reporte: ReporteTributarioWithFicha | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mode: 'view' | 'edit';
}

const ReporteTributarioModal: React.FC<ReporteTributarioModalProps> = ({
  reporte,
  isOpen,
  onClose,
  onSave,
  mode: initialMode
}) => {
  const { isAdmin } = useSession();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<Partial<ReporteTributarioWithFicha>>({});
  const [loading, setLoading] = useState(false);

  const isReadOnly = mode === 'view' || !isAdmin;

  useEffect(() => {
    if (reporte) {
      setFormData(reporte);
    }
    setMode(initialMode);
  }, [reporte, initialMode]);

  const handleInputChange = (field: keyof ReporteTributarioUpdate, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!isAdmin || !reporte) return;
    const loadingToast = showLoading('Guardando cambios...');
    setLoading(true);
    try {
      // Limpiar los datos antes de enviarlos, eliminando campos que no deben actualizarse.
      const { id, created_at, updated_at, ficha_ruc, nombre_empresa, ...updatePayload } = formData as any;

      await ReporteTributarioService.update(reporte.id, updatePayload);
      dismissToast(loadingToast);
      showSuccess('Reporte actualizado exitosamente');
      onSave();
      onClose();
    } catch (error) {
      dismissToast(loadingToast);
      showError(`Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (id: keyof ReporteTributarioUpdate, label: string, type: 'text' | 'date' | 'number' = 'text') => (
    <div>
      <Label htmlFor={id} className="text-gray-300">{label}</Label>
      {isReadOnly ? (
        <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md text-white">
          {String(formData[id as keyof typeof formData] || 'N/A')}
        </div>
      ) : (
        <Input
          id={id}
          type={type}
          value={String(formData[id as keyof typeof formData] || '')}
          onChange={(e) => handleInputChange(id, type === 'number' ? parseFloat(e.target.value) || null : e.target.value)}
          className="bg-gray-900/50 border-gray-700 text-white"
        />
      )}
    </div>
  );

  const renderMonthlyInputs = (prefix: 'ingresos' | 'ventas', title: string) => {
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
    return (
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {months.map(month => {
            const fieldId = `${prefix}_${month}` as keyof ReporteTributarioUpdate;
            return renderField(fieldId, month.charAt(0).toUpperCase() + month.slice(1), 'number');
          })}
        </div>
      </div>
    );
  };

  if (!reporte) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#121212] border-gray-800 text-gray-300">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-[#00FF80]" />
              <div>
                <span className="text-xl font-bold text-white">{isReadOnly ? 'Ver' : 'Editar'} Reporte Tributario</span>
                <div className="text-sm text-gray-400">{reporte.ficha_ruc?.nombre_empresa} - {reporte.anio_reporte}</div>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <ReporteTributarioAuditLogViewer reporteId={reporte.id} />
                {mode === 'view' ? (
                  <Button variant="outline" size="sm" onClick={() => setMode('edit')} className="border-gray-700 text-gray-300 hover:bg-gray-800"><Edit className="h-4 w-4 mr-2" /> Editar</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setMode('view')} className="border-gray-700 text-gray-300 hover:bg-gray-800"><Eye className="h-4 w-4 mr-2" /> Ver</Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 bg-gray-900/50">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="ruc">Info RUC</TabsTrigger>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
            <TabsTrigger value="renta">Declaración Anual</TabsTrigger>
            <TabsTrigger value="itan">ITAN</TabsTrigger>
            <TabsTrigger value="mensual">Declaraciones Mensuales</TabsTrigger>
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField('anio_reporte', 'Año del Reporte', 'number')}
              {renderField('razon_social', 'Razón Social')}
              {renderField('ruc', 'RUC')}
              {renderField('fecha_emision', 'Fecha de Emisión', 'date')}
            </div>
          </TabsContent>

          <TabsContent value="ruc" className="py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField('ruc_fecha_informacion', 'Fecha de Información', 'date')}
              {renderField('ruc_nombre_comercial', 'Nombre Comercial')}
              {renderField('ruc_fecha_inscripcion', 'Fecha de Inscripción', 'date')}
              {renderField('ruc_fecha_inicio_actividades', 'Inicio de Actividades', 'date')}
              {renderField('ruc_estado_contribuyente', 'Estado Contribuyente')}
              {renderField('ruc_condicion_contribuyente', 'Condición Contribuyente')}
              {renderField('ruc_domicilio_fiscal', 'Domicilio Fiscal')}
              {renderField('ruc_actividad_comercio_exterior', 'Actividad Comercio Exterior')}
              {renderField('ruc_actividad_economica', 'Actividad Económica')}
            </div>
          </TabsContent>

          <TabsContent value="facturacion" className="py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('facturacion_sistema_emision_comprobante', 'Sistema Emisión Comprobante')}
              {renderField('facturacion_sistema_contabilidad', 'Sistema Contabilidad')}
              {renderField('facturacion_comprobantes_autorizados', 'Comprobantes Autorizados')}
              {renderField('facturacion_sistema_emision_electronica', 'Sistema Emisión Electrónica')}
              {renderField('facturacion_afiliado_ple_desde', 'Afiliado PLE Desde', 'date')}
            </div>
          </TabsContent>

          <TabsContent value="renta" className="py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderField('renta_fecha_informacion', 'Fecha de Información', 'date')}
              {renderField('renta_ingresos_netos', 'Ingresos Netos', 'number')}
              {renderField('renta_otros_ingresos', 'Otros Ingresos', 'number')}
              {renderField('renta_total_activos_netos', 'Total Activos Netos', 'number')}
              {renderField('renta_total_cuentas_por_pagar', 'Total Cuentas por Pagar', 'number')}
              {renderField('renta_total_patrimonio', 'Total Patrimonio', 'number')}
              {renderField('renta_capital_social', 'Capital Social', 'number')}
              {renderField('renta_resultado_bruto', 'Resultado Bruto', 'number')}
              {renderField('renta_resultado_antes_participaciones', 'Resultado Antes de Participaciones', 'number')}
              {renderField('renta_importe_pagado', 'Importe Pagado', 'number')}
              {renderField('renta_cuentas_por_cobrar_comerciales_terceros', 'Cuentas por Cobrar Comerciales Terceros', 'number')}
            </div>
          </TabsContent>

          <TabsContent value="itan" className="py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itan_presento_declaracion" className="text-gray-300">Presentó Declaración</Label>
                {isReadOnly ? (
                  <div className="mt-1 p-2 bg-gray-900/50 border border-gray-700 rounded-md text-white">
                    {formData.itan_presento_declaracion ? 'Sí' : 'No'}
                  </div>
                ) : (
                  <Select value={String(formData.itan_presento_declaracion || 'false')} onValueChange={(v) => handleInputChange('itan_presento_declaracion', v === 'true')}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-700"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Sí</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
                  </Select>
                )}
              </div>
              {renderField('itan_base_imponible', 'Base Imponible', 'number')}
              {renderField('itan_itan_a_pagar', 'ITAN a Pagar', 'number')}
              {renderField('itan_cuotas_cantidad', 'Cantidad de Cuotas', 'number')}
              {renderField('itan_cuotas_monto', 'Monto de Cuota', 'number')}
            </div>
          </TabsContent>

          <TabsContent value="mensual" className="py-6 space-y-4">
            {renderMonthlyInputs('ingresos', 'Ingresos Mensuales Declarados')}
          </TabsContent>

          <TabsContent value="ventas" className="py-6 space-y-4">
            {renderMonthlyInputs('ventas', 'Ventas Mensuales')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              {renderField('ventas_total_ingresos', 'Total Ingresos Anuales', 'number')}
              {renderField('ventas_total_essalud', 'Total ESSALUD Anual', 'number')}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancelar</Button>
          {mode === 'edit' && isAdmin && (
            <Button onClick={handleSave} disabled={loading} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
              <Save className="h-4 w-4 mr-2" /> {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReporteTributarioModal;