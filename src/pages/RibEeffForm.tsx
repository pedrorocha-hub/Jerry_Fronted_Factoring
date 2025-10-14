import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building, DollarSign, TrendingUp, TrendingDown, Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RibEeffService } from '@/services/ribEeffService';
import { FichaRucService } from '@/services/fichaRucService';
import { EeffService } from '@/services/eeffService';
import { FichaRuc } from '@/types/ficha-ruc';
import { Eeff } from '@/types/eeff';
import { CreateRibEeffDto, UpdateRibEeffDto, RibEeff } from '@/types/rib-eeff';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

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

const transformEeffToRibEeff = (eeff: Eeff): Partial<RibEeff> => {
    const v = (field: keyof Eeff) => (eeff[field] as number) || 0;
    const transformed: Partial<RibEeff> = {};

    transformed.activo_caja_inversiones_disponible = v('activo_efectivo_y_equivalentes_de_efectivo') + v('activo_inversiones_financieras');
    transformed.activo_cuentas_por_cobrar_del_giro = v('activo_ctas_por_cobrar_comerciales_terceros');
    transformed.activo_cuentas_por_cobrar_relacionadas_no_comerciales = v('activo_ctas_por_cobrar_comerciales_relacionadas') + v('activo_ctas_por_cobrar_diversas_relacionadas');
    transformed.activo_cuentas_por_cobrar_personal_accionistas_directores = v('activo_cuentas_por_cobrar_al_personal_socios_y_directores');
    transformed.activo_otras_cuentas_por_cobrar_diversas = v('activo_ctas_por_cobrar_diversas_terceros');
    transformed.activo_existencias = v('activo_mercaderias') + v('activo_productos_terminados') + v('activo_subproductos_desechos_y_desperdicios') + v('activo_productos_en_proceso') + v('activo_materias_primas') + v('activo_materiales_aux_suministros_y_repuestos') + v('activo_envases_y_embalajes') + v('activo_inventarios_por_recibir') - v('activo_desvalorizacion_de_inventarios');
    transformed.activo_gastos_pagados_por_anticipado = v('activo_serv_y_otros_contratados_por_anticipado');
    transformed.activo_otros_activos_corrientes = v('activo_activos_no_ctes_mantenidos_para_la_venta') + v('activo_otro_activos_corrientes');
    transformed.activo_total_activo_circulante = [transformed.activo_caja_inversiones_disponible, transformed.activo_cuentas_por_cobrar_del_giro, transformed.activo_cuentas_por_cobrar_relacionadas_no_comerciales, transformed.activo_cuentas_por_cobrar_personal_accionistas_directores, transformed.activo_otras_cuentas_por_cobrar_diversas, transformed.activo_existencias, transformed.activo_gastos_pagados_por_anticipado, transformed.activo_otros_activos_corrientes].reduce((s, i) => s + (i || 0), 0);
    transformed.activo_cuentas_por_cobrar_comerciales_lp = v('activo_ctas_por_cobrar_comerciales_terceros');
    transformed.activo_otras_cuentas_por_cobrar_diversas_lp = v('activo_ctas_por_cobrar_diversas_terceros');
    transformed.activo_activo_fijo_neto = v('activo_propiedades_planta_y_equipo') - v('activo_depreciacion_de_1_2_y_ppe_acumulados');
    transformed.activo_inversiones_en_valores = v('activo_inversiones_mobiliarias') + v('activo_propiedades_de_inversion') + v('activo_activos_por_derecho_de_uso');
    transformed.activo_intangibles = v('activo_intangibles');
    transformed.activo_activo_diferido_y_otros = v('activo_activo_diferido') + v('activo_otros_activos_no_corrientes');
    transformed.activo_total_activos_no_circulantes = [transformed.activo_cuentas_por_cobrar_comerciales_lp, transformed.activo_otras_cuentas_por_cobrar_diversas_lp, transformed.activo_activo_fijo_neto, transformed.activo_inversiones_en_valores, transformed.activo_intangibles, transformed.activo_activo_diferido_y_otros].reduce((s, i) => s + (i || 0), 0);
    transformed.activo_total_activos = v('activo_total_activo_neto');

    transformed.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo = v('pasivo_sobregiros_bancarios');
    transformed.pasivo_parte_corriente_obligaciones_bancos_y_leasing = v('pasivo_obligaciones_financieras');
    transformed.pasivo_cuentas_por_pagar_del_giro = v('pasivo_ctas_por_pagar_comerciales_terceros');
    transformed.pasivo_cuentas_por_pagar_relacionadas_no_comerciales = v('pasivo_ctas_por_pagar_comerciales_relacionadas') + v('pasivo_ctas_por_pagar_diversas_relacionadas');
    transformed.pasivo_otras_cuentas_por_pagar_diversas = v('pasivo_ctas_por_pagar_diversas_terceros');
    transformed.pasivo_dividendos_por_pagar = v('pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct');
    transformed.pasivo_total_pasivos_circulantes = [transformed.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo, transformed.pasivo_parte_corriente_obligaciones_bancos_y_leasing, transformed.pasivo_cuentas_por_pagar_del_giro, transformed.pasivo_cuentas_por_pagar_relacionadas_no_comerciales, transformed.pasivo_otras_cuentas_por_pagar_diversas, transformed.pasivo_dividendos_por_pagar].reduce((s, i) => s + (i || 0), 0);
    transformed.pasivo_parte_no_corriente_obligaciones_bancos_y_leasing = v('pasivo_obligaciones_financieras');
    transformed.pasivo_cuentas_por_pagar_comerciales_lp = v('pasivo_ctas_por_pagar_comerciales_terceros');
    transformed.pasivo_otras_cuentas_por_pagar_diversas_lp = v('pasivo_ctas_por_pagar_diversas_terceros');
    transformed.pasivo_otros_pasivos = v('pasivo_provisiones') + v('pasivo_pasivo_diferido');
    transformed.pasivo_total_pasivos_no_circulantes = [transformed.pasivo_parte_no_corriente_obligaciones_bancos_y_leasing, transformed.pasivo_cuentas_por_pagar_comerciales_lp, transformed.pasivo_otras_cuentas_por_pagar_diversas_lp, transformed.pasivo_otros_pasivos].reduce((s, i) => s + (i || 0), 0);
    transformed.pasivo_total_pasivos = v('pasivo_total_pasivo');

    transformed.patrimonio_neto_capital_pagado = v('patrimonio_capital');
    transformed.patrimonio_neto_capital_adicional = v('patrimonio_capital_adicional_positivo') + v('patrimonio_capital_adicional_negativo');
    transformed.patrimonio_neto_excedente_de_revaluacion = v('patrimonio_excedente_de_revaluacion');
    transformed.patrimonio_neto_reserva_legal = v('patrimonio_reservas');
    transformed.patrimonio_neto_utilidad_perdida_acumulada = v('patrimonio_resultados_acumulados_positivos') + v('patrimonio_resultados_acumulados_negativos');
    transformed.patrimonio_neto_utilidad_perdida_del_ejercicio = v('patrimonio_utilidad_de_ejercicio') + v('patrimonio_perdida_de_ejercicio');
    transformed.patrimonio_neto_total_patrimonio = v('patrimonio_total_patrimonio');
    transformed.patrimonio_neto_total_pasivos_y_patrimonio = v('patrimonio_total_pasivo_y_patrimonio');

    return transformed;
};

