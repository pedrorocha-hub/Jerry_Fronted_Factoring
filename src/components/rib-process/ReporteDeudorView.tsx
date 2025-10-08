import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReporteTributarioDeudor } from '@/services/reporteTributarioDeudorService';
import { ClipboardList } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ReporteDeudorView: React.FC<{ data: ReporteTributarioDeudor | null }> = ({ data }) => {
  if (!data) return <Card className="bg-[#121212] border-gray-800"><CardHeader><CardTitle>Reporte Tributario del Deudor</CardTitle></CardHeader><CardContent><p className="text-gray-500">No hay datos disponibles.</p></CardContent></Card>;

  const fields = [
    { label: 'Cuentas por Cobrar del Giro', prefix: 'cuentas_por_cobrar_giro' },
    { label: 'Total Activos', prefix: 'total_activos' },
    { label: 'Cuentas por Pagar del Giro', prefix: 'cuentas_por_pagar_giro' },
    { label: 'Total Pasivos', prefix: 'total_pasivos' },
    { label: 'Capital Pagado', prefix: 'capital_pagado' },
    { label: 'Total Patrimonio', prefix: 'total_patrimonio' },
    { label: 'Total Pasivo y Patrimonio', prefix: 'total_pasivo_patrimonio' },
  ];

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <ClipboardList className="h-5 w-5 mr-2 text-[#00FF80]" />
          4. Reporte Tributario del Deudor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-300">Concepto</TableHead>
              <TableHead className="text-gray-300">2022</TableHead>
              <TableHead className="text-gray-300">2023</TableHead>
              <TableHead className="text-gray-300">2024</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map(field => (
              <TableRow key={field.prefix} className="border-gray-800">
                <TableCell className="font-medium text-gray-400">{field.label}</TableCell>
                <TableCell className="text-white">{data[`${field.prefix}_2022` as keyof typeof data] || 'N/A'}</TableCell>
                <TableCell className="text-white">{data[`${field.prefix}_2023` as keyof typeof data] || 'N/A'}</TableCell>
                <TableCell className="text-white">{data[`${field.prefix}_2024` as keyof typeof data] || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReporteDeudorView;