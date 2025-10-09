import React from 'react';
import { Calculator } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReporteTributarioDeudor } from '@/services/reporteTributarioDeudorService';

interface IndicesFinancierosTableProps {
  data: Partial<ReporteTributarioDeudor> | null;
  onDataChange: (updatedData: Partial<ReporteTributarioDeudor>) => void;
  isProveedor?: boolean;
}

const IndicesFinancierosTable: React.FC<IndicesFinancierosTableProps> = ({ 
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
    const value = data?.[fieldName as keyof ReporteTributarioDeudor] as number | null;
    
    return (
      <TableCell className="p-2">
        <input
          type="text"
          value={value?.toString() || ''}
          onChange={(e) => handleInputChange(`${field}_${year}`, e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF80] focus:border-transparent"
          placeholder="0.00"
          step="0.01"
        />
      </TableCell>
    );
  };

  const rows = [
    {
      label: 'Solvencia',
      field: 'solvencia',
      description: 'Capacidad de la empresa para cumplir con sus obligaciones'
    },
    {
      label: 'Gestión',
      field: 'gestion',
      description: 'Eficiencia en el manejo de recursos y operaciones'
    }
  ];

  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300 font-semibold">Índice</TableHead>
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
                  <Calculator className="h-4 w-4 text-[#00FF80]" />
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
          <strong>Nota:</strong> Los índices financieros se expresan como ratios decimales (ej: 1.25 para 125%). Los campos vacíos se considerarán como 0.
        </p>
      </div>
    </div>
  );
};

export default IndicesFinancierosTable;