import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComportamientoCrediticio } from '@/types/comportamientoCrediticio';
import { TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ComportamientoCrediticioView: React.FC<{ data: ComportamientoCrediticio | null }> = ({ data }) => {
  if (!data) return <Card className="bg-[#121212] border-gray-800"><CardHeader><CardTitle>Comportamiento Crediticio</CardTitle></CardHeader><CardContent><p className="text-gray-500">No hay datos disponibles.</p></CardContent></Card>;

  const fields = [
    { label: 'Calificación', equifax: data.equifax_calificacion, sentinel: data.sentinel_calificacion },
    { label: 'Deuda Directa', equifax: data.equifax_deuda_directa, sentinel: data.sentinel_deuda_directa },
    { label: 'Deuda Indirecta', equifax: data.equifax_deuda_indirecta, sentinel: data.sentinel_deuda_indirecta },
    { label: 'Impagos', equifax: data.equifax_impagos, sentinel: data.sentinel_impagos },
    { label: 'Deuda SUNAT', equifax: data.equifax_deuda_sunat, sentinel: data.sentinel_deuda_sunat },
    { label: 'Protestos', equifax: data.equifax_protestos, sentinel: data.sentinel_protestos },
  ];

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
          3. Comportamiento Crediticio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-300">Concepto</TableHead>
              <TableHead className="text-gray-300">Equifax</TableHead>
              <TableHead className="text-gray-300">Sentinel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map(field => (
              <TableRow key={field.label} className="border-gray-800">
                <TableCell className="font-medium text-gray-400">{field.label}</TableCell>
                <TableCell className="text-white">{field.equifax || 'N/A'}</TableCell>
                <TableCell className="text-white">{field.sentinel || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ComportamientoCrediticioView;