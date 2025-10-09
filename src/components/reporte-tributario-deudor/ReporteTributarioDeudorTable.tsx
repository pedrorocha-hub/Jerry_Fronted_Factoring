import React from 'react';
import { Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReporteTributarioDeudor } from '@/services/reporteTributarioDeudorService';

interface ReporteTributarioDeudorTableProps {
  ruc: string;
  data: Partial<ReporteTributarioDeudor> | null;
  onDataChange: (updatedData: Partial<ReporteTributarioDeudor>) => void;
  isProveedor?: boolean;
}

const ReporteTributarioDeudorTable: React.FC<ReporteTributarioDeudorTableProps> = ({ 
  ruc, 
  data, 
  onDataChange, 
  isProveedor = false 
}) => {
  const getSuffix = () => isProveedor ? '_proveedor' : '';

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
          placeholder="0"
        />
      </TableCell>
    );
  };

  const sections = [
    {
      title: 'ACTIVOS',
      rows: [
        {
          label: 'Cuentas por cobrar del giro',
          field: 'cuentas_por_cobrar_giro',
          description: 'Cuentas por cobrar relacionadas al giro del negocio'
        },
        {
          label: 'Total activos',
          field: 'total_activos',
          description: 'Suma total de todos los activos de la empresa'
        }
      ]
    },
    {
      title: 'PASIVOS',
      rows: [
        {
          label: 'Cuentas por pagar del giro',
          field: 'cuentas_por_pagar_giro',
          description: 'Cuentas por pagar relacionadas al giro del negocio'
        },
        {
          label: 'Total pasivos',
          field: 'total_pasivos',
          description: 'Suma total de todas las obligaciones de la empresa'
        }
      ]
    },
    {
      title: 'PATRIMONIO',
      rows: [
        {
          label: 'Capital pagado',
          field: 'capital_pagado',
          description: 'Capital efectivamente aportado por los socios'
        },
        {
          label: 'Total patrimonio',
          field: 'total_patrimonio',
          description: 'Patrimonio neto de la empresa'
        },
        {
          label: 'Total pasivo + patrimonio',
          field: 'total_pasivo_patrimonio',
          description: 'Suma de pasivos y patrimonio (debe igualar total activos)'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
          <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-[#00FF80] flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              {section.title}
            </h3>
          </div>
          
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
              {section.rows.map((row) => (
                <TableRow key={row.field} className="border-gray-800 hover:bg-gray-900/30">
                  <TableCell className="font-medium text-white">
                    <div>
                      <div>{row.label}</div>
                      <div className="text-xs text-gray-400">{row.description}</div>
                    </div>
                  </TableCell>
                  <InputCell field={row.field} year="2022" />
                  <InputCell field={row.field} year="2023" />
                  <InputCell field={row.field} year="2024" />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
      
      <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
        <p className="text-xs text-gray-400">
          <strong>Nota:</strong> Ingrese los valores en soles peruanos (PEN). Los campos vacíos se considerarán como 0.
          El total de pasivo + patrimonio debe igualar al total de activos para mantener el equilibrio contable.
        </p>
      </div>
    </div>
  );
};

export default ReporteTributarioDeudorTable;