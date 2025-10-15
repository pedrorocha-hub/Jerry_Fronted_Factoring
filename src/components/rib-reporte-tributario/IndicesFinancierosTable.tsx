import React from 'react';
import { Input } from '@/components/ui/input';

interface IndicesFinancierosTableProps {
  data: any;
  onDataChange: (updatedData: any) => void;
}

const IndicesFinancierosTable: React.FC<IndicesFinancierosTableProps> = ({
  data,
  onDataChange
}) => {
  const handleChange = (field: string, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    onDataChange({ [field]: numericValue });
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '';
    return value.toString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800">
            <th className="border border-gray-700 p-3 text-left text-white font-semibold">Índice</th>
            <th className="border border-gray-700 p-3 text-left text-white font-semibold">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-900/50">
            <td className="border border-gray-700 p-3 text-gray-300">Solvencia</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.solvencia)}
                onChange={(e) => handleChange('solvencia', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/30">
            <td className="border border-gray-700 p-3 text-gray-300">Gestión</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.gestion)}
                onChange={(e) => handleChange('gestion', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default IndicesFinancierosTable;