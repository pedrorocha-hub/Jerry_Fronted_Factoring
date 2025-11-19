import React from 'react';
import { FileSpreadsheet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DossierRib } from '@/types/dossier';
import { RibEeff } from '@/types/rib-eeff';

interface RibEeffSectionProps {
  dossier: DossierRib;
}

const FinancialTableDisplay = ({ title, fields, data, icon }: { title: string, fields: Record<string, string>, data: Record<number, Partial<RibEeff>>, icon: React.ReactNode }) => {
  const years = Object.keys(data).map(Number).sort((a, b) => b - a);
  if (years.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-white font-medium flex items-center">{icon}{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b-gray-800 bg-gray-900/50">
              <TableHead className="min-w-[250px] text-gray-400">Concepto</TableHead>
              {years.map(year => <TableHead key={year} className="text-center min-w-[150px] text-gray-400">{year}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(fields).map(([name, label]) => (
              <TableRow key={name} className="border-gray-800">
                <TableCell className="text-gray-300 text-sm font-light">{label}</TableCell>
                {years.map(year => (
                  <TableCell key={year} className="text-right font-mono text-white">
                    {(data[year]?.[name as keyof RibEeff] as number)?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const RibEeffSection: React.FC<RibEeffSectionProps> = ({ dossier }) => {
  const { ribEeff = [] } = dossier;

  const deudorData = ribEeff.filter(r => r.tipo_entidad === 'deudor').reduce((acc, record) => {
    if (record.anio_reporte) acc[record.anio_reporte] = record;
    return acc;
  }, {} as Record<number, Partial<RibEeff>>);

  const proveedorData = ribEeff.filter(r => r.tipo_entidad === 'proveedor').reduce((acc, record) => {
    if (record.anio_reporte) acc[record.anio_reporte] = record;
    return acc;
  }, {} as Record<number, Partial<RibEeff>>);

  // Corregido: Cargar los campos desde las props estáticas
  const { activoFields, pasivoFields, patrimonioFields } = (RibEeffSection as any).defaultProps;

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileSpreadsheet className="h-5 w-5 mr-2 text-[#00FF80]" />
          6. RIB - Estados Financieros (EEFF)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.keys(deudorData).length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Deudor: {dossier.fichaRuc?.nombre_empresa}</h3>
            <FinancialTableDisplay title="Activos" fields={activoFields} data={deudorData} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} />
            <FinancialTableDisplay title="Pasivos" fields={pasivoFields} data={deudorData} icon={<TrendingDown className="h-5 w-5 mr-2 text-red-400" />} />
            <FinancialTableDisplay title="Patrimonio" fields={patrimonioFields} data={deudorData} icon={<DollarSign className="h-5 w-5 mr-2 text-yellow-400" />} />
          </div>
        )}
        {Object.keys(proveedorData).length > 0 && (
          <div className="space-y-6 border-t border-gray-800 pt-8">
            <h3 className="text-xl font-bold text-white">Proveedor</h3>
            <FinancialTableDisplay title="Activos" fields={activoFields} data={proveedorData} icon={<TrendingUp className="h-5 w-5 mr-2 text-green-400" />} />
            <FinancialTableDisplay title="Pasivos" fields={pasivoFields} data={proveedorData} icon={<TrendingDown className="h-5 w-5 mr-2 text-red-400" />} />
            <FinancialTableDisplay title="Patrimonio" fields={patrimonioFields} data={proveedorData} icon={<DollarSign className="h-5 w-5 mr-2 text-yellow-400" />} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Los campos se definen aquí y se acceden desde el componente
(RibEeffSection as any).defaultProps = {
  activoFields: {
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
  },
  pasivoFields: {
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
  },
  patrimonioFields: {
    patrimonio_neto_capital_pagado: "Capital Pagado",
    patrimonio_neto_capital_adicional: "Capital Adicional",
    patrimonio_neto_excedente_de_revaluacion: "Excedente de Revaluación",
    patrimonio_neto_reserva_legal: "Reserva Legal",
    patrimonio_neto_utilidad_perdida_acumulada: "Utilidad/Pérdida Acumulada",
    patrimonio_neto_utilidad_perdida_del_ejercicio: "Utilidad/Pérdida del Ejercicio",
    patrimonio_neto_total_patrimonio: "Total Patrimonio",
    patrimonio_neto_total_pasivos_y_patrimonio: "Total Pasivos y Patrimonio",
  }
};

export default RibEeffSection;