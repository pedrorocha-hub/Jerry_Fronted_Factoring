import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { SalesData } from '@/pages/VentasMensualesProveedor';

interface VentasMensualesTableProps {
  data: SalesData;
  onDataChange: (year: number, month: string, value: number | null) => void;
}

const VentasMensualesTable: React.FC<VentasMensualesTableProps> = ({ data, onDataChange }) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const years = [2023, 2024, 2025];

  const handleInputChange = (year: number, month: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    if (value === '' || (!isNaN(numericValue) && numericValue >= 0)) {
      onDataChange(year, month.toLowerCase(), numericValue);
    }
  };

  const totals = useMemo(() => {
    const yearTotals: { [year: number]: number } = {};
    years.forEach(year => {
      yearTotals[year] = months.reduce((acc, month) => {
        const monthKey = month.toLowerCase();
        const value = data[year]?.[monthKey] || 0;
        return acc + value;
      }, 0);
    });
    return yearTotals;
  }, [data, years, months]);

  const semesterTotals = useMemo(() => {
    const result: { [year: number]: { s1: number; s2: number } } = {};
    const s1Months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio'];
    const s2Months = ['julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

    years.forEach(year => {
      const s1Total = s1Months.reduce((acc, month) => acc + (data[year]?.[month] || 0), 0);
      const s2Total = s2Months.reduce((acc, month) => acc + (data[year]?.[month] || 0), 0);
      result[year] = { s1: s1Total, s2: s2Total };
    });
    return result;
  }, [data, years]);

  const formatCurrency = (value: number) => value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-transparent">
            <TableHead className="text-gray-300 font-bold min-w-[120px]">Mes</TableHead>
            {years.map(year => (
              <TableHead key={year} className="text-gray-300 font-bold text-center">{year}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {months.map(month => (
            <TableRow key={month} className="border-gray-800">
              <TableCell className="font-medium text-gray-300">{month}</TableCell>
              {years.map(year => (
                <TableCell key={year}>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={data[year]?.[month.toLowerCase()] ?? ''}
                    onChange={(e) => handleInputChange(year, month, e.target.value)}
                    className="bg-gray-900/50 border-gray-700 text-right"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="border-t-2 border-gray-700 bg-gray-800/50">
            <TableHead className="font-bold text-white">Total Anual</TableHead>
            {years.map(year => (
              <TableHead key={year} className="font-bold text-white text-right">
                {formatCurrency(totals[year])}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="border-gray-800 bg-gray-800/30">
            <TableHead className="font-semibold text-gray-300">1er Semestre</TableHead>
            {years.map(year => (
              <TableHead key={year} className="font-semibold text-gray-300 text-right">
                {formatCurrency(semesterTotals[year].s1)}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="border-gray-800 bg-gray-800/30">
            <TableCell className="text-gray-400 pl-8">% s/ Total</TableCell>
            {years.map(year => (
              <TableCell key={year} className="text-gray-400 text-right">
                {totals[year] > 0 ? `${((semesterTotals[year].s1 / totals[year]) * 100).toFixed(2)}%` : '0.00%'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow className="border-gray-800 bg-gray-800/30">
            <TableHead className="font-semibold text-gray-300">2do Semestre</TableHead>
            {years.map(year => (
              <TableHead key={year} className="font-semibold text-gray-300 text-right">
                {formatCurrency(semesterTotals[year].s2)}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="border-gray-800 bg-gray-800/30">
            <TableCell className="text-gray-400 pl-8">% s/ Total</TableCell>
            {years.map(year => (
              <TableCell key={year} className="text-gray-400 text-right">
                {totals[year] > 0 ? `${((semesterTotals[year].s2 / totals[year]) * 100).toFixed(2)}%` : '0.00%'}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default VentasMensualesTable;