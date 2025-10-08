import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComportamientoCrediticio } from '@/types/comportamientoCrediticio';
import { TrendingUp, Building2, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CreditTable: React.FC<{ title: string; icon: React.ReactNode; data: any; prefix: string }> = ({ title, icon, data, prefix }) => {
  const fields = [
    { label: 'Score', key: 'score' },
    { label: 'Calificación', key: 'calificacion' },
    { label: 'Deuda Directa', key: 'deuda_directa' },
    { label: 'Deuda Indirecta', key: 'deuda_indirecta' },
    { label: 'Impagos', key: 'impagos' },
    { label: 'Deuda SUNAT', key: 'deuda_sunat' },
    { label: 'Protestos', key: 'protestos' },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">{icon}{title}</h3>
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">Concepto</TableHead>
            <TableHead className="text-gray-300">Equifax</TableHead>
            <TableHead className="text-gray-300">Sentinel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map(field => (
            <TableRow key={field.label} className="border-gray-800 hover:bg-gray-900/50">
              <TableCell className="font-medium text-gray-400">{field.label}</TableCell>
              <TableCell className="text-white">{data[`${prefix}_equifax_${field.key}`] || 'N/A'}</TableCell>
              <TableCell className="text-white">{data[`${prefix}_sentinel_${field.key}`] || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 text-sm space-y-2">
        <p className="text-gray-400">Descripción APEFAC: <span className="text-white">{data[`${prefix}_apefac_descripcion`] || 'N/A'}</span></p>
        <p className="text-gray-400">Comentarios: <span className="text-white">{data[`${prefix}_comentarios`] || 'N/A'}</span></p>
      </div>
    </div>
  );
};

const ComportamientoCrediticioView: React.FC<{ data: ComportamientoCrediticio | null }> = ({ data }) => {
  if (!data) return <Card className="bg-[#121212] border-gray-800"><CardHeader><CardTitle>Comportamiento Crediticio</CardTitle></CardHeader><CardContent><p className="text-gray-500">No hay datos disponibles.</p></CardContent></Card>;

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
          3. Comportamiento Crediticio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <CreditTable 
          title="Proveedor" 
          icon={<Building2 className="h-5 w-5 mr-2" />} 
          data={data} 
          prefix="" 
        />
        <div className="border-t border-gray-800 pt-8">
          <CreditTable 
            title="Deudor" 
            icon={<User className="h-5 w-5 mr-2" />} 
            data={data} 
            prefix="deudor" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ComportamientoCrediticioView;