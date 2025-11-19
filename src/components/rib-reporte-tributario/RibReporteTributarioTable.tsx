import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RibReporteTributario } from '@/services/ribReporteTributarioService';
import { ReporteTributarioBalanceService, ReporteTributarioBalanceData } from '@/services/reporteTributarioBalanceService';

interface RibReporteTributarioTableProps {
  ruc: string;
  data: Partial<RibReporteTributario> | null;
  onDataChange: (updatedData: Partial<RibReporteTributario>) => void;
  isProveedor?: boolean;
}

const RibReporteTributarioTable: React.FC<RibReporteTributarioTableProps> = ({ 
  ruc, 
  data, 
  onDataChange, 
  isProveedor = false 
}) => {
  const [balanceData, setBalanceData] = useState<ReporteTributarioBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBalanceData();
    setLocalValues({}); // Limpiar valores locales al cambiar de RUC
    setInitialized(false); // Reset initialized cuando cambia el RUC
  }, [ruc]);

  // Auto-populate fields with reporte_tributario data when first loaded
  useEffect(() => {
    if (balanceData && !initialized) {
      const updatedData = { ...data };
      let hasChanges = false;

      // Auto-populate fields if they don't have values yet
      const years = [2022, 2023, 2024];
      const fields = [
        'cuentas_por_cobrar_giro',
        'total_activos', 
        'cuentas_por_pagar_giro',
        'total_pasivos',
        'capital_pagado',
        'total_patrimonio',
        'total_pasivo_patrimonio'
      ];

      years.forEach(year => {
        fields.forEach(field => {
          const fieldName = `${field}_${year}${getSuffix()}`;
          const balanceValue = getBalanceValue(year, field);
          
          // Only set if field is empty and we have data from reporte_tributario
          if (balanceValue !== null && (updatedData[fieldName] === null || updatedData[fieldName] === undefined)) {
            updatedData[fieldName] = balanceValue;
            hasChanges = true;
          }
        });
      });

      if (hasChanges) {
        onDataChange(updatedData);
      }
      setInitialized(true);
    }
  }, [balanceData, initialized]);

  const loadBalanceData = async () => {
    try {
      setLoading(true);
      const result = await ReporteTributarioBalanceService.getBalanceData(ruc);
      setBalanceData(result);
    } catch (error) {
      console.error('Error cargando datos de balance:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getBalanceValue = (year: number, field: string): number | null => {
    if (!balanceData) return null;
    
    const yearData = year === 2022 ? balanceData.balance_2022 : 
                    year === 2023 ? balanceData.balance_2023 : 
                    balanceData.balance_2024;
    
    switch (field) {
      case 'cuentas_por_cobrar_giro':
        return yearData.cuentas_por_cobrar_comerciales_terceros;
      case 'total_activos':
        return yearData.total_activos_netos;
      case 'cuentas_por_pagar_giro':
        return yearData.total_cuentas_por_pagar;
      case 'total_pasivos':
        return yearData.total_pasivos;
      case 'capital_pagado':
        return yearData.capital_social;
      case 'total_patrimonio':
        return yearData.total_patrimonio;
      case 'total_pasivo_patrimonio':
        return yearData.total_pasivo_patrimonio;
      default:
        return null;
    }
  };

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
          placeholder="0"
        />
      </TableCell>
    );
  };

  const sections = [
    {
      title: 'ACTIVOS',
      color: 'text-green-400',
      bgColor: 'bg-green-500/5',
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
      color: 'text-red-400',
      bgColor: 'bg-red-500/5',
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
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/5',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
        <span className="ml-2 text-gray-400">Cargando datos de reporte tributario...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {balanceData?.warnings && balanceData.warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="text-yellow-400 text-sm">
            <strong>Advertencias:</strong>
            <ul className="mt-2 space-y-1">
              {balanceData.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.title} className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
          <div className={`${section.bgColor} px-4 py-2 border-b border-gray-800`}>
            <h3 className={`text-sm font-semibold ${section.color} flex items-center`}>
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
          <strong>Nota:</strong> Los campos se llenan automáticamente con datos de los reportes tributarios cuando están disponibles.
          Puedes editar cualquier valor y los cambios se guardarán al presionar "Guardar".
          {balanceData?.empresa_nombre && (
            <span className="block mt-1">
              <strong>Empresa:</strong> {balanceData.empresa_nombre}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default RibReporteTributarioTable;