import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RibEeffService } from '@/services/ribEeffService';
import { FichaRucService } from '@/services/fichaRucService';
import { FichaRuc } from '@/types/ficha-ruc';
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
    const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
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
                    if (record && record.anio_reporte) {
                        setStartYear(record.anio_reporte - 1);
                        setGeneralData({
                            ruc: record.ruc,
                            tipo_entidad: record.tipo_entidad || undefined,
                            status: record.status || undefined,
                        });
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

    useEffect(() => {
        setYears([startYear, startYear + 1, startYear + 2]);
    }, [startYear]);

    useEffect(() => {
        const loadRucData = async () => {
            if (!generalData.ruc || years.length === 0) {
                setYearsData({});
                setExistingRecords([]);
                return;
            }
            try {
                const records = await RibEeffService.getByRucAndYears(generalData.ruc, years);
                setExistingRecords(records);
                const newYearsData = years.reduce((acc, year) => {
                    const recordForYear = records.find(r => r.anio_reporte === year);
                    acc[year] = recordForYear || {};
                    return acc;
                }, {});
                setYearsData(newYearsData);
            } catch (error) {
                console.error('Error fetching RUC data:', error);
                toast.error('No se pudieron cargar los datos para el RUC seleccionado.');
            }
        };
        loadRucData();
    }, [generalData.ruc, years]);

    const handleGeneralChange = (name: string, value: string) => {
        setGeneralData(prev => ({ ...prev, [name]: value }));
    };

    const handleYearDataChange = (year: number, name: string, value: string) => {
        const isNumericField = !['ruc', 'tipo_entidad', 'status'].includes(name);
        const parsedValue = value ? (isNumericField ? parseFloat(value) : value) : null;
        setYearsData(prev => ({
            ...prev,
            [year]: {
                ...prev[year],
                [name]: parsedValue,
            },
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
                if (!yearData || Object.keys(yearData).length <= 1) return; // Skip if only id is present

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
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="ruc">Empresa (RUC)</Label>
                                    <Combobox options={rucOptions} value={generalData.ruc || ''} onChange={(value) => handleGeneralChange('ruc', value)} placeholder="Seleccione una empresa..." searchPlaceholder="Buscar empresa..." />
                                </div>
                                <div>
                                    <Label htmlFor="startYear">Año de Inicio</Label>
                                    <Input id="startYear" name="startYear" type="number" placeholder="Ej: 2023" value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value) || new Date().getFullYear())} className="bg-gray-900 border-gray-700 mt-1" />
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
                            </CardContent>
                        </Card>

                        <FinancialTable title="Activos" fields={activoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} />
                        <FinancialTable title="Pasivos" fields={pasivoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingDown className="h-5 w-5 mr-2 text-red-400" />} />
                        <FinancialTable title="Patrimonio" fields={patrimonioFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<DollarSign className="h-5 w-5 mr-2 text-yellow-400" />} />

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