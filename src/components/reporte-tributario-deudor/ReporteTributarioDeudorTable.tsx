import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { ReporteTributarioDeudor } from '@/services/reporteTributarioDeudorService';
import { useSession } from '@/contexts/SessionContext';

interface ReporteTributarioDeudorTableProps {
  ruc: string;
  initialData: ReporteTributarioDeudor | null;
  onSave: (data: any) => Promise<void>;
}

const years = [2022, 2023, 2024];
const metrics = [
  { key: 'cuentas_por_cobrar_giro', label: 'Cuentas por Cobrar del Giro' },
  { key: 'total_activos', label: 'Total ACTIVOS' },
  { key: 'cuentas_por_pagar_giro', label: 'Cuentas por pagar del giro' },
  { key: 'total_pasivos', label: 'Total PASIVOS' },
  { key: 'capital_pagado', label: 'Capital Pagado' },
  { key: 'total_patrimonio', label: 'Total Patrimonio' },
  { key: 'total_pasivo_patrimonio', label: 'Total Pasivo y Patrimonio' },
];

type TableData = {
  [key: string]: string;
};

const ReporteTributarioDeudorTable: React.FC<ReporteTributarioDeudorTableProps> = ({ ruc, initialData, onSave }) => {
  const { isAdmin } = useSession();
  const [tableData, setTableData] = useState<TableData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initialTableData: TableData = {};
    metrics.forEach(metric => {
      years.forEach(year => {
        const key = `${metric.key}_${year}`;
        initialTableData[key] = initialData?.[key as keyof typeof initialData]?.toString() || '';
      });
    });
    setTableData(initialTableData);
  }, [initialData]);

  const handleInputChange = (key: string, value: string) => {
    setTableData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveClick = async () => {
    setSaving(true);
    const dataToSave: { [key: string]: any } = { ruc };
    Object.keys(tableData).forEach(key => {
      const value = tableData[key];
      dataToSave[key] = value === '' ? null : parseFloat(value);
    });
    await onSave(dataToSave);
    setSaving(false);
  };

  const calculatePercentage = (value: string, totalKey: string) => {
    const numValue = parseFloat(value) || 0;
    const numTotal = parseFloat(tableData[totalKey]) || 0;
    if (numTotal === 0) return '0.00%';
    return `${((numValue / numTotal) * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800">
            <TableHead className="text-gray-300 w-1/4">Estado de situación</TableHead>
            {years.map(year => (
              <React.Fragment key={year}>
                <TableHead className="text-gray-300 text-center">Dic {year}</TableHead>
                <TableHead className="text-gray-300 text-center">%</TableHead>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map(metric => (
            <TableRow key={metric.key} className="border-gray-800">
              <TableCell className="font-medium text-white">{metric.label}</TableCell>
              {years.map(year => {
                const key = `${metric.key}_${year}`;
                const totalActivosKey = `total_activos_${year}`;
                return (
                  <React.Fragment key={year}>
                    <TableCell>
                      <Input
                        type="number"
                        value={tableData[key] || ''}
                        onChange={e => handleInputChange(key, e.target.value)}
                        className="bg-gray-900/50 border-gray-700 text-white text-right"
                        disabled={!isAdmin}
                      />
                    </TableCell>
                    <TableCell className="text-center text-gray-400">
                      {calculatePercentage(tableData[key] || '0', totalActivosKey)}
                    </TableCell>
                  </React.Fragment>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isAdmin && (
        <div className="flex justify-end">
          <Button onClick={handleSaveClick} disabled={saving} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Cambios
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReporteTributarioDeudorTable;