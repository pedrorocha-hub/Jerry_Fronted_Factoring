import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RibEeffService } from '@/services/ribEeffService';
import { FichaRucService } from '@/services/fichaRucService';
import { FichaRuc } from '@/types/ficha-ruc';
import { CreateRibEeffDto, UpdateRibEeffDto } from '@/types/rib-eeff';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

const RibEeffForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<CreateRibEeffDto & UpdateRibEeffDto>>({ ruc: '' });
  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fichasData = await FichaRucService.getAll();
        setFichas(fichasData);

        if (isEditMode && id) {
          const eeffData = await RibEeffService.getById(id);
          if (eeffData) {
            setFormData(eeffData);
          } else {
            toast.error('No se encontró el registro de RIB EEFF.');
            navigate('/rib-eeff');
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast.error('No se pudieron cargar los datos necesarios.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumericField = !['ruc', 'tipo_entidad', 'status'].includes(name);
    setFormData(prev => ({ ...prev, [name]: value ? (isNumericField ? parseFloat(value) : value) : null }));
  };
  
  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRucChange = (value: string) => {
    setFormData(prev => ({ ...prev, ruc: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruc) {
      toast.error('Por favor, seleccione una empresa (RUC).');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await RibEeffService.update(id, formData as UpdateRibEeffDto);
        toast.success('RIB EEFF actualizado correctamente.');
      } else {
        await RibEeffService.create(formData as CreateRibEeffDto);
        toast.success('RIB EEFF creado correctamente.');
      }
      navigate('/rib-eeff');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el registro de RIB EEFF.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rucOptions = fichas.map(ficha => ({
    value: ficha.ruc,
    label: `${ficha.nombre_empresa} (${ficha.ruc})`,
  }));

  const FormInput = ({ name, label }: { name: string, label: string }) => (
    <div>
      <Label htmlFor={name} className="text-gray-400 text-xs font-light">{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        step="0.01"
        value={formData[name] || ''}
        onChange={handleChange}
        className="bg-gray-900 border-gray-700 mt-1"
      />
    </div>
  );

  const activoFields = {
    activo_caja_inversiones_disponible: "Caja e Inversiones Disponibles",
    activo_cuentas_por_cobrar_del_giro: "Ctas. por Cobrar del Giro",
    activo_cuentas_por_cobrar_relacionadas_no_comerciales: "Ctas. por Cobrar Rel. (No Com.)",
    activo_cuentas_por_cobrar_personal_accionistas_directores: "Ctas. por Cobrar (Personal/Acc.)",
    activo_otras_cuentas_por_cobrar_diversas: "Otras Ctas. por Cobrar Diversas",
    activo_existencias: "Existencias",
    activo_gastos_pagados_por_anticipado: "Gastos Pagados por Anticipado",
    activo_otros_activos_corrientes: "Otros Activos Corrientes",
    activo_total_activo_circulante: "Total Activo Circulante",
    activo_cuentas_por_cobrar_comerciales_lp: "Ctas. por Cobrar Com. (LP)",
    activo_otras_cuentas_por_cobrar_diversas_lp: "Otras Ctas. por Cobrar Div. (LP)",
    activo_activo_fijo_neto: "Activo Fijo Neto",
    activo_inversiones_en_valores: "Inversiones en Valores",
    activo_intangibles: "Intangibles",
    activo_activo_diferido_y_otros: "Activo Diferido y Otros",
    activo_total_activos_no_circulantes: "Total Activos no Circulantes",
    activo_total_activos: "Total Activos",
  };

  const pasivoFields = {
    pasivo_sobregiro_bancos_y_obligaciones_corto_plazo: "Sobregiros y Oblig. (CP)",
    pasivo_parte_corriente_obligaciones_bancos_y_leasing: "Parte Cte. Oblig. y Leasing",
    pasivo_cuentas_por_pagar_del_giro: "Ctas. por Pagar del Giro",
    pasivo_cuentas_por_pagar_relacionadas_no_comerciales: "Ctas. por Pagar Rel. (No Com.)",
    pasivo_otras_cuentas_por_pagar_diversas: "Otras Ctas. por Pagar Diversas",
    pasivo_dividendos_por_pagar: "Dividendos por Pagar",
    pasivo_total_pasivos_circulantes: "Total Pasivos Circulantes",
    pasivo_parte_no_corriente_obligaciones_bancos_y_leasing: "Parte no Cte. Oblig. y Leasing",
    pasivo_cuentas_por_pagar_comerciales_lp: "Ctas. por Pagar Com. (LP)",
    pasivo_otras_cuentas_por_pagar_diversas_lp: "Otras Ctas. por Pagar Div. (LP)",
    pasivo_otros_pasivos: "Otros Pasivos",
    pasivo_total_pasivos_no_circulantes: "Total Pasivos no Circulantes",
    pasivo_total_pasivos: "Total Pasivos",
  };

  const patrimonioFields = {
    patrimonio_neto_capital_pagado: "Capital Pagado",
    patrimonio_neto_capital_adicional: "Capital Adicional",
    patrimonio_neto_excedente_de_revaluacion: "Excedente de Revaluación",
    patrimonio_neto_reserva_legal: "Reserva Legal",
    patrimonio_neto_utilidad_perdida_acumulada: "Utilidad/Pérdida Acumulada",
    patrimonio_neto_utilidad_perdida_del_ejercicio: "Utilidad/Pérdida del Ejercicio",
    patrimonio_neto_total_patrimonio: "Total Patrimonio",
    patrimonio_neto_total_pasivos_y_patrimonio: "Total Pasivos y Patrimonio",
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{isEditMode ? 'Editar' : 'Nuevo'} RIB EEFF</h1>
            <Button variant="outline" onClick={() => navigate('/rib-eeff')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="flex items-center"><Building className="h-5 w-5 mr-2 text-[#00FF80]" />Datos Generales</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="ruc">Empresa (RUC)</Label>
                  <Combobox options={rucOptions} value={formData.ruc || ''} onChange={handleRucChange} placeholder="Seleccione una empresa..." searchPlaceholder="Buscar empresa..." />
                </div>
                <div>
                  <Label htmlFor="anio_reporte">Año del Reporte</Label>
                  <Input id="anio_reporte" name="anio_reporte" type="number" placeholder="Ej: 2023" value={formData.anio_reporte || ''} onChange={handleChange} className="bg-gray-900 border-gray-700 mt-1" />
                </div>
                <div>
                  <Label htmlFor="tipo_entidad">Tipo de Entidad</Label>
                  <Select name="tipo_entidad" onValueChange={handleSelectChange('tipo_entidad')} value={formData.tipo_entidad || ''}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent><SelectItem value="proveedor">Proveedor</SelectItem><SelectItem value="deudor">Deudor</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" onValueChange={handleSelectChange('status')} value={formData.status || ''}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent><SelectItem value="Borrador">Borrador</SelectItem><SelectItem value="En revision">En revisión</SelectItem><SelectItem value="Completado">Completado</SelectItem></SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-green-400" />Activos</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(activoFields).map(([name, label]) => <FormInput key={name} name={name} label={label} />)}
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="flex items-center"><TrendingDown className="h-5 w-5 mr-2 text-red-400" />Pasivos</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(pasivoFields).map(([name, label]) => <FormInput key={name} name={name} label={label} />)}
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="flex items-center"><DollarSign className="h-5 w-5 mr-2 text-yellow-400" />Patrimonio</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(patrimonioFields).map(([name, label]) => <FormInput key={name} name={name} label={label} />)}
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RibEeffForm;