import React from 'react';
import { Input } from '@/components/ui/input';

interface RibReporteTributarioTableProps {
  ruc: string;
  data: any;
  onDataChange: (updatedData: any) => void;
}

const RibReporteTributarioTable: React.FC<RibReporteTributarioTableProps> = ({
  ruc,
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
            <td className="border border-gray-700 p-3 text-gray-300">Cuentas por cobrar del giro</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.cuentas_por_cobrar_giro)}
                onChange={(e) => handleChange('cuentas_por_cobrar_giro', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/30">
            <td className="border border-gray-700 p-3 text-gray-300">Total activos</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.total_activos)}
                onChange={(e) => handleChange('total_activos', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/50">
            <td className="border border-gray-700 p-3 text-gray-300">Cuentas por pagar del giro</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.cuentas_por_pagar_giro)}
                onChange={(e) => handleChange('cuentas_por_pagar_giro', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/30">
            <td className="border border-gray-700 p-3 text-gray-300">Total pasivos</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.total_pasivos)}
                onChange={(e) => handleChange('total_pasivos', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/50">
            <td className="border border-gray-700 p-3 text-gray-300">Capital pagado</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.capital_pagado)}
                onChange={(e) => handleChange('capital_pagado', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/30">
            <td className="border border-gray-700 p-3 text-gray-300">Total patrimonio</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.total_patrimonio)}
                onChange={(e) => handleChange('total_patrimonio', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
          <tr className="bg-gray-900/50">
            <td className="border border-gray-700 p-3 text-gray-300">Total pasivo y patrimonio</td>
            <td className="border border-gray-700 p-3">
              <Input
                type="number"
                step="0.01"
                value={formatNumber(data.total_pasivo_patrimonio)}
                onChange={(e) => handleChange('total_pasivo_patrimonio', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RibReporteTributarioTable;