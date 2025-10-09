import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DossierRib } from '@/types/dossier';
import { supabase } from '@/integrations/supabase/client';

interface VentasMensualesSectionProps {
  dossier: DossierRib;
}

interface VentasMensualesData {
  id: string;
  proveedor_ruc: string;
  deudor_ruc?: string;
  status: string;
  validado_por?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  // Datos 2023 Proveedor
  enero_2023_proveedor?: number;
  febrero_2023_proveedor?: number;
  marzo_2023_proveedor?: number;
  abril_2023_proveedor?: number;
  mayo_2023_proveedor?: number;
  junio_2023_proveedor?: number;
  julio_2023_proveedor?: number;
  agosto_2023_proveedor?: number;
  setiembre_2023_proveedor?: number;
  octubre_2023_proveedor?: number;
  noviembre_2023_proveedor?: number;
  diciembre_2023_proveedor?: number;
  // Datos 2024 Proveedor
  enero_2024_proveedor?: number;
  febrero_2024_proveedor?: number;
  marzo_2024_proveedor?: number;
  abril_2024_proveedor?: number;
  mayo_2024_proveedor?: number;
  junio_2024_proveedor?: number;
  julio_2024_proveedor?: number;
  agosto_2024_proveedor?: number;
  setiembre_2024_proveedor?: number;
  octubre_2024_proveedor?: number;
  noviembre_2024_proveedor?: number;
  diciembre_2024_proveedor?: number;
  // Datos 2023 Deudor
  enero_2023_deudor?: number;
  febrero_2023_deudor?: number;
  marzo_2023_deudor?: number;
  abril_2023_deudor?: number;
  mayo_2023_deudor?: number;
  junio_2023_deudor?: number;
  julio_2023_deudor?: number;
  agosto_2023_deudor?: number;
  setiembre_2023_deudor?: number;
  octubre_2023_deudor?: number;
  noviembre_2023_deudor?: number;
  diciembre_2023_deudor?: number;
  // Datos 2024 Deudor
  enero_2024_deudor?: number;
  febrero_2024_deudor?: number;
  marzo_2024_deudor?: number;
  abril_2024_deudor?: number;
  mayo_2024_deudor?: number;
  junio_2024_deudor?: number;
  julio_2024_deudor?: number;
  agosto_2024_deudor?: number;
  setiembre_2024_deudor?: number;
  octubre_2024_deudor?: number;
  noviembre_2024_deudor?: number;
  diciembre_2024_deudor?: number;
}

