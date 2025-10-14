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
import { CreateRibEeffDto, UpdateRibEeffDto, RibEeff } from '@/types/rib-eeff';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';

// ... (Field definitions remain the same)

const transformEeffToRibEeff = (eeff: Eeff): Partial<RibEeff> => {
    // ... (Transformation logic remains the same)
};

const FinancialTable = ({ title, fields, years, yearsData, handleChange, icon, entityType }) => (
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
  const { ruc: urlRuc } = useParams<{ ruc: string }>();
  const navigate = useNavigate();
  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [proveedorRuc, setProveedorRuc] = useState<string | null>(null);
  const [deudorRuc, setDeudorRuc] = useState<string | null>(null);
  
  const [yearsData, setYearsData] = useState<{ proveedor: { [key: number]: Partial<RibEeff> }, deudor: { [key: number]: Partial<RibEeff> } }>({ proveedor: {}, deudor: {} });
  const [years, setYears] = useState<number[]>([]);
  const [status, setStatus] = useState<'Borrador' | 'En revision' | 'Completado'>('Borrador');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const fichasData = await FichaRucService.getAll();
        setFichas(fichasData);

        if (urlRuc) {
          setProveedorRuc(urlRuc);
          await loadDataForRuc(urlRuc, 'proveedor');
        }
      } catch (error) {
        toast.error('No se pudieron cargar los datos iniciales.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [urlRuc]);

  const loadDataForRuc = async (ruc: string, entityType: 'proveedor' | 'deudor') => {
    const existingData = await RibEeffService.getByRuc(ruc);
    if (existingData.length > 0) {
      const loadedYears = [...new Set(existingData.map(d => d.anio_reporte).filter((y): y is number => y !== null))].sort((a, b) => b - a);
      setYears(prev => [...new Set([...prev, ...loadedYears])].sort((a, b) => b - a));

      const loadedYearsData = existingData.reduce((acc, record) => {
        if (record.anio_reporte) acc[record.anio_reporte] = record;
        return acc;
      }, {} as { [key: number]: Partial<RibEeff> });

      setYearsData(prev => ({ ...prev, [entityType]: loadedYearsData }));
      
      if (entityType === 'proveedor' && existingData[0].status) {
        setStatus(existingData[0].status);
      }
    }
  };

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
        return;
      }

      const allYears = [...new Set(eeffRecords.map(r => r.anio_reporte).filter((y): y is number => y !== null))].sort((a, b) => b - a);
      setYears(allYears);

      const newYearsData = { proveedor: {}, deudor: {} };
      
      for (const record of eeffRecords) {
        const entityType = record.ruc === proveedorRuc ? 'proveedor' : 'deudor';
        if (record.anio_reporte) {
          newYearsData[entityType][record.anio_reporte] = transformEeffToRibEeff(record);
        }
      }
      
      setYearsData(newYearsData);
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
      const recordsToUpsert: Partial<RibEeff>[] = [];
      
      // Proveedor
      years.forEach(year => {
        if (yearsData.proveedor[year]) {
          recordsToUpsert.push({
            ...yearsData.proveedor[year],
            ruc: proveedorRuc,
            tipo_entidad: 'proveedor',
            status: status,
            anio_reporte: year,
          });
        }
      });

      // Deudor
      if (deudorRuc) {
        years.forEach(year => {
          if (yearsData.deudor[year]) {
            recordsToUpsert.push({
              ...yearsData.deudor[year],
              ruc: deudorRuc,
              proveedor_ruc: proveedorRuc,
              tipo_entidad: 'deudor',
              status: status,
              anio_reporte: year,
            });
          }
        });
      }

      await RibEeffService.upsertMultiple(recordsToUpsert);
      toast.success('Datos de RIB EEFF guardados correctamente.');
      navigate('/rib-eeff');
    } catch (error) {
      toast.error('Error al guardar los registros de RIB EEFF.');
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
            <h1 className="text-3xl font-bold">Gestión de RIB EEFF</h1>
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
              <FinancialTable title={`Proveedor: ${fichas.find(f => f.ruc === proveedorRuc)?.nombre_empresa}`} fields={activoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} entityType="proveedor" />
            )}
            {deudorRuc && (
              <FinancialTable title={`Deudor: ${fichas.find(f => f.ruc === deudorRuc)?.nombre_empresa}`} fields={activoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} entityType="deudor" />
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