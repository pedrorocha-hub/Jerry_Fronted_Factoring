import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VentasMensualesProveedor } from '@/types/ventasMensualesProveedor';
import { BarChart3 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const VentasProveedorView: React.FC<{ data: VentasMensualesProveedor | null }> = ({ data }) => {
  if (!data) return <Card className="bg-[#121212] border-gray-800"><CardHeader><CardTitle>Ventas Mensuales del Proveedor</CardTitle></CardHeader><CardContent><p className="text-gray-500">No hay datos disponibles.</p></CardContent></Card>;

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const years = [2023, 2024, 2025];

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <BarChart3 className="h-5 w-5 mr-2 text-[#00FF80]" />
          5. Ventas Mensuales del Proveedor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-300">Mes</TableHead>
              {years.map(year => <TableHead key={year} className="text-gray-300">{year}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {months.map(month => (
              <TableRow key={month} className="border-gray-800">
                <TableCell className="font-medium text-gray-400">{month}</TableCell>
                {years.map(year => (
                  <TableCell key={year} className="text-white">
                    {data[`${month.toLowerCase()}_${year}`] || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VentasProveedorView;