const FinancialTable = ({ title, fields, years, yearsData, handleChange, icon }) => (
    <Card className="bg-[#121212] border border-gray-800">
        <CardHeader><CardTitle className="flex items-center">{icon}{title}</CardTitle></CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900/50">
                            <TableHead className="min-w-[250px] text-gray-400">Concepto</TableHead>
                            {years.map(year => <TableHead key={year} className="text-center min-w-[150px] text-gray-400">{year}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(fields).map(([name, label]) => (
                            <TableRow key={name} className="border-gray-800">
                                <TableCell className="text-gray-300 text-sm font-light">{label as string}</TableCell>
                                {years.map(year => (
                                    <TableCell key={year}>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            name={name}
                                            value={yearsData[year]?.[name] || ''}
                                            onChange={(e) => handleChange(year, name, e.target.value)}
                                            className="bg-gray-900 border-gray-700 text-right"
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
);

const RibEeffForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [fichas, setFichas] = useState<FichaRuc[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [generalData, setGeneralData] = useState<{ ruc: string; tipo_entidad?: string; status?: string }>({ ruc: '' });
    const [years, setYears] = useState<number[]>([]);
    const [yearsData, setYearsData] = useState<{ [key: number]: Partial<UpdateRibEeffDto> }>({});
    const [existingRecords, setExistingRecords] = useState<RibEeff[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const fichasData = await FichaRucService.getAll();
                setFichas(fichasData);

                if (id) {
                    const record = await RibEeffService.getById(id);
                    if (record) {
                        setGeneralData({
                            ruc: record.ruc,
                            tipo_entidad: record.tipo_entidad || undefined,
                            status: record.status || undefined,
                        });
                        // Trigger data load for the existing record's RUC
                        await handleLoadEeffData(record.ruc);
                    } else {
                        toast.error('Registro no encontrado.');
                        navigate('/rib-eeff');
                    }
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('No se pudieron cargar los datos iniciales.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, navigate]);

    const handleLoadEeffData = async (ruc: string) => {
        if (!ruc) {
            toast.info('Por favor, seleccione una empresa.');
            return;
        }
        setLoading(true);
        try {
            const eeffRecords = await EeffService.getByRuc(ruc);
            if (eeffRecords.length === 0) {
                toast.info('No se encontraron registros de EEFF para esta empresa.');
                setYears([]);
                setYearsData({});
                return;
            }

            const availableYears = eeffRecords.map(r => r.anio_reporte).filter((y): y is number => y !== null);
            setYears(availableYears);

            const existingRibRecords = await RibEeffService.getByRucAndYears(ruc, availableYears);
            setExistingRecords(existingRibRecords);

            const newYearsData = {};
            for (const eeffRecord of eeffRecords) {
                if (eeffRecord.anio_reporte) {
                    const year = eeffRecord.anio_reporte;
                    const existingRib = existingRibRecords.find(r => r.anio_reporte === year);
                    if (existingRib) {
                        newYearsData[year] = existingRib;
                    } else {
                        newYearsData[year] = transformEeffToRibEeff(eeffRecord);
                    }
                }
            }
            setYearsData(newYearsData);
            toast.success(`Datos de ${availableYears.length} año(s) cargados desde EEFF.`);
        } catch (error) {
            console.error('Error loading EEFF data:', error);
            toast.error('No se pudieron cargar los datos de EEFF.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneralChange = (name: string, value: string) => {
        setGeneralData(prev => ({ ...prev, [name]: value }));
    };

    const handleYearDataChange = (year: number, name: string, value: string) => {
        const isNumericField = !['ruc', 'tipo_entidad', 'status'].includes(name);
        const parsedValue = value ? (isNumericField ? parseFloat(value) : value) : null;
        setYearsData(prev => ({
            ...prev,
            [year]: { ...prev[year], [name]: parsedValue },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!generalData.ruc) {
            toast.error('Por favor, seleccione una empresa (RUC).');
            return;
        }
        setIsSubmitting(true);
        try {
            const promises = years.map(async (year) => {
                const yearData = yearsData[year];
                if (!yearData || Object.keys(yearData).length === 0) return;

                const existingRecord = existingRecords.find(r => r.anio_reporte === year);
                const payload: Partial<CreateRibEeffDto & UpdateRibEeffDto> = {
                    ...yearData,
                    ruc: generalData.ruc,
                    tipo_entidad: generalData.tipo_entidad as any,
                    status: generalData.status as any,
                    anio_reporte: year,
                };
                delete payload.id;

                if (existingRecord) {
                    await RibEeffService.update(existingRecord.id, payload);
                } else {
                    await RibEeffService.create(payload as CreateRibEeffDto);
                }
            });

            await Promise.all(promises);
            toast.success('Datos de RIB EEFF guardados correctamente.');
            navigate('/rib-eeff');
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al guardar los registros de RIB EEFF.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const rucOptions = fichas.map(ficha => ({
        value: ficha.ruc,
        label: `${ficha.nombre_empresa} (${ficha.ruc})`,
    }));

    return (
        <Layout>
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Gestión de RIB EEFF</h1>
                        <Button variant="outline" onClick={() => navigate('/rib-eeff')}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card className="bg-[#121212] border border-gray-800">
                            <CardHeader><CardTitle className="flex items-center"><Building className="h-5 w-5 mr-2 text-[#00FF80]" />Datos Generales</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div className="lg:col-span-2">
                                    <Label htmlFor="ruc">Empresa (RUC)</Label>
                                    <Combobox options={rucOptions} value={generalData.ruc || ''} onChange={(value) => handleGeneralChange('ruc', value)} placeholder="Seleccione una empresa..." searchPlaceholder="Buscar empresa..." />
                                </div>
                                <div>
                                    <Label htmlFor="tipo_entidad">Tipo de Entidad</Label>
                                    <Select name="tipo_entidad" onValueChange={(value) => handleGeneralChange('tipo_entidad', value)} value={generalData.tipo_entidad || ''}>
                                        <SelectTrigger className="bg-gray-900 border-gray-700 mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent><SelectItem value="proveedor">Proveedor</SelectItem><SelectItem value="deudor">Deudor</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="status">Estado</Label>
                                    <Select name="status" onValueChange={(value) => handleGeneralChange('status', value)} value={generalData.status || ''}>
                                        <SelectTrigger className="bg-gray-900 border-gray-700 mt-1"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent><SelectItem value="Borrador">Borrador</SelectItem><SelectItem value="En revision">En revisión</SelectItem><SelectItem value="Completado">Completado</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-full flex justify-end">
                                    <Button type="button" variant="outline" onClick={() => handleLoadEeffData(generalData.ruc)} disabled={!generalData.ruc || loading}>
                                        <Download className="h-4 w-4 mr-2" />
                                        {loading ? 'Cargando...' : 'Cargar datos de EEFF'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {years.length > 0 && (
                            <>
                                <FinancialTable title="Activos" fields={activoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} />
                                <FinancialTable title="Pasivos" fields={pasivoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingDown className="h-5 w-5 mr-2 text-red-400" />} />
                                <FinancialTable title="Patrimonio" fields={patrimonioFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<DollarSign className="h-5 w-5 mr-2 text-yellow-400" />} />
                            </>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting || years.length === 0} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium">
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