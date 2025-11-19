import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { SalesData } from '@/types/salesData';

interface VentasMensualesTableProps {
  data: SalesData;
  onDataChange: (year: number, month: string, value: number | null) => void;
}

const VentasMensualesTable: React.FC<VentasMensualesTableProps> = ({ data, onDataChange }) => {
  const years = Object.keys(data).map(Number).sort((a, b) => a - b);
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

  const handleInputChange = (year: number, month: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value.replace(/,/g, ''));
    onDataChange(year, month, isNaN(numericValue as any) ? null : numericValue);
  };

  const calculateYearlyTotal = (year: number) => {
    if (!data[year]) return 0;
    return months.reduce((total, month) => {
      const value = data[year][month];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('es-PE');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300 font-semibold">Mes</TableHead>
            {years.map(year => (
              <TableHead key={year} className="text-center text-gray-300 font-semibold">{year}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {months.map(month => (
            <TableRow key={month} className="border-gray-800 hover:bg-gray-900/30">
              <TableCell className="font-medium text-white capitalize">{month}</TableCell>
              {years.map(year => (
                <TableCell key={`${year}-${month}`} className="p-2">
                  <Input
                    type="text"
                    value={formatNumber(data[year]?.[month])}
                    onChange={(e) => handleInputChange(year, month, e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#00FF80] focus:border-transparent"
                    placeholder="0"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="border-gray-800 font-bold text-white bg-gray-900/50">
            <TableCell>Total Anual</TableCell>
            {years.map(year => (
              <TableCell key={`total-${year}`} className="text-right font-mono text-[#00FF80]">
                {calculateYearlyTotal(year).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default VentasMensualesTable;