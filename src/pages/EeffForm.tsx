import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EeffService } from '@/services/eeffService';
import { CreateEeffDto, UpdateEeffDto } from '@/types/eeff';
import { toast } from 'sonner';
import EeffAuditLogViewer from '@/components/audit/EeffAuditLogViewer';

const EeffForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEeffDto>({
    ruc: '',
    anio_reporte: new Date().getFullYear(),
    razon_social: '',
    activo_efectivo_y_equivalentes_de_efectivo: null,
    activo_inversiones_financieras: null,
    activo_ctas_por_cobrar_comerciales_terceros: null,
    activo_ctas_por_cobrar_comerciales_relacionadas: null,
    activo_cuentas_por_cobrar_al_personal_socios_y_directores: null,
    activo_ctas_por_cobrar_diversas_terceros: null,
    activo_ctas_por_cobrar_diversas_relacionadas: null,
    activo_serv_y_otros_contratados_por_anticipado: null,
    activo_estimacion_ctas_de_cobranza_dudosa: null,
    activo_mercaderias: null,
    activo_productos_terminados: null,
    activo_subproductos_desechos_y_desperdicios: null,
    activo_productos_en_proceso: null,
    activo_materias_primas: null,
    activo_materiales_aux_suministros_y_repuestos: null,
    activo_envases_y_embalajes: null,
    activo_inventarios_por_recibir: null,
    activo_desvalorizacion_de_inventarios: null,
    activo_activos_no_ctes_mantenidos_para_la_venta: null,
    activo_otro_activos_corrientes: null,
    activo_inversiones_mobiliarias: null,
    activo_propiedades_de_inversion: null,
    activo_activos_por_derecho_de_uso: null,
    activo_propiedades_planta_y_equipo: null,
    activo_depreciacion_de_1_2_y_ppe_acumulados: null,
    activo_intangibles: null,
    activo_activos_biologicos: null,
    activo_deprec_act_biologico_y_amortiz_acumulada: null,
    activo_desvalorizacion_de_activo_inmovilizado: null,
    activo_activo_diferido: null,
    activo_otros_activos_no_corrientes: null,
    activo_total_activo_neto: null,
    pasivo_sobregiros_bancarios: null,
    pasivo_trib_y_aport_sist_pens_y_salud_por_pagar: null,
    pasivo_remuneraciones_y_participaciones_por_pagar: null,
    pasivo_ctas_por_pagar_comerciales_terceros: null,
    pasivo_ctas_por_pagar_comerciales_relacionadas: null,
    pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct: null,
    pasivo_ctas_por_pagar_diversas_terceros: null,
    pasivo_ctas_por_pagar_diversas_relacionadas: null,
    pasivo_obligaciones_financieras: null,
    pasivo_provisiones: null,
    pasivo_pasivo_diferido: null,
    pasivo_total_pasivo: null,
    patrimonio_capital: null,
    patrimonio_acciones_de_inversion: null,
    patrimonio_capital_adicional_positivo: null,
    patrimonio_capital_adicional_negativo: null,
    patrimonio_resultados_no_realizados: null,
    patrimonio_excedente_de_revaluacion: null,
    patrimonio_reservas: null,
    patrimonio_resultados_acumulados_positivos: null,
    patrimonio_resultados_acumulados_negativos: null,
    patrimonio_utilidad_de_ejercicio: null,
    patrimonio_perdida_de_ejercicio: null,
    patrimonio_total_patrimonio: null,
    patrimonio_total_pasivo_y_patrimonio: null,
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadEeff(id);
    }
  }, [id, isEditMode]);

  const loadEeff = async (eeffId: string) => {
    setLoading(true);
    try {
      const data = await EeffService.getById(eeffId);
      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Error al cargar EEFF:', error);
      toast.error('Error al cargar los datos del EEFF');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : (name === 'ruc' || name === 'razon_social' ? value : name === 'anio_reporte' ? parseInt(value) : parseFloat(value))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && id) {
        await EeffService.update(id, formData as UpdateEeffDto);
        toast.success('EEFF actualizado correctamente');
      } else {
        await EeffService.create(formData);
        toast.success('EEFF creado correctamente');
      }
      navigate('/eeff');
    } catch (error: any) {
      console.error('Error al guardar EEFF:', error);
      toast.error(error.message || 'Error al guardar el EEFF');
    } finally {
      setLoading(false);
    }
  };

  const FormInput = ({ name, label, value, onChange, isTotal = false }: { name: string, label: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, isTotal?: boolean }) => (
    <div className={isTotal ? 'relative' : ''}>
      <Label htmlFor={name} className={`text-xs font-light ${isTotal ? 'text-[#00FF80] font-semibold' : 'text-gray-400'}`}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={name === 'ruc' || name === 'razon_social' ? 'text' : 'number'}
        step="0.01"
        value={value || ''}
        onChange={onChange}
        className={`bg-gray-900 border-gray-700 text-white ${
          isTotal 
            ? 'border-[#00FF80]/50 bg-[#00FF80]/5 font-bold text-lg ring-2 ring-[#00FF80]/20 focus:ring-[#00FF80]/40' 
            : ''
        }`}
      />
    </div>
  );

  if (loading && isEditMode) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FileText className="h-8 w-8 mr-3 text-[#00FF80]" />
                {isEditMode ? 'Editar EEFF' : 'Nuevo EEFF'}
              </h1>
              <p className="text-gray-400 mt-2">
                {isEditMode ? 'Actualizar información del Estado Financiero' : 'Registrar nuevo Estado Financiero'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isEditMode && id && <EeffAuditLogViewer eeffId={id} />}
              <Button variant="outline" onClick={() => navigate('/eeff')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Información General */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput name="ruc" label="RUC" value={formData.ruc} onChange={handleChange} />
                    <FormInput name="razon_social" label="Razón Social" value={formData.razon_social} onChange={handleChange} />
                    <FormInput name="anio_reporte" label="Año del Reporte" value={formData.anio_reporte} onChange={handleChange} />
                  </div>
                </CardContent>
              </Card>

              {/* ACTIVOS */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Activos Corrientes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput name="activo_efectivo_y_equivalentes_de_efectivo" label="Efectivo y Equivalentes de Efectivo" value={formData.activo_efectivo_y_equivalentes_de_efectivo} onChange={handleChange} />
                        <FormInput name="activo_inversiones_financieras" label="Inversiones Financieras" value={formData.activo_inversiones_financieras} onChange={handleChange} />
                        <FormInput name="activo_ctas_por_cobrar_comerciales_terceros" label="Cuentas por Cobrar Comerciales - Terceros" value={formData.activo_ctas_por_cobrar_comerciales_terceros} onChange={handleChange} />
                        <FormInput name="activo_ctas_por_cobrar_comerciales_relacionadas" label="Cuentas por Cobrar Comerciales - Relacionadas" value={formData.activo_ctas_por_cobrar_comerciales_relacionadas} onChange={handleChange} />
                        <FormInput name="activo_cuentas_por_cobrar_al_personal_socios_y_directores" label="Cuentas por Cobrar al Personal, Socios y Directores" value={formData.activo_cuentas_por_cobrar_al_personal_socios_y_directores} onChange={handleChange} />
                        <FormInput name="activo_ctas_por_cobrar_diversas_terceros" label="Cuentas por Cobrar Diversas - Terceros" value={formData.activo_ctas_por_cobrar_diversas_terceros} onChange={handleChange} />
                        <FormInput name="activo_ctas_por_cobrar_diversas_relacionadas" label="Cuentas por Cobrar Diversas - Relacionadas" value={formData.activo_ctas_por_cobrar_diversas_relacionadas} onChange={handleChange} />
                        <FormInput name="activo_serv_y_otros_contratados_por_anticipado" label="Servicios y Otros Contratados por Anticipado" value={formData.activo_serv_y_otros_contratados_por_anticipado} onChange={handleChange} />
                        <FormInput name="activo_estimacion_ctas_de_cobranza_dudosa" label="Estimación de Cuentas de Cobranza Dudosa" value={formData.activo_estimacion_ctas_de_cobranza_dudosa} onChange={handleChange} />
                        <FormInput name="activo_mercaderias" label="Mercaderías" value={formData.activo_mercaderias} onChange={handleChange} />
                        <FormInput name="activo_productos_terminados" label="Productos Terminados" value={formData.activo_productos_terminados} onChange={handleChange} />
                        <FormInput name="activo_subproductos_desechos_y_desperdicios" label="Subproductos, Desechos y Desperdicios" value={formData.activo_subproductos_desechos_y_desperdicios} onChange={handleChange} />
                        <FormInput name="activo_productos_en_proceso" label="Productos en Proceso" value={formData.activo_productos_en_proceso} onChange={handleChange} />
                        <FormInput name="activo_materias_primas" label="Materias Primas" value={formData.activo_materias_primas} onChange={handleChange} />
                        <FormInput name="activo_materiales_aux_suministros_y_repuestos" label="Materiales Auxiliares, Suministros y Repuestos" value={formData.activo_materiales_aux_suministros_y_repuestos} onChange={handleChange} />
                        <FormInput name="activo_envases_y_embalajes" label="Envases y Embalajes" value={formData.activo_envases_y_embalajes} onChange={handleChange} />
                        <FormInput name="activo_inventarios_por_recibir" label="Inventarios por Recibir" value={formData.activo_inventarios_por_recibir} onChange={handleChange} />
                        <FormInput name="activo_desvalorizacion_de_inventarios" label="Desvalorización de Inventarios" value={formData.activo_desvalorizacion_de_inventarios} onChange={handleChange} />
                        <FormInput name="activo_activos_no_ctes_mantenidos_para_la_venta" label="Activos No Corrientes Mantenidos para la Venta" value={formData.activo_activos_no_ctes_mantenidos_para_la_venta} onChange={handleChange} />
                        <FormInput name="activo_otro_activos_corrientes" label="Otros Activos Corrientes" value={formData.activo_otro_activos_corrientes} onChange={handleChange} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-3">Activos No Corrientes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput name="activo_inversiones_mobiliarias" label="Inversiones Mobiliarias" value={formData.activo_inversiones_mobiliarias} onChange={handleChange} />
                        <FormInput name="activo_propiedades_de_inversion" label="Propiedades de Inversión" value={formData.activo_propiedades_de_inversion} onChange={handleChange} />
                        <FormInput name="activo_activos_por_derecho_de_uso" label="Activos por Derecho de Uso" value={formData.activo_activos_por_derecho_de_uso} onChange={handleChange} />
                        <FormInput name="activo_propiedades_planta_y_equipo" label="Propiedades, Planta y Equipo" value={formData.activo_propiedades_planta_y_equipo} onChange={handleChange} />
                        <FormInput name="activo_depreciacion_de_1_2_y_ppe_acumulados" label="Depreciación Acumulada" value={formData.activo_depreciacion_de_1_2_y_ppe_acumulados} onChange={handleChange} />
                        <FormInput name="activo_intangibles" label="Intangibles" value={formData.activo_intangibles} onChange={handleChange} />
                        <FormInput name="activo_activos_biologicos" label="Activos Biológicos" value={formData.activo_activos_biologicos} onChange={handleChange} />
                        <FormInput name="activo_deprec_act_biologico_y_amortiz_acumulada" label="Depreciación y Amortización Acumulada" value={formData.activo_deprec_act_biologico_y_amortiz_acumulada} onChange={handleChange} />
                        <FormInput name="activo_desvalorizacion_de_activo_inmovilizado" label="Desvalorización de Activo Inmovilizado" value={formData.activo_desvalorizacion_de_activo_inmovilizado} onChange={handleChange} />
                        <FormInput name="activo_activo_diferido" label="Activo Diferido" value={formData.activo_activo_diferido} onChange={handleChange} />
                        <FormInput name="activo_otros_activos_no_corrientes" label="Otros Activos No Corrientes" value={formData.activo_otros_activos_no_corrientes} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <FormInput name="activo_total_activo_neto" label="TOTAL ACTIVO NETO" value={formData.activo_total_activo_neto} onChange={handleChange} isTotal={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PASIVOS */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Pasivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="pasivo_sobregiros_bancarios" label="Sobregiros Bancarios" value={formData.pasivo_sobregiros_bancarios} onChange={handleChange} />
                      <FormInput name="pasivo_trib_y_aport_sist_pens_y_salud_por_pagar" label="Tributos y Aportes al Sistema de Pensiones y Salud por Pagar" value={formData.pasivo_trib_y_aport_sist_pens_y_salud_por_pagar} onChange={handleChange} />
                      <FormInput name="pasivo_remuneraciones_y_participaciones_por_pagar" label="Remuneraciones y Participaciones por Pagar" value={formData.pasivo_remuneraciones_y_participaciones_por_pagar} onChange={handleChange} />
                      <FormInput name="pasivo_ctas_por_pagar_comerciales_terceros" label="Cuentas por Pagar Comerciales - Terceros" value={formData.pasivo_ctas_por_pagar_comerciales_terceros} onChange={handleChange} />
                      <FormInput name="pasivo_ctas_por_pagar_comerciales_relacionadas" label="Cuentas por Pagar Comerciales - Relacionadas" value={formData.pasivo_ctas_por_pagar_comerciales_relacionadas} onChange={handleChange} />
                      <FormInput name="pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct" label="Cuentas por Pagar a Accionistas, Socios, Participantes y Directores" value={formData.pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct} onChange={handleChange} />
                      <FormInput name="pasivo_ctas_por_pagar_diversas_terceros" label="Cuentas por Pagar Diversas - Terceros" value={formData.pasivo_ctas_por_pagar_diversas_terceros} onChange={handleChange} />
                      <FormInput name="pasivo_ctas_por_pagar_diversas_relacionadas" label="Cuentas por Pagar Diversas - Relacionadas" value={formData.pasivo_ctas_por_pagar_diversas_relacionadas} onChange={handleChange} />
                      <FormInput name="pasivo_obligaciones_financieras" label="Obligaciones Financieras" value={formData.pasivo_obligaciones_financieras} onChange={handleChange} />
                      <FormInput name="pasivo_provisiones" label="Provisiones" value={formData.pasivo_provisiones} onChange={handleChange} />
                      <FormInput name="pasivo_pasivo_diferido" label="Pasivo Diferido" value={formData.pasivo_pasivo_diferido} onChange={handleChange} />
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <FormInput name="pasivo_total_pasivo" label="TOTAL PASIVO" value={formData.pasivo_total_pasivo} onChange={handleChange} isTotal={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PATRIMONIO */}
              <Card className="bg-[#121212] border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Patrimonio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="patrimonio_capital" label="Capital" value={formData.patrimonio_capital} onChange={handleChange} />
                      <FormInput name="patrimonio_acciones_de_inversion" label="Acciones de Inversión" value={formData.patrimonio_acciones_de_inversion} onChange={handleChange} />
                      <FormInput name="patrimonio_capital_adicional_positivo" label="Capital Adicional Positivo" value={formData.patrimonio_capital_adicional_positivo} onChange={handleChange} />
                      <FormInput name="patrimonio_capital_adicional_negativo" label="Capital Adicional Negativo" value={formData.patrimonio_capital_adicional_negativo} onChange={handleChange} />
                      <FormInput name="patrimonio_resultados_no_realizados" label="Resultados No Realizados" value={formData.patrimonio_resultados_no_realizados} onChange={handleChange} />
                      <FormInput name="patrimonio_excedente_de_revaluacion" label="Excedente de Revaluación" value={formData.patrimonio_excedente_de_revaluacion} onChange={handleChange} />
                      <FormInput name="patrimonio_reservas" label="Reservas" value={formData.patrimonio_reservas} onChange={handleChange} />
                      <FormInput name="patrimonio_resultados_acumulados_positivos" label="Resultados Acumulados Positivos" value={formData.patrimonio_resultados_acumulados_positivos} onChange={handleChange} />
                      <FormInput name="patrimonio_resultados_acumulados_negativos" label="Resultados Acumulados Negativos" value={formData.patrimonio_resultados_acumulados_negativos} onChange={handleChange} />
                      <FormInput name="patrimonio_utilidad_de_ejercicio" label="Utilidad del Ejercicio" value={formData.patrimonio_utilidad_de_ejercicio} onChange={handleChange} />
                      <FormInput name="patrimonio_perdida_de_ejercicio" label="Pérdida del Ejercicio" value={formData.patrimonio_perdida_de_ejercicio} onChange={handleChange} />
                    </div>

                    <div className="pt-4 border-t border-gray-700 space-y-4">
                      <FormInput name="patrimonio_total_patrimonio" label="TOTAL PATRIMONIO" value={formData.patrimonio_total_patrimonio} onChange={handleChange} isTotal={true} />
                      <FormInput name="patrimonio_total_pasivo_y_patrimonio" label="TOTAL PASIVO Y PATRIMONIO" value={formData.patrimonio_total_pasivo_y_patrimonio} onChange={handleChange} isTotal={true} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate('/eeff')} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EeffForm;