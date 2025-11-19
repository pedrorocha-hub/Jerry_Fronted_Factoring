import React, { useState, useCallback } from 'react';
import { Calculator } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RibReporteTributario } from '@/services/ribReporteTributarioService';

interface IndicesFinancierosTableProps {
  data: Partial<RibReporteTributario> | null;
  onDataChange: (updatedData: Partial<RibReporteTributario>) => void;
  isProveedor?: boolean;
}

const IndicesFinancierosTable: React.FC<IndicesFinancierosTableProps> = ({ 
  data, 
  onDataChange, 
  isProveedor = false 
}) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  
  const getSuffix = useCallback(() => isProveedor ? '_proveedor' : '', [isProveedor]);

  const handleInputChange = useCallback((field: string, value: string) => {
    // Solo actualizar el estado local mientras escribe
    setLocalValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleInputBlur = useCallback((field: string, value: string) => {
    // Propagar al padre solo cuando pierde el focus
    const numericValue = value === '' ? null : parseFloat(value.replace(/,/g, ''));
    onDataChange({
      [field]: numericValue,
    });
    // Limpiar el valor local después de guardarlo
    setLocalValues(prev => {
      const newValues = { ...prev };
      delete newValues[field];
      return newValues;
    });
  }, [onDataChange]);

  const InputCell = ({ field, year }: { field: string; year: string }) => {
    const fieldName = `${field}_${year}${getSuffix()}`;
    const dataValue = data?.[fieldName as keyof RibReporteTributario] as number | null;
    
    // Usar el valor local si existe, sino usar el valor de data
    const displayValue = localValues[fieldName] !== undefined 
      ? localValues[fieldName] 
      : (dataValue?.toString() || '');
    
    return (
      <TableCell className="p-2">
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={(e) => {
            // Solo permitir números, puntos y comas
            const value = e.target.value;
            if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
              handleInputChange(fieldName, value);
            }
          }}
          onBlur={(e) => handleInputBlur(fieldName, e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF80] focus:border-transparent"
          placeholder="0.00"
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