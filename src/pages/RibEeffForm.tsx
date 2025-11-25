import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, ArrowLeft, Building, DollarSign, TrendingUp, TrendingDown, Download, User, Users, Plus, Trash2, Calendar } from 'lucide-react';
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
import { useSession } from '@/contexts/SessionContext';
import { AsyncCombobox, ComboboxOption } from '@/components/ui/async-combobox';
import { supabase } from '@/integrations/supabase/client';
import RibEeffAuditLogViewer from '@/components/audit/RibEeffAuditLogViewer';
import RibProcessWizard from '@/components/solicitud-operacion/RibProcessWizard';

const sum = (...args: (number | null | undefined)[]): number => {
  return args.reduce((acc, val) => acc + (val || 0), 0);
};

const transformEeffToRibEeff = (eeff: Eeff): Partial<RibEeff> => {
    const transformed: Partial<RibEeff> = {};

    // ACTIVO
    transformed.activo_caja_inversiones_disponible = sum(eeff.activo_efectivo_y_equivalentes_de_efectivo, eeff.activo_inversiones_financieras);
    transformed.activo_cuentas_por_cobrar_del_giro = eeff.activo_ctas_por_cobrar_comerciales_terceros;
    transformed.activo_cuentas_por_cobrar_relacionadas_no_comerciales = sum(eeff.activo_ctas_por_cobrar_comerciales_relacionadas, eeff.activo_ctas_por_cobrar_diversas_relacionadas);
    transformed.activo_cuentas_por_cobrar_personal_accionistas_directores = eeff.activo_cuentas_por_cobrar_al_personal_socios_y_directores;
    transformed.activo_otras_cuentas_por_cobrar_diversas = eeff.activo_ctas_por_cobrar_diversas_terceros;
    transformed.activo_existencias = sum(
        eeff.activo_mercaderias,
        eeff.activo_productos_terminados,
        eeff.activo_subproductos_desechos_y_desperdicios,
        eeff.activo_productos_en_proceso,
        eeff.activo_materias_primas,
        eeff.activo_materiales_aux_suministros_y_repuestos,
        eeff.activo_envases_y_embalajes,
        eeff.activo_inventarios_por_recibir
    ) - (eeff.activo_desvalorizacion_de_inventarios || 0);
    transformed.activo_gastos_pagados_por_anticipado = eeff.activo_serv_y_otros_contratados_por_anticipado;
    transformed.activo_otros_activos_corrientes = sum(eeff.activo_activos_no_ctes_mantenidos_para_la_venta, eeff.activo_otro_activos_corrientes);
    
    transformed.activo_total_activo_circulante = sum(
        transformed.activo_caja_inversiones_disponible,
        transformed.activo_cuentas_por_cobrar_del_giro,
        transformed.activo_cuentas_por_cobrar_relacionadas_no_comerciales,
        transformed.activo_cuentas_por_cobrar_personal_accionistas_directores,
        transformed.activo_otras_cuentas_por_cobrar_diversas,
        transformed.activo_existencias,
        transformed.activo_gastos_pagados_por_anticipado,
        transformed.activo_otros_activos_corrientes
    );

    transformed.activo_cuentas_por_cobrar_comerciales_lp = eeff.activo_ctas_por_cobrar_comerciales_terceros;
    transformed.activo_otras_cuentas_por_cobrar_diversas_lp = eeff.activo_ctas_por_cobrar_diversas_terceros;
    transformed.activo_activo_fijo_neto = sum(eeff.activo_propiedades_planta_y_equipo) - (eeff.activo_depreciacion_de_1_2_y_ppe_acumulados || 0);
    transformed.activo_inversiones_en_valores = sum(eeff.activo_inversiones_mobiliarias, eeff.activo_propiedades_de_inversion, eeff.activo_activos_por_derecho_de_uso);
    transformed.activo_intangibles = eeff.activo_intangibles;
    transformed.activo_activo_diferido_y_otros = sum(eeff.activo_activo_diferido, eeff.activo_otros_activos_no_corrientes);

    transformed.activo_total_activos_no_circulantes = sum(
        transformed.activo_cuentas_por_cobrar_comerciales_lp,
        transformed.activo_otras_cuentas_por_cobrar_diversas_lp,
        transformed.activo_activo_fijo_neto,
        transformed.activo_inversiones_en_valores,
        transformed.activo_intangibles,
        transformed.activo_activo_diferido_y_otros
    );
    
    transformed.activo_total_activos = eeff.activo_total_activo_neto;

    // PASIVO
    transformed.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo = eeff.pasivo_sobregiros_bancarios;
    transformed.pasivo_parte_corriente_obligaciones_bancos_y_leasing = eeff.pasivo_obligaciones_financieras;
    transformed.pasivo_cuentas_por_pagar_del_giro = eeff.pasivo_ctas_por_pagar_comerciales_terceros;
    transformed.pasivo_cuentas_por_pagar_relacionadas_no_comerciales = sum(eeff.pasivo_ctas_por_pagar_comerciales_relacionadas, eeff.pasivo_ctas_por_pagar_diversas_relacionadas);
    transformed.pasivo_otras_cuentas_por_pagar_diversas = eeff.pasivo_ctas_por_pagar_diversas_terceros;
    transformed.pasivo_dividendos_por_pagar = eeff.pasivo_ctas_por_pagar_accionistas_socios_participantes_y_direct;

    transformed.pasivo_total_pasivos_circulantes = sum(
        transformed.pasivo_sobregiro_bancos_y_obligaciones_corto_plazo,
        transformed.pasivo_parte_corriente_obligaciones_bancos_y_leasing,
        transformed.pasivo_cuentas_por_pagar_del_giro,
        transformed.pasivo_cuentas_por_pagar_relacionadas_no_comerciales,
        transformed.pasivo_otras_cuentas_por_pagar_diversas,
        transformed.pasivo_dividendos_por_pagar
    );

    transformed.pasivo_parte_no_corriente_obligaciones_bancos_y_leasing = eeff.pasivo_obligaciones_financieras;
    transformed.pasivo_cuentas_por_pagar_comerciales_lp = eeff.pasivo_ctas_por_pagar_comerciales_terceros;
    transformed.pasivo_otras_cuentas_por_pagar_diversas_lp = eeff.pasivo_ctas_por_pagar_diversas_terceros;
    transformed.pasivo_otros_pasivos = sum(eeff.pasivo_provisiones, eeff.pasivo_pasivo_diferido);

    transformed.pasivo_total_pasivos_no_circulantes = sum(
        transformed.pasivo_parte_no_corriente_obligaciones_bancos_y_leasing,
        transformed.pasivo_cuentas_por_pagar_comerciales_lp,
        transformed.pasivo_otras_cuentas_por_pagar_diversas_lp,
        transformed.pasivo_otros_pasivos
    );

    transformed.pasivo_total_pasivos = eeff.pasivo_total_pasivo;

    // PATRIMONIO NETO
    transformed.patrimonio_neto_capital_pagado = eeff.patrimonio_capital;
    transformed.patrimonio_neto_capital_adicional = sum(eeff.patrimonio_capital_adicional_positivo, eeff.patrimonio_capital_adicional_negativo);
    transformed.patrimonio_neto_excedente_de_revaluacion = eeff.patrimonio_excedente_de_revaluacion;
    transformed.patrimonio_neto_reserva_legal = eeff.patrimonio_reservas;
    transformed.patrimonio_neto_utilidad_perdida_acumulada = sum(eeff.patrimonio_resultados_acumulados_positivos, eeff.patrimonio_resultados_acumulados_negativos);
    transformed.patrimonio_neto_utilidad_perdida_del_ejercicio = sum(eeff.patrimonio_utilidad_de_ejercicio, eeff.patrimonio_perdida_de_ejercicio);
    transformed.patrimonio_neto_total_patrimonio = eeff.patrimonio_total_patrimonio;
    transformed.patrimonio_neto_total_pasivos_y_patrimonio = eeff.patrimonio_total_pasivo_y_patrimonio;

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSession();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [proveedorRuc, setProveedorRuc] = useState<string | null>(null);
  const [deudorRuc, setDeudorRuc] = useState<string | null>(null);
  const [proveedorNombre, setProveedorNombre] = useState<string>('');
  const [deudorNombre, setDeudorNombre] = useState<string>('');
  const [manualMode, setManualMode] = useState(false);
  const [newYear, setNewYear] = useState<string>(new Date().getFullYear().toString());
  
  const [yearsData, setYearsData] = useState<{ proveedor: { [key: number]: Partial<RibEeff> }, deudor: { [key: number]: Partial<RibEeff> } }>({ proveedor: {}, deudor: {} });
  const [years, setYears] = useState<number[]>([]);
  const [status, setStatus] = useState<'Borrador' | 'En revision' | 'Completado'>('Borrador');
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [initialSolicitudLabel, setInitialSolicitudLabel] = useState<string | null>(null);
  const [initialProveedorLabel, setInitialProveedorLabel] = useState<string | null>(null);
  const [initialDeudorLabel, setInitialDeudorLabel] = useState<string | null>(null);

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
    if (isEditMode && id) {
      fetchInitialData();
    } else {
      const rucParam = searchParams.get('ruc');
      const solicitudIdParam = searchParams.get('solicitud_id');
      
      if (rucParam && solicitudIdParam) {
        handleAutoInit(rucParam, solicitudIdParam);
      } else {
        setLoading(false);
      }
    }
  }, [id, isEditMode, searchParams]);

  const handleAutoInit = async (ruc: string, solicitudId: string) => {
    setLoading(true);
    try {
      // 1. Fetch Solicitud info for label
      const { data: solicitud } = await supabase
        .from('solicitudes_operacion')
        .select('id, ruc, created_at, proveedor')
        .eq('id', solicitudId)
        .single();
        
      let nombreProveedor = solicitud?.proveedor || 'Empresa sin nombre';
      
      if (solicitud) {
         const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).maybeSingle();
         setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
      }
      
      setSolicitudId(solicitudId);
      setProveedorRuc(ruc);

      // 2. Try to find Ficha RUC
      const fichaData = await FichaRucService.getByRuc(ruc);
      
      if (fichaData) {
        setProveedorNombre(fichaData.nombre_empresa);
        setInitialProveedorLabel(`${fichaData.nombre_empresa} (${fichaData.ruc})`);
      } else {
        // Manual Mode
        setManualMode(true);
        setProveedorNombre(nombreProveedor);
        showSuccess('Ficha RUC no encontrada. Iniciando modo manual.');
      }
      
      // Initialize with current year if new
      const currentYear = new Date().getFullYear();
      setYears([currentYear]);
      setYearsData(prev => ({
        ...prev,
        proveedor: {
          [currentYear]: {
            ruc: ruc,
            tipo_entidad: 'proveedor',
            anio_reporte: currentYear,
            solicitud_id: solicitudId
          }
        }
      }));
      
    } catch (err) {
      console.error("Error auto-initializing:", err);
      toast.error('Error al inicializar el formulario.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Check for ID in params. The ID here might be a single UUID from rib_eeff or a composite one.
        // If coming from the list view or wizard, it's usually a single record ID, but we need to load all related records (years).
        if (isEditMode && id) {
          // First, get the specific record to identify RUC and Solicitud
          const { data: singleRecord, error } = await supabase.from('rib_eeff').select('ruc, solicitud_id, tipo_entidad, anio_reporte').eq('id', id).maybeSingle();
          
          if (error) throw error;
          
          if (singleRecord) {
              // Now load all records for this RUC and Solicitud
              let query = supabase.from('rib_eeff').select('*').eq('ruc', singleRecord.ruc);
              
              if (singleRecord.solicitud_id) {
                  query = query.eq('solicitud_id', singleRecord.solicitud_id);
              } else {
                  query = query.is('solicitud_id', null);
              }
              
              const { data: existingData, error: loadError } = await query;
              
              if (loadError) throw loadError;

              if (existingData && existingData.length > 0) {
                const loadedYears = [...new Set(existingData.map(d => d.anio_reporte).filter((y): y is number => y !== null))].sort((a, b) => b - a);
                setYears(loadedYears);

                const proveedorData = existingData.find(d => d.tipo_entidad === 'proveedor');
                const deudorData = existingData.find(d => d.tipo_entidad === 'deudor');

                if (proveedorData) {
                  setProveedorRuc(proveedorData.ruc);
                  const proveedorFicha = await FichaRucService.getByRuc(proveedorData.ruc);
                  if (proveedorFicha) {
                    setInitialProveedorLabel(`${proveedorFicha.nombre_empresa} (${proveedorFicha.ruc})`);
                    setProveedorNombre(proveedorFicha.nombre_empresa);
                  } else {
                    // Manual mode fallback
                    setManualMode(true);
                    // Try to get name from somewhere or leave blank
                    // In a real manual scenario we might store the name in rib_eeff too, but currently schema might not support it directly unless added
                  }
                }
                
                if (deudorData) {
                  setDeudorRuc(deudorData.ruc);
                  const deudorFicha = await FichaRucService.getByRuc(deudorData.ruc);
                  if (deudorFicha) {
                    setInitialDeudorLabel(`${deudorFicha.nombre_empresa} (${deudorFicha.ruc})`);
                    setDeudorNombre(deudorFicha.nombre_empresa);
                  }
                }

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
                setSolicitudId(existingData[0].solicitud_id || null);

                if (existingData[0].solicitud_id) {
                  const { data: solicitud } = await supabase.from('solicitudes_operacion').select('id, ruc, created_at').eq('id', existingData[0].solicitud_id).single();
                  if (solicitud) {
                    const { data: ficha } = await supabase.from('ficha_ruc').select('nombre_empresa').eq('ruc', solicitud.ruc).maybeSingle();
                    setInitialSolicitudLabel(`${ficha?.nombre_empresa || solicitud.ruc} - ${new Date(solicitud.created_at).toLocaleDateString()}`);
                  }
                }
              }
          } else {
              toast.error('Registro no encontrado.');
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error('No se pudieron cargar los datos iniciales.');
      } finally {
        setLoading(false);
      }
    };

  const handleLoadEeffData = async () => {
    if (!proveedorRuc) {
      toast.info('Por favor, seleccione un proveedor.');
      return;
    }
    setLoading(true);
    try {
      // Cargar nombres de empresas si no los tenemos
      if (proveedorRuc && !initialProveedorLabel) {
        const proveedorFicha = await FichaRucService.getByRuc(proveedorRuc);
        if (proveedorFicha) {
          setInitialProveedorLabel(`${proveedorFicha.nombre_empresa} (${proveedorFicha.ruc})`);
        }
      }
      if (deudorRuc && !initialDeudorLabel) {
        const deudorFicha = await FichaRucService.getByRuc(deudorRuc);
        if (deudorFicha) {
          setInitialDeudorLabel(`${deudorFicha.nombre_empresa} (${deudorFicha.ruc})`);
        }
      }

      const rucsToLoad = [proveedorRuc, deudorRuc].filter((r): r is string => !!r);
      const eeffRecords = (await Promise.all(rucsToLoad.map(r => EeffService.getByRuc(r)))).flat();
      
      if (eeffRecords.length === 0) {
        toast.info('No se encontraron registros de EEFF para las empresas seleccionadas.');
        setYearsData({ proveedor: {}, deudor: {} }); // Limpiar datos si no se encuentra nada
        setYears([]);
        setLoading(false);
        return;
      }

      const allYears = [...new Set(eeffRecords.map(r => r.anio_reporte).filter((y): y is number => y !== null))].sort((a, b) => b - a);
      setYears(allYears);

      const newYearsData: { proveedor: { [key: number]: Partial<RibEeff> }, deudor: { [key: number]: Partial<RibEeff> } } = { proveedor: {}, deudor: {} };

      for (const record of eeffRecords) {
        const entityType = record.ruc === proveedorRuc ? 'proveedor' : (record.ruc === deudorRuc ? 'deudor' : null);
        if (entityType && record.anio_reporte) {
          const transformedData = transformEeffToRibEeff(record);
          if (!newYearsData[entityType][record.anio_reporte]) {
            newYearsData[entityType][record.anio_reporte] = {};
          }
          newYearsData[entityType][record.anio_reporte] = {
            ...newYearsData[entityType][record.anio_reporte],
            ...transformedData,
          };
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

  const handleAddYear = () => {
    const yearNumber = parseInt(newYear);
    if (isNaN(yearNumber)) {
      toast.error('Por favor, ingrese un año válido.');
      return;
    }
    if (years.includes(yearNumber)) {
      toast.error('Este año ya está agregado.');
      return;
    }
    setYears(prev => [...prev, yearNumber].sort((a, b) => b - a));
    toast.success(`Año ${yearNumber} agregado correctamente.`);
    setNewYear(new Date().getFullYear().toString());
  };

  const handleRemoveYear = (yearToRemove: number) => {
    if (!confirm(`¿Está seguro de eliminar el año ${yearToRemove}? Se perderán todos los datos de ese año.`)) return;
    
    setYears(prev => prev.filter(y => y !== yearToRemove));
    setYearsData(prev => {
      const newData = { ...prev };
      if (newData.proveedor[yearToRemove]) {
        const { [yearToRemove]: _, ...rest } = newData.proveedor;
        newData.proveedor = rest;
      }
      if (newData.deudor[yearToRemove]) {
        const { [yearToRemove]: _, ...rest } = newData.deudor;
        newData.deudor = rest;
      }
      return newData;
    });
    toast.success(`Año ${yearToRemove} eliminado.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorRuc) {
      toast.error('Por favor, ingrese el RUC del proveedor.');
      return;
    }
    
    if (manualMode && !proveedorNombre) {
      toast.error('Por favor, ingrese la razón social del proveedor.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Si es modo manual, guardar/actualizar las fichas RUC
      if (manualMode) {
        try {
          if (proveedorRuc && proveedorNombre) {
            const existingFicha = await FichaRucService.getByRuc(proveedorRuc);
            if (existingFicha) {
              if (existingFicha.nombre_empresa !== proveedorNombre) {
                await FichaRucService.update(existingFicha.id, {
                  nombre_empresa: proveedorNombre
                });
              }
            } else {
              await FichaRucService.create({
                ruc: proveedorRuc,
                nombre_empresa: proveedorNombre,
                actividad_empresa: ''
              });
            }
          }
          
          if (deudorRuc && deudorNombre) {
            const existingDeudorFicha = await FichaRucService.getByRuc(deudorRuc);
            if (existingDeudorFicha) {
              if (existingDeudorFicha.nombre_empresa !== deudorNombre) {
                await FichaRucService.update(existingDeudorFicha.id, {
                  nombre_empresa: deudorNombre
                });
              }
            } else {
              await FichaRucService.create({
                ruc: deudorRuc,
                nombre_empresa: deudorNombre,
                actividad_empresa: ''
              });
            }
          }
        } catch (err) {
          console.error('Error al guardar fichas RUC:', err);
          // No detener el guardado del reporte si falla la ficha
        }
      }
      
      const recordsToUpsert: Partial<RibEeff>[] = [];
      
      ['proveedor', 'deudor'].forEach(entityType => {
        const ruc = entityType === 'proveedor' ? proveedorRuc : deudorRuc;
        if (!ruc) return;

        years.forEach(year => {
          const yearData = yearsData[entityType as 'proveedor' | 'deudor'][year];
          if (yearData && Object.keys(yearData).length > 0) {
            
            const { created_at, ...restOfYearData } = yearData;
            
            // Using existing ID if present, otherwise generating a new one for fresh inserts
            // Note: If 'id' is present in yearData (from fetchInitialData), it's used for update.
            // If not present (new year or new report), a new UUID is generated or we use the URL id if available (though typically ID in URL is for edit).
            
            const record: Partial<RibEeff> = {
              ...restOfYearData,
              ...(yearData.id ? { id: yearData.id } : {}),
              
              ruc: ruc,
              tipo_entidad: entityType as 'proveedor' | 'deudor',
              status: status,
              anio_reporte: year,
              user_id: user?.id,
              updated_at: new Date().toISOString(),
              solicitud_id: solicitudId,
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

  const searchSolicitudes = useCallback(async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    const { data, error } = await supabase.rpc('search_solicitudes', { search_term: query });
    if (error) {
      console.error('Error searching solicitudes:', error);
      return [];
    }
    return data || [];
  }, []);

  const searchFichas = useCallback(async (query: string): Promise<ComboboxOption[]> => {
    if (query.length < 2) return [];
    try {
      // FichaRucService.search ya retorna el formato correcto {value, label}
      const fichasData = await FichaRucService.search(query);
      return fichasData;
    } catch (error) {
      console.error('Error searching fichas:', error);
      return [];
    }
  }, []);

  return (
    <Layout>
      <div className="p-6">
          <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{isEditMode ? 'Editar' : 'Nuevo'} RIB EEFF</h1>
            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }} 
                disabled={isSubmitting || years.length === 0} 
                className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/rib-eeff')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Volver
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* WIZARD PROCESS INDICATOR */}
            <RibProcessWizard solicitudId={solicitudId || undefined} currentStep="eeff" />

            <Card className="bg-[#121212] border border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-[#00FF80]" />
                    Selección de Empresas y Solicitud
                  </span>
                  <Button
                    type="button"
                    variant={manualMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setManualMode(!manualMode)}
                    className={manualMode ? "bg-[#00FF80] text-black hover:bg-[#00FF80]/90" : ""}
                  >
                    {manualMode ? "Modo Manual Activo" : "Activar Modo Manual"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!manualMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="proveedorRuc" className="text-gray-300">Proveedor</Label>
                      <AsyncCombobox
                        value={proveedorRuc}
                        onChange={(value) => {
                          setProveedorRuc(value);
                          if (value) {
                            // Cargar nombre automáticamente
                            FichaRucService.getByRuc(value).then(ficha => {
                              if (ficha) setProveedorNombre(ficha.nombre_empresa);
                            });
                          }
                        }}
                        onSearch={searchFichas}
                        placeholder="Buscar proveedor por RUC o nombre..."
                        searchPlaceholder="Escriba RUC o nombre de empresa..."
                        emptyMessage="No se encontraron empresas."
                        initialDisplayValue={initialProveedorLabel}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deudorRuc" className="text-gray-300">Deudor (Opcional)</Label>
                      <AsyncCombobox
                        value={deudorRuc}
                        onChange={(value) => {
                          setDeudorRuc(value);
                          if (value) {
                            FichaRucService.getByRuc(value).then(ficha => {
                              if (ficha) setDeudorNombre(ficha.nombre_empresa);
                            });
                          }
                        }}
                        onSearch={searchFichas}
                        placeholder="Buscar deudor por RUC o nombre..."
                        searchPlaceholder="Escriba RUC o nombre de empresa..."
                        emptyMessage="No se encontraron empresas."
                        initialDisplayValue={initialDeudorLabel}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-4">
                      <h3 className="text-white font-semibold flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Proveedor
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">RUC</Label>
                          <Input
                            type="text"
                            value={proveedorRuc || ''}
                            onChange={(e) => setProveedorRuc(e.target.value)}
                            placeholder="11 dígitos"
                            maxLength={11}
                            className="bg-gray-900 border-gray-700 font-mono text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Razón Social</Label>
                          <Input
                            type="text"
                            value={proveedorNombre}
                            onChange={(e) => setProveedorNombre(e.target.value)}
                            placeholder="Nombre de la empresa"
                            className="bg-gray-900 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-4">
                      <h3 className="text-white font-semibold flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Deudor (Opcional)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">RUC</Label>
                          <Input
                            type="text"
                            value={deudorRuc || ''}
                            onChange={(e) => setDeudorRuc(e.target.value)}
                            placeholder="11 dígitos"
                            maxLength={11}
                            className="bg-gray-900 border-gray-700 font-mono text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-300">Razón Social</Label>
                          <Input
                            type="text"
                            value={deudorNombre}
                            onChange={(e) => setDeudorNombre(e.target.value)}
                            placeholder="Nombre de la empresa"
                            className="bg-gray-900 border-gray-700 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label htmlFor="solicitud_id" className="text-gray-300">Asociar a Solicitud de Operación</Label>
                  <AsyncCombobox
                    value={solicitudId}
                    onChange={setSolicitudId}
                    onSearch={searchSolicitudes}
                    placeholder="Buscar por RUC, empresa o ID de solicitud..."
                    searchPlaceholder="Escriba para buscar..."
                    emptyMessage="No se encontraron solicitudes."
                    initialDisplayValue={initialSolicitudLabel}
                  />
                </div>
                <div className="md:col-span-2 flex justify-between items-end">
                  <div>
                    <Label htmlFor="status">Estado General</Label>
                    <Select name="status" onValueChange={(value: any) => setStatus(value)} value={status}>
                      <SelectTrigger className="bg-gray-900 border-gray-700 mt-1 w-[200px]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Borrador">Borrador</SelectItem><SelectItem value="En revision">En revisión</SelectItem><SelectItem value="Completado">Completado</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3">
                    {id && (
                      <RibEeffAuditLogViewer ribEeffId={id} />
                    )}
                    {!manualMode && (
                      <Button type="button" variant="outline" onClick={handleLoadEeffData} disabled={!proveedorRuc || loading}>
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Cargando...' : 'Cargar datos de EEFF'}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Control de Años */}
                <div className="md:col-span-2">
                  <Card className="bg-gray-900/50 border border-gray-700">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300 flex items-center mb-3">
                            <Calendar className="h-4 w-4 mr-2" />
                            Gestión de Años
                          </Label>
                          <div className="flex gap-3">
                            <Input
                              type="number"
                              value={newYear}
                              onChange={(e) => setNewYear(e.target.value)}
                              placeholder="Ej: 2024"
                              className="bg-gray-900 border-gray-700 text-white max-w-[150px]"
                              min="2000"
                              max="2100"
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleAddYear}
                              disabled={!proveedorRuc}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Año
                            </Button>
                          </div>
                        </div>
                        
                        {years.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-sm mb-2">Años activos:</p>
                            <div className="flex flex-wrap gap-2">
                              {years.map(year => (
                                <div 
                                  key={year} 
                                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2"
                                >
                                  <span className="text-white font-medium">{year}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveYear(year)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {proveedorRuc && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Proveedor: {proveedorNombre || initialProveedorLabel?.split(' (')[0] || proveedorRuc}</h2>
                <FinancialTable title="Activos" fields={activoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} entityType="proveedor" />
                <FinancialTable title="Pasivos" fields={pasivoFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<TrendingDown className="h-5 w-5 mr-2 text-red-400" />} entityType="proveedor" />
                <FinancialTable title="Patrimonio" fields={patrimonioFields} years={years} yearsData={yearsData} handleChange={handleYearDataChange} icon={<DollarSign className="h-5 w-5 mr-2 text-yellow-400" />} entityType="proveedor" />
              </div>
            )}
            
            {deudorRuc && (
              <div className="space-y-6 mt-8">
                <h2 className="text-2xl font-bold text-white">Deudor: {deudorNombre || initialDeudorLabel?.split(' (')[0] || deudorRuc}</h2>
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