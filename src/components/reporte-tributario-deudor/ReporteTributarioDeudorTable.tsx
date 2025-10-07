import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReporteTributarioDeudor } from '@/services/reporteTributarioDeudorService';

interface ReporteTributarioDeudorTableProps {
  ruc: string;
  data: Partial<ReporteTributarioDeudor> | null;
  onDataChange: (updatedData: Partial<ReporteTributarioDeudor>) => void;
}

const ReporteTributarioDeudorTable: React.FC<ReporteTributarioDeudorTableProps> = ({ ruc, data, onDataChange }) => {
  const [formData, setFormData] = useState<Partial<ReporteTributarioDeudor>>({});

  useEffect(() => {
    setFormData(data || { ruc });
  }, [data, ruc]);

  const handleInputChange = (field: keyof ReporteTributarioDeudor, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    const updatedFormData = { ...formData, [field]: numericValue };
    setFormData(updatedFormData);
    onDataChange(updatedFormData);
  };

  const renderYearlyInput = (fieldPrefix: string, label: string) => (
    <TableRow className="border-gray-800">
      <TableCell className="font-medium text-gray-300">{label}</TableCell>
      {['2022', '2023', '2024'].map(year => (
        <TableCell key={year}>
          <Input
            type="number"
            placeholder="0.00"
            value={formData[`${fieldPrefix}_${year}`] as number ?? ''}
            onChange={(e) => handleInputChange(`${fieldPrefix}_${year}` as keyof ReporteTributarioDeudor, e.target.value)}
            className="bg-gray-900/50 border-gray-700"
          />
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-transparent">
            <TableHead className="text-gray-300">Concepto</TableHead>
            <TableHead className="text-gray-300">2022</TableHead>
            <TableHead className="text-gray-300">2023</TableHead>
            <TableHead className="text-gray-300">2024</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renderYearlyInput('cuentas_por_cobrar_giro', 'Cuentas por Cobrar del Giro')}
          {renderYearlyInput('total_activos', 'Total Activos')}
          {renderYearlyInput('cuentas_por_pagar_giro', 'Cuentas por Pagar del Giro')}
          {renderYearlyInput('total_pasivos', 'Total Pasivos')}
          {renderYearlyInput('capital_pagado', 'Capital Pagado')}
          {renderYearlyInput('total_patrimonio', 'Total Patrimonio')}
          {renderYearlyInput('total_pasivo_patrimonio', 'Total Pasivo y Patrimonio')}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReporteTributarioDeudorTable;