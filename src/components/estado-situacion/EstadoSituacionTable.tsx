import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, FileQuestion, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EstadoSituacionService, EstadoSituacionResponse } from '@/services/estadoSituacionService';
import { showError } from '@/utils/toast';

interface EstadoSituacionTableProps {
  ruc: string;
}

const EstadoSituacionTable: React.FC<EstadoSituacionTableProps> = ({ ruc }) => {
  const [data, setData] = useState<EstadoSituacionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    loadData();
  }, [ruc]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await EstadoSituacionService.getEstadoSituacion(ruc);
      setData(result);
      
      // Verificar si hay datos reales (no solo null)
      const hasRealData = 
        result.data_2022.cuentas_por_cobrar_del_giro !== null ||
        result.data_2022.total_activos !== null ||
        result.data_2023.cuentas_por_cobrar_del_giro !== null ||
        result.data_2023.total_activos !== null ||
        result.data_2024.cuentas_por_cobrar_del_giro !== null ||
        result.data_2024.total_activos !== null;
      
      setHasData(hasRealData);
    } catch (error) {
      console.error('Error cargando estado de situación:', error);
      showError('Error cargando estado de situación');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number | null): string => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRowClass = (value: number | null): string => {
    if (value === null) return 'text-gray-500';
    if (value < 0) return 'text-red-400';
    return 'text-white';
  };

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF80]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !hasData) {
    return (
      <Card className="bg-blue-500/5 border border-blue-500/20">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileQuestion className="h-12 w-12 mx-auto mb-4 text-blue-400 opacity-50" />
            <p className="text-lg font-medium mb-2 text-blue-300">
              No hay datos de Reporte Tributario disponibles
            </p>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              No se encontraron reportes tributarios previos para el RUC{' '}
              <span className="font-mono text-white bg-gray-800 px-2 py-0.5 rounded">
                {ruc}
              </span>
            </p>
            <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg max-w-md mx-auto">
              <p className="text-xs text-gray-400 text-left">
                <strong className="text-white">💡 Puede:</strong>
                <br />
                • Ingresar los datos manualmente en las tablas de arriba
                <br />
                • Subir un Reporte Tributario desde la sección "Subir Documentos"
                <br />
                • Los datos se auto-completarán cuando estén disponibles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allWarnings = [
    ...data.global_warnings,
    ...data.data_2022.warnings,
    ...data.data_2023.warnings,
    ...data.data_2024.warnings
  ];

  return (
    <div className="space-y-4">
      {/* Success indicator */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
        <div className="flex items-center text-green-400 text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>
            <strong>Datos encontrados en Reporte Tributario</strong> - Los campos se auto-completarán
          </span>
        </div>
      </div>

      {allWarnings.length > 0 && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Advertencias encontradas:</p>
              {allWarnings.map((warning, index) => (
                <p key={index} className="text-sm">• {warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
            Estado de Situación Financiera (Reporte Tributario)
          </CardTitle>
          {data.empresa_nombre && (
            <p className="text-sm text-gray-400">{data.empresa_nombre}</p>
          )}
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Concepto</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Dic. 2022</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Dic. 2023</th>
                <th className="text-right py-3 px-4 text-gray-300 font-medium">Dic. 2024</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {/* ACTIVOS */}
              <tr className="bg-[#00FF80]/5">
                <td className="py-3 px-4 font-semibold text-[#00FF80]">ACTIVOS</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 text-gray-300">Cuentas por cobrar del giro</td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2022.cuentas_por_cobrar_del_giro)}`}>
                  {formatNumber(data.data_2022.cuentas_por_cobrar_del_giro)}
                </td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2023.cuentas_por_cobrar_del_giro)}`}>
                  {formatNumber(data.data_2023.cuentas_por_cobrar_del_giro)}
                </td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2024.cuentas_por_cobrar_del_giro)}`}>
                  {formatNumber(data.data_2024.cuentas_por_cobrar_del_giro)}
                </td>
              </tr>
              <tr className="bg-gray-900/30">
                <td className="py-2 px-4 font-semibold text-white">Total Activos</td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2022.total_activos)}`}>
                  {formatNumber(data.data_2022.total_activos)}
                </td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2023.total_activos)}`}>
                  {formatNumber(data.data_2023.total_activos)}
                </td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2024.total_activos)}`}>
                  {formatNumber(data.data_2024.total_activos)}
                </td>
              </tr>

              {/* PASIVOS */}
              <tr className="bg-red-500/5">
                <td className="py-3 px-4 font-semibold text-red-400">PASIVOS</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 text-gray-300">Cuentas por pagar del giro</td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2022.cuentas_por_pagar_del_giro)}`}>
                  {formatNumber(data.data_2022.cuentas_por_pagar_del_giro)}
                </td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2023.cuentas_por_pagar_del_giro)}`}>
                  {formatNumber(data.data_2023.cuentas_por_pagar_del_giro)}
                </td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2024.cuentas_por_pagar_del_giro)}`}>
                  {formatNumber(data.data_2024.cuentas_por_pagar_del_giro)}
                </td>
              </tr>
              <tr className="bg-gray-900/30">
                <td className="py-2 px-4 font-semibold text-white">Total Pasivos</td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2022.total_pasivos)}`}>
                  {formatNumber(data.data_2022.total_pasivos)}
                </td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2023.total_pasivos)}`}>
                  {formatNumber(data.data_2023.total_pasivos)}
                </td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2024.total_pasivos)}`}>
                  {formatNumber(data.data_2024.total_pasivos)}
                </td>
              </tr>

              {/* PATRIMONIO */}
              <tr className="bg-blue-500/5">
                <td className="py-3 px-4 font-semibold text-blue-400">PATRIMONIO</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td className="py-2 px-4 pl-8 text-gray-300">Capital pagado</td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2022.capital_pagado)}`}>
                  {formatNumber(data.data_2022.capital_pagado)}
                </td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2023.capital_pagado)}`}>
                  {formatNumber(data.data_2023.capital_pagado)}
                </td>
                <td className={`py-2 px-4 text-right font-mono ${getRowClass(data.data_2024.capital_pagado)}`}>
                  {formatNumber(data.data_2024.capital_pagado)}
                </td>
              </tr>
              <tr className="bg-gray-900/30">
                <td className="py-2 px-4 font-semibold text-white">Total Patrimonio</td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2022.total_patrimonio)}`}>
                  {formatNumber(data.data_2022.total_patrimonio)}
                </td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2023.total_patrimonio)}`}>
                  {formatNumber(data.data_2023.total_patrimonio)}
                </td>
                <td className={`py-2 px-4 text-right font-mono font-semibold ${getRowClass(data.data_2024.total_patrimonio)}`}>
                  {formatNumber(data.data_2024.total_patrimonio)}
                </td>
              </tr>

              {/* TOTAL PASIVO Y PATRIMONIO */}
              <tr className="bg-[#00FF80]/10 border-t-2 border-[#00FF80]/30">
                <td className="py-3 px-4 font-bold text-[#00FF80]">TOTAL PASIVO Y PATRIMONIO</td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${getRowClass(data.data_2022.total_pasivo_y_patrimonio)} text-[#00FF80]`}>
                  {formatNumber(data.data_2022.total_pasivo_y_patrimonio)}
                </td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${getRowClass(data.data_2023.total_pasivo_y_patrimonio)} text-[#00FF80]`}>
                  {formatNumber(data.data_2023.total_pasivo_y_patrimonio)}
                </td>
                <td className={`py-3 px-4 text-right font-mono font-bold ${getRowClass(data.data_2024.total_pasivo_y_patrimonio)} text-[#00FF80]`}>
                  {formatNumber(data.data_2024.total_pasivo_y_patrimonio)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EstadoSituacionTable;