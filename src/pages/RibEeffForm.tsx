import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Building, DollarSign, TrendingUp, TrendingDown, Download, User, Users } from 'lucide-react';
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
import { RibEeff } from '@/types/rib-eeff';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';
import { useSession } from '@/contexts/SessionContext';

const transformEeffToRibEeff = (eeff: Eeff): Partial<RibEeff> => {
    const transformed: Partial<RibEeff> = {};
    for (const key in eeff) {
        if (key.startsWith('activo_') || key.startsWith('pasivo_') || key.startsWith('patrimonio_')) {
            transformed[key as keyof RibEeff] = eeff[key as keyof Eeff] as number | null;
        }
    }
    return transformed;
};

const FinancialTable = ({ title, fields, years, yearsData, handleChange, icon, entityType }) => (
    <Card className="bg-[#121212] border border-gray-800">
        <CardHeader><CardTitle className="flex items-center text-white">{icon}{title}</CardTitle></CardHeader>
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
                                            value={yearsData[entityType]?.[year]?.[name] || ''}
                                            onChange={(e) => handleChange(entityType, year, name, e.target.value)}
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
  const { user } = useSession();
  const isEditMode = !!id;

  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [proveedorRuc, setProveedorRuc] = useState<string | null>(null);
  const [deudorRuc, setDeudorRuc] = useState<string | null>(null);
  
  const [yearsData, setYearsData] = useState<{ proveedor: { [key: number]: Partial<RibEeff> }, deudor: { [key: number]: Partial<RibEeff> } }>({ proveedor: {}, deudor: {} });
  const [years, setYears] = useState<number[]>([]);
  const [status, setStatus] = useState<'Borrador' | 'En revision' | 'Completado'>('Borrador');

  const activoFields = {
    activo_caja_inversiones_disponible: "Caja e Inversiones Disponibles",
    activo_cuentas_por_cobrar_del_giro: "Cuentas por Cobrar del Giro",
    activo_cuentas_por_cobrar_relacionadas_no_comerciales: "Cuentas por Cobrar Relacionadas (No Comerciales)",
    activo_cuentas_por_cobrar_personal_accionistas_directores: "Cuentas por Cobrar (Personal, Accionistas, Directores)",
    activo_otras_cuentas_por_cobrar_diversas: "Otras Cuentas por Cobrar Diversas",
    activo_existencias: "Existencias",
    activo_gastos_pagados_por_anticipado: "Gastos Pagados por Anticipado",
    activo_otros_activos_corrientes: "Otros Activos Corrientes",
    activo_total_activo_circulante: "Total Activo Circulante",
    activo_cuentas_por_cobrar_comerciales_lp: "Cuentas por Cobrar Comerciales (Largo Plazo)",
    activo_otras_cuentas_por_cobrar_diversas_lp: "Otras Cuentas por Cobrar Diversas (Largo Plazo)",
    activo_activo_fijo_neto: "Activo Fijo Neto",
    activo_inversiones_en_valores: "Inversiones en Valores",
    activo_intangibles: "Intangibles",
    activo_activo_diferido_y_otros: "Activo Diferido y Otros",
    activo_total_activos_no_circulantes: "Total Activos no Circulantes",
    activo_total_activos: "Total Activos",
  };

  const pasivoFields = {
    pasivo_sobregiro_bancos_y_obligaciones_corto_plazo: "Sobregiro Bancos y Obligaciones (Corto Plazo)",
    pasivo_parte_corriente_obligaciones_bancos_y_leasing: "Parte Corriente Obligaciones Bancos y Leasing",
    pasivo_cuentas_por_pagar_del_giro: "Cuentas por Pagar del Giro",
    pasivo_cuentas_por_pagar_relacionadas_no_comerciales: "Cuentas por Pagar Relacionadas (No Comerciales)",
    pasivo_otras_cuentas_por_pagar_diversas: "Otras Cuentas por Pagar Diversas",
    pasivo_dividendos_por_pagar: "Dividendos por Pagar",
    pasivo_total_pasivos_circulantes: "Total Pasivos Circulantes",
    pasivo_parte_no_corriente_obligaciones_bancos_y_leasing: "Parte no Corriente Obligaciones Bancos y Leasing",
    pasivo_cuentas_por_pagar_comerciales_lp: "Cuentas por Pagar Comerciales (Largo Plazo)",
    pasivo_otras_cuentas_por_pagar_diversas_lp: "Otras Cuentas por Pagar Diversas (Largo Plazo)",
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

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const fichasData = await FichaRucService.getAll();
        setFichas(fichasData);

        if (isEditMode && id) {
          const existingData = await RibEeffService.getById(id);
          if (existingData.length > 0) {
            const loadedYears = [...new Set(existingData.map(d => d.anio_reporte).filter((y): y is number => y !== null))].sort((a, b) => b - a);
            setYears(loadedYears);

            const proveedorData = existingData.find(d => d.tipo_entidad === 'proveedor');
            const deudorData = existingData.find(d => d.tipo_entidad === 'deudor');

            if (proveedorData) setProveedorRuc(proveedorData.ruc);
            if (deudorData) setDeudorRuc(deudorData.ruc);

            const loadedYearsData = existingData.reduce((acc, record) => {
              if (record.anio_reporte) {
                const entityType = record.tipo_entidad === 'proveedor' ? 'proveedor' : 'deudor';
                if (!acc[entityType]) acc[entityType] = {};
                acc[entityType][record.anio_reporte] = record;
              }
              return acc;
            }, { proveedor: {}, deudor: {} } as any);

            setYearsData(loadedYearsData);
            setStatus(existingData[0].status || 'Borrador');
          }
        }
      } catch (error) {
        toast.error('No se pudieron cargar los datos iniciales.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditMode]);

  const handleLoadEeffData = async () => {
    if (!proveedorRuc) {
      toast.info('Por favor, seleccione un proveedor.');
      return;
    }
    setLoading(true);
    try {
      const rucsToLoad = [proveedorRuc, deudorRuc].filter((r): r is string => !!r);
      const eeffRecords = (await Promise.all(rucsToLoad.map(r => EeffService.getByRuc(r)))).flat();
      
      if (eeffRecords.length === 0) {
        toast.info('No se encontraron registros de EEFF para las empresas seleccionadas.');
        setLoading(false);
        return;
      }

      const allYears = [...new Set(eeffRecords.map(r => r.anio_reporte).filter((y): y is number => y !== null))].sort((a, b) => b - a);
      setYears(allYears);

      setYearsData(prevYearsData => {
        const updatedYearsData = JSON.parse(JSON.stringify(prevYearsData));
        for (const record of eeffRecords) {
          const entityType = record.ruc === proveedorRuc ? 'proveedor' : 'deudor';
          if (record.anio_reporte) {
            const transformedData = transformEeffToRibEeff(record);
            updatedYearsData[entityType][record.anio_reporte] = {
              ...(updatedYearsData[entityType][record.anio_reporte] || {}),
              ...transformedData,
            };
          }
        }
        return updatedYearsData;
      });
      
      toast.success(`Datos de ${allYears.length} año(s) cargados desde EEFF.`);
    } catch (error) {
      toast.error('No se pudieron cargar los datos de EEFF.');
    } finally {
      setLoading(false);
    }
  };

  const handleYearDataChange = (entityType: 'proveedor' | 'deudor', year: number, name: string, value: string) => {
    const parsedValue = value ? parseFloat(value) : null;
    setYearsData(prev => ({
      ...prev,
      [entityType]: {
        ...prev[entityType],
        [year]: { ...prev[entityType][year], [name]: parsedValue },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorRuc) {
      toast.error('Por favor, seleccione una empresa proveedora.');
      return;
    }
    setIsSubmitting(true);
    try {
      const reportId = id || crypto.randomUUID();
      const recordsToUpsert: Partial<RibEeff>[] = [];
      
      ['proveedor', 'deudor'].forEach(entityType => {
        const ruc = entityType === 'proveedor' ? proveedorRuc : deudorRuc;
        if (!ruc) return;

        years.forEach(year => {
          const yearData = yearsData[entityType as 'proveedor' | 'deudor'][year];
          if (yearData && Object.keys(yearData).length > 0) {
            
            // Destructure to remove problematic fields before spreading
            const { created_at, ...restOfYearData } = yearData;

            const record: Partial<RibEeff> = {
              ...restOfYearData,
              id: reportId,
              ruc: ruc,
              tipo_entidad: entityType as 'proveedor' | 'deudor',
              status: status,
              anio_reporte: year,
              user_id: user?.id,
              updated_at: new Date().toISOString(),
            };

            recordsToUpsert.push(record);
          }
        });
      });

      if (recordsToUpsert.length === 0) {
        toast.info("No hay datos para guardar.");
        setIsSubmitting(false);
        return;
      }

      await RibEeffService.upsertMultiple(recordsToUpsert);
      toast.success('Datos de RIB EEFF guardados correctamente.');
      navigate('/rib-eeff');
    } catch (error) {
      console.error("Error saving RIB EEFF:", error);
      toast.error(`Error al guardar los registros de RIB EEFF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rucOptions = fichas.map(ficha => ({ value: ficha.ruc, label: `${ficha.nombre_empresa} (${ficha.ruc})` }));

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{isEditMode ? 'Editar' : 'Nuevo'} RIB EEFF</h1>
            <Button variant="outline" onClick={() => navigate('/rib-eeff')}><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader><CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2 text-[#00FF80]" />Selección de Empresas</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="proveedorRuc">Proveedor</Label>
                  <Combobox options={rucOptions} value={proveedorRuc || ''} onChange={setProveedorRuc} placeholder="Seleccione un proveedor..." searchPlaceholder="Buscar proveedor..." />
                </div>
                <div>
                  <Label htmlFor="deudorRuc">Deudor</Label>
                  <Combobox options={rucOptions} value={deudorRuc || ''} onChange={setDeudorRuc} placeholder="Seleccione un deudor..." searchPlaceholder="Buscar deudor..." />
                </div>
                <div className="md:col-span-2 flex justify-between items-end">
                  <div>
                    <Label htmlFor="status">Estado General</Label>
                    <Select name="status" onValueChange={(value: any) => setStatus(value)} value={status}>
                      <SelectTrigger className="bg-gray-900 border-gray-700 mt-1 w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Borrador">Borrador</SelectItem><SelectItem value="En revision">En revisión</SelectItem><SelectItem value="Completado">Completado</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" onClick={handleLoadEeffData} disabled={!proveedorRuc || loading}>
                    <Download className="h-4 w-4 mr-2" />
                    {loading ? 'Cargando...' : 'Cargar datos de EEFF'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {proveedorRuc && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Proveedor: {fichas.find(f => f.ruc === proveedorRuc)?.nombre_empresa}</h2>
                <FinancialTable title="Activos" fields={activoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} entityType="proveedor" />
                <FinancialTable title="Pasivos" fields={pasivoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingDown className="h-5 w-5 mr-2 text-red-400" />} entityType="proveedor" />
                <FinancialTable title="Patrimonio" fields={patrimonioFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<DollarSign className="h-5 w-5 mr-2 text-yellow-400" />} entityType="proveedor" />
              </div>
            )}
            
            {deudorRuc && (
              <div className="space-y-6 mt-8">
                <h2 className="text-2xl font-bold text-white">Deudor: {fichas.find(f => f.ruc === deudorRuc)?.nombre_empresa}</h2>
                <FinancialTable title="Activos" fields={activoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} entityType="deudor" />
                <FinancialTable title="Pasivos" fields={pasivoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingDown className="h-5 w-5 mr-2 text-red-400" />} entityType="deudor" />
                <FinancialTable title="Patrimonio" fields={patrimonioFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<DollarSign className="h-5 w-5 mr-2 text-yellow-400" />} entityType="deudor" />
              </div>
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