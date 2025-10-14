import React from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RibReporteTributario } from '@/services/ribReporteTributarioService';

interface RibReporteTributarioTableProps {
  reports: Partial<RibReporteTributario>[];
  years: number[];
  onDataChange: (updatedData: Partial<RibReporteTributario>) => void;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || typeof value === 'undefined' || isNaN(value)) return '';
  return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const RibReporteTributarioTable: React.FC<RibReporteTributarioTableProps> = ({ reports, years, onDataChange }) => {
  const handleInputChange = (year: number, field: keyof RibReporteTributario, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value.replace(/,/g, ''));
    const reportForYear = reports.find(r => r.anio === year) || { ruc: reports[0]?.ruc, anio: year, tipo_entidad: 'deudor' };
    onDataChange({
      ...reportForYear,
      [field]: numericValue,
    });
  };

  const fields: { key: keyof RibReporteTributario; label: string }[] = [
    { key: 'cuentas_por_cobrar_giro', label: 'Cuentas por Cobrar del Giro' },
    { key: 'total_activos', label: 'Total Activos' },
    { key: 'cuentas_por_pagar_giro', label: 'Cuentas por Pagar del Giro' },
    { key: 'total_pasivos', label: 'Total Pasivos' },
    { key: 'capital_pagado', label: 'Capital Pagado' },
    { key: 'total_patrimonio', label: 'Total Patrimonio' },
    { key: 'total_pasivo_patrimonio', label: 'Total Pasivo y Patrimonio' },
  ];

  return (
    <Table className="text-white">
      <TableHeader>
        <TableRow className="border-gray-800 hover:bg-transparent">
          <TableHead className="text-white font-bold">Estado de Situación</TableHead>
          {years.map(year => (
            <TableHead key={year} className="text-white font-bold text-right">Dic. {year}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map(({ key, label }) => (
          <TableRow key={key} className="border-gray-800 hover:bg-gray-900/50">
            <TableCell className="py-3">{label}</TableCell>
            {years.map(year => {
              const report = reports.find(r => r.anio === year);
              const value = report?.[key] as number | undefined;
              return (
                <TableCell key={year} className="text-right py-1">
                  <Input
                    type="text"
                    value={formatCurrency(value)}
                    onChange={(e) => handleInputChange(year, key, e.target.value)}
                    className="bg-gray-800 border-gray-700 text-right h-9"
                    placeholder="0.00"
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RibReporteTributarioTable;