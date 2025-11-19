import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SalesData } from '@/pages/VentasMensuales';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface CombinedVentasMensualesTableProps {
  proveedorData: SalesData;
  deudorData: SalesData;
  proveedorName: string;
  deudorName: string;
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];

const CombinedVentasMensualesTable: React.FC<CombinedVentasMensualesTableProps> = ({
  proveedorData,
  deudorData,
  proveedorName,
  deudorName,
}) => {
  const years = Array.from(new Set([...Object.keys(proveedorData), ...Object.keys(deudorData)]))
    .map(Number)
    .filter(year => !isNaN(year))
    .sort((a, b) => b - a);

  const tableData = years.flatMap(year => 
    MONTHS.map(month => {
      const proveedorVenta = proveedorData[year]?.[month] ?? null;
      const deudorVenta = deudorData[year]?.[month] ?? null;
      
      if (proveedorVenta === null && deudorVenta === null) {
        return null;
      }

      return {
        year,
        month,
        proveedorVenta,
        deudorVenta,
      };
    }).filter((row): row is { year: number; month: string; proveedorVenta: number | null; deudorVenta: number | null; } => row !== null)
  );

  if (tableData.length === 0) {
    return <p className="text-center text-gray-400 py-8">No hay datos de ventas para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-b-gray-800 bg-gray-900/50">
            <TableHead className="text-gray-300 font-semibold">Año</TableHead>
            <TableHead className="text-gray-300 font-semibold">Mes</TableHead>
            <TableHead className="text-right text-gray-300 font-semibold">{`Ventas ${proveedorName}`}</TableHead>
            <TableHead className="text-right text-gray-300 font-semibold">{`Ventas ${deudorName}`}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => {
            const isNewYear = index > 0 && row.year !== tableData[index - 1].year;
            return (
              <TableRow 
                key={`${row.year}-${row.month}-${index}`} 
                className={cn(
                  "border-b-gray-800 hover:bg-gray-900/30",
                  isNewYear && "border-t-2 border-t-gray-700"
                )}
              >
                <TableCell className="font-medium text-white">{row.year}</TableCell>
                <TableCell className="capitalize text-white">{row.month}</TableCell>
                <TableCell className="text-right font-mono text-gray-300">
                  {row.proveedorVenta !== null ? formatCurrency(row.proveedorVenta) : <span className="text-gray-500">-</span>}
                </TableCell>
                <TableCell className="text-right font-mono text-gray-300">
                  {row.deudorVenta !== null ? formatCurrency(row.deudorVenta) : <span className="text-gray-500">-</span>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CombinedVentasMensualesTable;