import React, { useState } from 'react';
import { Wand2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RibReporteTributario, RibReporteTributarioService, EstadoSituacionCompleto } from '@/services/ribReporteTributarioService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

interface RibReporteTributarioTableProps {
  ruc: string;
  data: Partial<RibReporteTributario> | null;
  onDataChange: (updatedData: Partial<RibReporteTributario>) => void;
}

const RibReporteTributarioTable: React.FC<RibReporteTributarioTableProps> = ({
  ruc,
  data,
  onDataChange
}) => {
  const [autocompletando, setAutocompletando] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return value.toLocaleString('es-ES');
  };

  const parseNumber = (value: string): number | null => {
    if (!value.trim()) return null;
    const cleanValue = value.replace(/[,\s]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  };

  const handleInputChange = (field: keyof RibReporteTributario, value: string) => {
    const numericValue = parseNumber(value);
    onDataChange({
      ...data,
      [field]: numericValue
    });
  };

  const handleAutocompletar = async () => {
    if (!ruc) {
      showError('RUC no disponible para autocompletar');
      return;
    }

    const loadingToast = showLoading('Completando datos desde reporte tributario...');
    setAutocompletando(true);
    setWarnings([]);

    try {
      // Obtener datos del reporte tributario
      const estadoSituacion = await RibReporteTributarioService.completarEstadoSituacion(ruc);
      
      if (!estadoSituacion.success) {
        throw new Error(estadoSituacion.message);
      }

      // Aplicar los datos al reporte actual
      const reporteActualizado = await RibReporteTributarioService.aplicarEstadoSituacion(ruc, estadoSituacion);
      
      // Recopilar warnings
      const nuevosWarnings: string[] = [];
      if (estadoSituacion.data_2022?.warning) nuevosWarnings.push(`2022: ${estadoSituacion.data_2022.warning}`);
      if (estadoSituacion.data_2023?.warning) nuevosWarnings.push(`2023: ${estadoSituacion.data_2023.warning}`);
      if (estadoSituacion.data_2024?.warning) nuevosWarnings.push(`2024: ${estadoSituacion.data_2024.warning}`);
      
      setWarnings(nuevosWarnings);
      
      // Actualizar los datos en el componente padre
      onDataChange(reporteActualizado);
      
      dismissToast(loadingToast);
      showSuccess(`Datos completados automáticamente. ${estadoSituacion.message}`);
      
    } catch (error) {
      dismissToast(loadingToast);
      console.error('Error autocompletando:', error);
      showError(`Error autocompletando datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setAutocompletando(false);
    }
  };

  const years = [2022, 2023, 2024];
  const rows = [
    {
      label: 'Cuentas por cobrar del giro',
      fields: ['cuentas_por_cobrar_giro_2022', 'cuentas_por_cobrar_giro_2023', 'cuentas_por_cobrar_giro_2024'] as const
    },
    {
      label: 'Total activos',
      fields: ['total_activos_2022', 'total_activos_2023', 'total_activos_2024'] as const
    },
    {
      label: 'Cuentas por pagar del giro',
      fields: ['cuentas_por_pagar_giro_2022', 'cuentas_por_pagar_giro_2023', 'cuentas_por_pagar_giro_2024'] as const
    },
    {
      label: 'Total pasivos',
      fields: ['total_pasivos_2022', 'total_pasivos_2023', 'total_pasivos_2024'] as const
    },
    {
      label: 'Capital pagado',
      fields: ['capital_pagado_2022', 'capital_pagado_2023', 'capital_pagado_2024'] as const
    },
    {
      label: 'Total patrimonio',
      fields: ['total_patrimonio_2022', 'total_patrimonio_2023', 'total_patrimonio_2024'] as const
    },
    {
      label: 'Total pasivo y patrimonio',
      fields: ['total_pasivo_patrimonio_2022', 'total_pasivo_patrimonio_2023', 'total_pasivo_patrimonio_2024'] as const
    }
  ];

  return (
    <div className="space-y-4">
      {/* Botón de autocompletado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-white">Estado de Situación</h3>
          <Badge variant="outline" className="text-xs">
            Activos, Pasivos y Patrimonio
          </Badge>
        </div>
        <Button
          onClick={handleAutocompletar}
          disabled={autocompletando}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {autocompletando ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          {autocompletando ? 'Completando...' : 'Completar desde Reporte Tributario'}
        </Button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Advertencias encontradas:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-gray-300 font-medium">Concepto</th>
              {years.map(year => (
                <th key={year} className="text-center p-3 text-gray-300 font-medium min-w-[150px]">
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-800 hover:bg-gray-900/30">
                <td className="p-3 text-white font-medium">
                  {row.label}
                </td>
                {row.fields.map((field, colIndex) => (
                  <td key={colIndex} className="p-2">
                    <Input
                      value={formatNumber(data?.[field])}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      placeholder="0"
                      className="bg-gray-900/50 border-gray-700 text-white text-center font-mono"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Información adicional */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-3 w-3 text-green-400" />
          <span>Los datos se pueden completar automáticamente desde los reportes tributarios existentes</span>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-3 w-3 text-yellow-400" />
          <span>Se validará que el total de pasivos y patrimonio cuadre con el total de activos</span>
        </div>
      </div>
    </div>
  );
};

export default RibReporteTributarioTable;