const VentasMensualesSection: React.FC<VentasMensualesSectionProps> = ({ dossier }) => {
  const [ventasData, setVentasData] = useState<VentasMensualesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const ruc = dossier.solicitudOperacion.ruc;

  const fetchVentasMensuales = async () => {
    if (!ruc) return;

    setLoading(true);
    setError(null);
    setDebugInfo(null);

    try {
      console.log('🔍 Buscando ventas mensuales para RUC:', ruc);

      // Debug: Primero verificar qué RUCs existen en la tabla
      const { data: allRucs, error: allRucsError } = await supabase
        .from('ventas_mensuales')
        .select('proveedor_ruc, deudor_ruc, status')
        .limit(5);

      console.log('📊 Primeros 5 RUCs en la tabla:', allRucs);

      // Estrategia 1: Usar la función RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_ventas_mensuales_summaries');

      console.log('🔧 Resultado RPC function:', { rpcData, rpcError });

      let foundInRpc = null;
      if (!rpcError && rpcData) {
        foundInRpc = rpcData.find((item: any) => item.ruc === ruc);
        console.log('🎯 Encontrado en RPC:', foundInRpc);
      }

      // Estrategia 2: Consulta directa con OR
      const { data: directData, error: directError } = await supabase
        .from('ventas_mensuales')
        .select('*')
        .or(`proveedor_ruc.eq.${ruc},deudor_ruc.eq.${ruc}`);

      console.log('🔍 Resultado consulta directa:', { directData, directError });

      // Estrategia 3: Consulta por proveedor_ruc solamente
      const { data: proveedorData, error: proveedorError } = await supabase
        .from('ventas_mensuales')
        .select('*')
        .eq('proveedor_ruc', ruc);

      console.log('👤 Resultado consulta proveedor:', { proveedorData, proveedorError });

      // Estrategia 4: Consulta por deudor_ruc solamente
      const { data: deudorData, error: deudorError } = await supabase
        .from('ventas_mensuales')
        .select('*')
        .eq('deudor_ruc', ruc);

      console.log('🏢 Resultado consulta deudor:', { deudorData, deudorError });

      // Recopilar información de debug
      const debug = {
        ruc,
        rpcError: rpcError?.message,
        rpcResultsCount: rpcData?.length || 0,
        foundInRpc: !!foundInRpc,
        directError: directError?.message,
        directResultsCount: directData?.length || 0,
        proveedorError: proveedorError?.message,
        proveedorResultsCount: proveedorData?.length || 0,
        deudorError: deudorError?.message,
        deudorResultsCount: deudorData?.length || 0,
        sampleRucs: allRucs?.map(r => ({ proveedor: r.proveedor_ruc, deudor: r.deudor_ruc })) || []
      };

      setDebugInfo(debug);

      // Determinar qué datos usar
      let finalData = null;

      if (directData && directData.length > 0) {
        finalData = directData[0];
        console.log('✅ Usando datos de consulta directa');
      } else if (proveedorData && proveedorData.length > 0) {
        finalData = proveedorData[0];
        console.log('✅ Usando datos de consulta proveedor');
      } else if (deudorData && deudorData.length > 0) {
        finalData = deudorData[0];
        console.log('✅ Usando datos de consulta deudor');
      } else if (foundInRpc) {
        // Si encontramos en RPC, obtener datos completos
        const { data: fullData, error: fullError } = await supabase
          .from('ventas_mensuales')
          .select('*')
          .eq('proveedor_ruc', ruc)
          .single();

        if (!fullError && fullData) {
          finalData = fullData;
          console.log('✅ Usando datos completos desde RPC');
        }
      }

      if (finalData) {
        setVentasData(finalData);
        console.log('🎉 Datos de ventas mensuales cargados:', finalData);
      } else {
        setError('No se encontraron datos de ventas mensuales para este RUC');
        console.log('❌ No se encontraron datos para RUC:', ruc);
      }

    } catch (err) {
      console.error('💥 Error inesperado:', err);
      setError('Error inesperado al cargar datos de ventas mensuales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentasMensuales();
  }, [ruc]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Borrador':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { 
      style: 'currency', 
      currency: 'PEN', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).format(num);
  };

  if (loading) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
            5. Ventas Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80] mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando datos de ventas mensuales...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !ventasData) {
    return (
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
            5. Ventas Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">{error || 'No hay datos de ventas mensuales disponibles'}</p>
            <p className="text-gray-500 text-xs mt-2">
              Debug: RUC buscado = {ruc}
            </p>
            
            {/* Botón para reintentar */}
            <Button 
              onClick={fetchVentasMensuales}
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              <Search className="h-4 w-4 mr-2" />
              Reintentar búsqueda
            </Button>

            {/* Información de debug expandida */}
            {debugInfo && (
              <div className="mt-6 p-4 bg-gray-800/30 rounded-lg text-left">
                <h4 className="text-white text-sm font-medium mb-2">Información de Debug:</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• RPC Function: {debugInfo.rpcError ? `Error: ${debugInfo.rpcError}` : `${debugInfo.rpcResultsCount} resultados`}</p>
                  <p>• Consulta Directa: {debugInfo.directError ? `Error: ${debugInfo.directError}` : `${debugInfo.directResultsCount} resultados`}</p>
                  <p>• Por Proveedor: {debugInfo.proveedorError ? `Error: ${debugInfo.proveedorError}` : `${debugInfo.proveedorResultsCount} resultados`}</p>
                  <p>• Por Deudor: {debugInfo.deudorError ? `Error: ${debugInfo.deudorError}` : `${debugInfo.deudorResultsCount} resultados`}</p>
                  
                  {debugInfo.sampleRucs.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">RUCs de ejemplo en la tabla:</p>
                      {debugInfo.sampleRucs.slice(0, 3).map((sample: any, idx: number) => (
                        <p key={idx} className="ml-2">
                          • Proveedor: {sample.proveedor} | Deudor: {sample.deudor || 'N/A'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Datos de ventas por año para el proveedor
  const ventas2023Proveedor = [
    { mes: 'Enero', valor: ventasData.enero_2023_proveedor },
    { mes: 'Febrero', valor: ventasData.febrero_2023_proveedor },
    { mes: 'Marzo', valor: ventasData.marzo_2023_proveedor },
    { mes: 'Abril', valor: ventasData.abril_2023_proveedor },
    { mes: 'Mayo', valor: ventasData.mayo_2023_proveedor },
    { mes: 'Junio', valor: ventasData.junio_2023_proveedor },
    { mes: 'Julio', valor: ventasData.julio_2023_proveedor },
    { mes: 'Agosto', valor: ventasData.agosto_2023_proveedor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2023_proveedor },
    { mes: 'Octubre', valor: ventasData.octubre_2023_proveedor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2023_proveedor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2023_proveedor }
  ];

  const ventas2024Proveedor = [
    { mes: 'Enero', valor: ventasData.enero_2024_proveedor },
    { mes: 'Febrero', valor: ventasData.febrero_2024_proveedor },
    { mes: 'Marzo', valor: ventasData.marzo_2024_proveedor },
    { mes: 'Abril', valor: ventasData.abril_2024_proveedor },
    { mes: 'Mayo', valor: ventasData.mayo_2024_proveedor },
    { mes: 'Junio', valor: ventasData.junio_2024_proveedor },
    { mes: 'Julio', valor: ventasData.julio_2024_proveedor },
    { mes: 'Agosto', valor: ventasData.agosto_2024_proveedor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2024_proveedor },
    { mes: 'Octubre', valor: ventasData.octubre_2024_proveedor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2024_proveedor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2024_proveedor }
  ];

  // Datos de ventas del deudor si están disponibles
  const ventas2023Deudor = ventasData.deudor_ruc ? [
    { mes: 'Enero', valor: ventasData.enero_2023_deudor },
    { mes: 'Febrero', valor: ventasData.febrero_2023_deudor },
    { mes: 'Marzo', valor: ventasData.marzo_2023_deudor },
    { mes: 'Abril', valor: ventasData.abril_2023_deudor },
    { mes: 'Mayo', valor: ventasData.mayo_2023_deudor },
    { mes: 'Junio', valor: ventasData.junio_2023_deudor },
    { mes: 'Julio', valor: ventasData.julio_2023_deudor },
    { mes: 'Agosto', valor: ventasData.agosto_2023_deudor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2023_deudor },
    { mes: 'Octubre', valor: ventasData.octubre_2023_deudor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2023_deudor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2023_deudor }
  ] : null;

  const ventas2024Deudor = ventasData.deudor_ruc ? [
    { mes: 'Enero', valor: ventasData.enero_2024_deudor },
    { mes: 'Febrero', valor: ventasData.febrero_2024_deudor },
    { mes: 'Marzo', valor: ventasData.marzo_2024_deudor },
    { mes: 'Abril', valor: ventasData.abril_2024_deudor },
    { mes: 'Mayo', valor: ventasData.mayo_2024_deudor },
    { mes: 'Junio', valor: ventasData.junio_2024_deudor },
    { mes: 'Julio', valor: ventasData.julio_2024_deudor },
    { mes: 'Agosto', valor: ventasData.agosto_2024_deudor },
    { mes: 'Septiembre', valor: ventasData.setiembre_2024_deudor },
    { mes: 'Octubre', valor: ventasData.octubre_2024_deudor },
    { mes: 'Noviembre', valor: ventasData.noviembre_2024_deudor },
    { mes: 'Diciembre', valor: ventasData.diciembre_2024_deudor }
  ] : null;

  const calcularTotal = (ventas: { mes: string; valor: any }[]) => {
    return ventas.reduce((total, venta) => {
      const valor = typeof venta.valor === 'string' ? parseFloat(venta.valor.replace(/,/g, '')) : venta.valor;
      return total + (isNaN(valor) || valor === null || valor === undefined ? 0 : valor);
    }, 0);
  };

  const renderVentasTable = (ventas: { mes: string; valor: any }[], titulo: string, año: string) => (
    <div className="border border-gray-800 rounded-lg p-4">
      <h4 className="text-white font-medium mb-4 flex items-center">
        <Calendar className="h-4 w-4 mr-2 text-[#00FF80]" />
        {titulo} - {año}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ventas.map((venta, index) => (
          <div key={index} className="bg-gray-800/30 rounded p-3">
            <Label className="text-gray-400 text-xs">{venta.mes}</Label>
            <p className="text-white font-mono text-sm">{formatCurrency(venta.valor)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <Label className="text-gray-400">Total {año}:</Label>
          <p className="text-[#00FF80] font-mono font-bold">{formatCurrency(calcularTotal(ventas))}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-[#121212] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
          5. Ventas Mensuales
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Header con información general */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-medium">Análisis de Ventas Mensuales</h4>
              <p className="text-gray-400 text-sm">
                RUC Proveedor: {ventasData.proveedor_ruc}
                {ventasData.deudor_ruc && ` | RUC Deudor: ${ventasData.deudor_ruc}`}
              </p>
            </div>
            <Badge variant="outline" className={getStatusColor(ventasData.status)}>
              {ventasData.status}
            </Badge>
          </div>

          {/* Ventas del Proveedor */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-2">
              Ventas del Proveedor
            </h3>
            {renderVentasTable(ventas2023Proveedor, "Ventas Proveedor", "2023")}
            {renderVentasTable(ventas2024Proveedor, "Ventas Proveedor", "2024")}
          </div>

          {/* Ventas del Deudor (si están disponibles) */}
          {ventas2023Deudor && ventas2024Deudor && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg border-b border-gray-800 pb-2">
                Ventas del Deudor
              </h3>
              {renderVentasTable(ventas2023Deudor, "Ventas Deudor", "2023")}
              {renderVentasTable(ventas2024Deudor, "Ventas Deudor", "2024")}
            </div>
          )}

          {/* Información adicional */}
          {ventasData.validado_por && (
            <div className="border-t border-gray-800 pt-4">
              <Label className="text-gray-400">Validado por:</Label>
              <p className="text-white">{ventasData.validado_por}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasMensualesSection;