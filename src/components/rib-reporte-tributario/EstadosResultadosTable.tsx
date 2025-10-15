import React from 'react';
import { Input } from '@/components/ui/input';

interface EstadosResultadosTableProps {
  data: any;
  onDataChange: (updatedData: any) => void;
}

const EstadosResultadosTable: React.FC<EstadosResultadosTableProps> = ({
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
            <th className="border border-gray-700 p-3 text-left text-white font-semibold">Campo</th>
            <th className="border border-gray-700 p-3 text-left text-white font-semibold">Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-900/50">
            <td className="border border-gray-700 p-3 text-gray-300">Ingreso ventas</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.ingreso_ventas)}
                onChange={(e) => handleChange('ingreso_ventas', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/30">
            <td className="border border-gray-700 p-3 text-gray-300">Utilidad bruta</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.utilidad_bruta)}
                onChange={(e) => handleChange('utilidad_bruta', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/50">
            <td className="border border-gray-700 p-3 text-gray-300">Utilidad antes de impuesto</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.utilidad_antes_impuesto)}
                onChange={(e) => handleChange('utilidad_antes_impuesto', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EstadosResultadosTable;