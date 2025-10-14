import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EeffService } from '@/services/eeffService';
import { FichaRucService } from '@/services/fichaRucService';
import { FichaRuc } from '@/types/ficha-ruc';
import { CreateEeffDto, UpdateEeffDto } from '@/types/eeff';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

const EeffForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<CreateEeffDto & UpdateEeffDto>>({ ruc: '' });
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
          const eeffData = await EeffService.getById(id);
          if (eeffData) {
            setFormData(eeffData);
          } else {
            toast.error('No se encontró el registro de EEFF.');
            navigate('/eeff');
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
    setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : null }));
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
        await EeffService.update(id, formData as UpdateEeffDto);
        toast.success('EEFF actualizado correctamente.');
      } else {
        await EeffService.create(formData as CreateEeffDto);
        toast.success('EEFF creado correctamente.');
      }
      navigate('/eeff');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el registro de EEFF.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rucOptions = fichas.map(ficha => ({
    value: ficha.ruc,
    label: `${ficha.nombre_empresa} (${ficha.ruc})`,
  }));

  const FormInput = ({ name, label, value, onChange }: { name: string, label: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div>
      <Label htmlFor={name} className="text-gray-400 text-xs font-light">{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        step="0.01"
        value={value || ''}
        onChange={onChange}
        className="bg-gray-900 border-gray-700 mt-1"
      />
    </div>
  );

  const activoFields = {
    activo_efectivo_y_equivalentes_de_efectivo: "Efectivo y Equivalentes",
    activo_inversiones_financieras: "Inversiones Financieras",
    activo_ctas_por_cobrar_comerciales_terceros: "Ctas. Cobrar Comerciales (Terceros)",
    activo_ctas_por_cobrar_comerciales_relacionadas: "Ctas. Cobrar Comerciales (Rel.)",
    activo_cuentas_por_cobrar_al_personal_socios_y_directores: "Ctas. Cobrar (Personal, Socios)",
    activo_ctas_por_cobrar_diversas_terceros: "Ctas. Cobrar Diversas (Terceros)",
    activo_ctas_por_cobrar_diversas_relacionadas: "Ctas. Cobrar Diversas (Rel.)",
    activo_serv_y_otros_contratados_por_anticipado: "Serv. y Otros Contratados por Anticipado",
    activo_estimacion_ctas_de_cobranza_dudosa: "Estimación Ctas. Cobranza Dudosa",
    activo_mercaderias: "Mercaderías",
    activo_productos_terminados: "Productos Terminados",
    activo_subproductos_desechos_y_desperdicios: "Subproductos y Desechos",
    activo_productos_en_proceso: "Productos en Proceso",
    activo_materias_primas: "Materias Primas",
    activo_materiales_aux_suministros_y_repuestos: "Materiales Aux., Suministros y Repuestos",
    activo_envases_y_embalajes: "Envases y Embalajes",
    activo_inventarios_por_recibir: "Inventarios por Recibir",
    activo_desvalorizacion_de_inventarios: "Desvalorización de Inventarios",
    activo_activos_no_ctes_mantenidos_para_la_venta: "Activos no Ctes. para Venta",
    activo_otro_activos_corrientes: "Otros Activos Corrientes",
    activo_inversiones_mobiliarias: "Inversiones Mobiliarias",
    activo_propiedades_de_inversion: "Propiedades de Inversión",
    activo_activos_por_derecho_de_uso: "Activos por Derecho de Uso",
    activo_propiedades_planta_y_equipo: "Propiedades, Planta y Equipo",
    activo_depreciacion_de_1_2_y_ppe_acumulados: "Depreciación Acumulada",
    activo_intangibles: "Intangibles",
    activo_activos_biologicos: "Activos Biológicos",
    activo_deprec_act_biologico_y_amortiz_acumulada: "Deprec. Act. Biológico y Amortiz. Acum.",
    activo_desvalorizacion_de_activo_inmovilizado: "Desvalorización Activo Inmovilizado",
    activo_activo_diferido: "Activo Diferido",
    activo_otros_activos_no_corrientes: "Otros Activos no Corrientes",
    activo_total_activo_neto: "Total Activo Neto",
  };

  const pasivoFields = {
    pasivo_sobregiros_bancarios: "Sobregiros Bancarios",
    pasivo_trib_y_aport_sist_pens_y_salud_por_pagar: "Trib. y Aportes por Pagar",
    pasivo_remuneraciones_y_participaciones_por_pagar: "Remuneraciones por Pagar",
    pasivo_ctas_por_pagar_comerciales_terceros: "Ctas. Pagar Comerciales (Terceros)",
    pasivo_ctas_por_pagar_comerciales_relacionadas: "Ctas. Pagar Comerciales (Rel.)",
    pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct: "Ctas. Pagar (Accionistas, Socios)",
    pasivo_ctas_por_pagar_diversas_terceros: "Ctas. Pagar Diversas (Terceros)",
    pasivo_ctas_por_pagar_diversas_relacionadas: "Ctas. Pagar Diversas (Rel.)",
    pasivo_obligaciones_financieras: "Obligaciones Financieras",
    pasivo_provisiones: "Provisiones",
    pasivo_pasivo_diferido: "Pasivo Diferido",
    pasivo_total_pasivo: "Total Pasivo",
  };

  const patrimonioFields = {
    patrimonio_capital: "Capital",
    patrimonio_acciones_de_inversion: "Acciones de Inversión",
    patrimonio_capital_adicional_positivo: "Capital Adicional (+)",
    patrimonio_capital_adicional_negativo: "Capital Adicional (-)",
    patrimonio_resultados_no_realizados: "Resultados no Realizados",
    patrimonio_excedente_de_revaluacion: "Excedente de Revaluación",
    patrimonio_reservas: "Reservas",
    patrimonio_resultados_acumulados_positivos: "Resultados Acumulados (+)",
    patrimonio_resultados_acumulados_negativos: "Resultados Acumulados (-)",
    patrimonio_utilidad_de_ejercicio: "Utilidad del Ejercicio",
    patrimonio_perdida_de_ejercicio: "Pérdida del Ejercicio",
    patrimonio_total_patrimonio: "Total Patrimonio",
    patrimonio_total_pasivo_y_patrimonio: "Total Pasivo y Patrimonio",
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
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {isEditMode ? 'Editar' : 'Nuevo'} Estado Financiero
              </h1>
              <p className="text-gray-400 mt-2">
                {isEditMode ? 'Actualice los detalles del registro.' : 'Complete el formulario para crear un nuevo registro.'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/eeff')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al listado
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2 text-[#00FF80]" />
                  Datos de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ruc" className="text-gray-300">Empresa (RUC)</Label>
                    <Combobox
                      options={rucOptions}
                      value={formData.ruc || ''}
                      onChange={handleRucChange}
                      placeholder="Seleccione una empresa..."
                      searchPlaceholder="Buscar empresa por RUC o nombre..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="anio_reporte" className="text-gray-300">Año del Reporte</Label>
                    <Input
                      id="anio_reporte"
                      name="anio_reporte"
                      type="number"
                      placeholder="Ej: 2023"
                      value={formData.anio_reporte || ''}
                      onChange={handleChange}
                      className="bg-gray-900 border-gray-700 mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                  Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(activoFields).map(([name, label]) => (
                    <FormInput key={name} name={name} label={label} value={formData[name]} onChange={handleChange} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2 text-red-400" />
                  Pasivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(pasivoFields).map(([name, label]) => (
                    <FormInput key={name} name={name} label={label} value={formData[name]} onChange={handleChange} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-400" />
                  Patrimonio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(patrimonioFields).map(([name, label]) => (
                    <FormInput key={name} name={name} label={label} value={formData[name]} onChange={handleChange} />
                  ))}
                </div>
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

export default EeffForm;