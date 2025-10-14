import React from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RibReporteTributario } from '@/services/ribReporteTributarioService';

interface EstadosResultadosTableProps {
  data: Partial<RibReporteTributario> | null;
  onDataChange: (updatedData: Partial<RibReporteTributario>) => void;
  isProveedor?: boolean;
}

const EstadosResultadosTable: React.FC<EstadosResultadosTableProps> = ({ 
  data, 
  onDataChange, 
  isProveedor = false 
}) => {
  const getSuffix = () => isProveedor ? '_proveedor' : '';

  const handleInputChange = (field: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value.replace(/,/g, ''));
    const fieldName = `${field}${getSuffix()}`;
    onDataChange({
      ...data,
      [fieldName]: numericValue,
    });
  };

  const InputCell = ({ field, year }: { field: string; year: string }) => {
    const fieldName = `${field}_${year}${getSuffix()}`;
    const value = data?.[fieldName as keyof RibReporteTributario] as number | null;
    
    return (
      <TableCell className="p-2">
        <input
          type="text"
          value={value?.toString() || ''}
          onChange={(e) => handleInputChange(`${field}_${year}`, e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF80] focus:border-transparent"
          placeholder="0"
        />
      </TableCell>
    );
  };

  const rows = [
    {
      label: 'Ingreso por ventas',
      field: 'ingreso_ventas',
      description: 'Ingresos totales por ventas del período'
    },
    {
      label: 'Utilidad bruta',
      field: 'utilidad_bruta',
      description: 'Utilidad bruta después de costos directos'
    },
    {
      label: 'Utilidad/(Pérdida) antes de impuesto',
      field: 'utilidad_antes_impuesto',
      description: 'Resultado antes de aplicar impuestos'
    }
  ];

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300 font-semibold">Concepto</TableHead>
            <TableHead className="text-center text-gray-300 font-semibold">Dic 2022</TableHead>
            <TableHead className="text-center text-gray-300 font-semibold">Dic 2023</TableHead>
            <TableHead className="text-center text-gray-300 font-semibold">Dic 2024</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.field} className="border-gray-800 hover:bg-gray-900/30">
              <TableCell className="font-medium text-white">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-[#00FF80]" />
                  <div>
                    <div>{row.label}</div>
                    <div className="text-xs text-gray-400">{row.description}</div>
                  </div>
                </div>
              </TableCell>
              <InputCell field={row.field} year="2022" />
              <InputCell field={row.field} year="2023" />
              <InputCell field={row.field} year="2024" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-4 bg-gray-900/30 border-t border-gray-800">
        <p className="text-xs text-gray-400">
          <strong>Nota:</strong> Ingrese los valores en soles peruanos (PEN). Los campos vacíos se considerarán como 0.
        </p>
      </div>
    </div>
  );
};

export default EstadosResultadosTable;