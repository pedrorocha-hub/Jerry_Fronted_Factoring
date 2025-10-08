import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { SalesData } from '@/pages/VentasMensualesProveedor';

interface VentasMensualesDisplayTableProps {
  data: SalesData;
}

const VentasMensualesDisplayTable: React.FC<VentasMensualesDisplayTableProps> = ({ data }) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const years = [2023, 2024, 2025];

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

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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
                <TableCell key={year} className="text-right font-mono text-sm">
                  {formatCurrency(data[year]?.[month.toLowerCase()])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="border-gray-700 bg-gray-800/50">
            <TableHead className="font-bold text-white">Total Anual</TableHead>
            {years.map(year => (
              <TableHead key={year} className="font-bold text-white text-right">
                {formatCurrency(totals[year])}
              </TableHead>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default VentasMensualesDisplayTable;