import React, { useState, useEffect } from 'react';
import { Search, Building2, Loader2, AlertCircle, TrendingUp, Calculator, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FichaRuc } from '@/types/ficha-ruc';
import { FichaRucService } from '@/services/fichaRucService';
import { RibReporteTributario } from '@/services/ribReporteTributarioService';
import RibReporteTributarioTable from './RibReporteTributarioTable';
import EstadosResultadosTable from './EstadosResultadosTable';
import IndicesFinancierosTable from './IndicesFinancierosTable';

interface ProveedorSectionProps {
  data: Partial<RibReporteTributario> | null;
  onDataChange: (updatedData: Partial<RibReporteTributario>) => void;
}

const ProveedorSection: React.FC<ProveedorSectionProps> = ({ data, onDataChange }) => {
  const [proveedorRuc, setProveedorRuc] = useState(data?.proveedor_ruc || '');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proveedorFicha, setProveedorFicha] = useState<FichaRuc | null>(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Cargar automáticamente el proveedor al montar el componente
  // Los datos financieros YA están en 'data', solo necesitamos cargar la Ficha RUC para mostrar el nombre
  useEffect(() => {
    if (data?.proveedor_ruc && !hasLoadedInitialData) {
      setProveedorRuc(data.proveedor_ruc);
      loadProveedorFichaRuc(data.proveedor_ruc);
      setHasLoadedInitialData(true);
    }
  }, [data?.proveedor_ruc, hasLoadedInitialData]);

  const loadProveedorFichaRuc = async (ruc: string) => {
    if (!ruc || ruc.length !== 11) return;
    
    setSearching(true);
    setError(null);

    try {
      const fichaData = await FichaRucService.getByRuc(ruc);
      if (fichaData) {
        setProveedorFicha(fichaData);
        // NO llamamos a onDataChange aquí porque los datos financieros ya están en 'data'
        // Solo estamos cargando la Ficha RUC para mostrar el nombre de la empresa
      } else {
        setError('Ficha RUC del proveedor no encontrada.');
        setProveedorFicha(null);
      }
    } catch (err) {
      console.error('Error loading proveedor ficha:', err);
      setProveedorFicha(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (rucToSearch?: string) => {
    const ruc = rucToSearch || proveedorRuc;
    if (!ruc || ruc.length !== 11) {
      setError('Por favor, ingrese un RUC válido de 11 dígitos.');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const fichaData = await FichaRucService.getByRuc(ruc);
      if (fichaData) {
        setProveedorFicha(fichaData);
        onDataChange({
          ...data,
          proveedor_ruc: ruc,
        });
      } else {
        setError('Ficha RUC del proveedor no encontrada.');
        setProveedorFicha(null);
      }
    } catch (err) {
      setError('Ocurrió un error al buscar el proveedor.');
      setProveedorFicha(null);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setProveedorRuc('');
    setProveedorFicha(null);
    setError(null);
    onDataChange({
      ...data,
      proveedor_ruc: null,
    });
  };

  const handleProveedorDataChange = (updatedData: Partial<RibReporteTributario>) => {
    onDataChange(updatedData);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-[#00FF80]" />
            Datos del Proveedor (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Ingrese RUC del proveedor (opcional)"
              value={proveedorRuc}
              onChange={(e) => setProveedorRuc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              maxLength={11}
              className="pl-10 bg-gray-900/50 border-gray-700"
            />
          </div>
          <Button 
            onClick={() => handleSearch()} 
            disabled={searching} 
            className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
          >
            {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar
          </Button>
          {proveedorFicha && (
            <Button onClick={handleClear} variant="outline" className="w-full sm:w-auto">
              Limpiar
            </Button>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {proveedorFicha && (
        <div className="space-y-6">
          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-[#00FF80]" />
                {proveedorFicha.nombre_empresa}: Estado de situación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RibReporteTributarioTable
                ruc={proveedorFicha.ruc}
                data={data}
                onDataChange={handleProveedorDataChange}
                isProveedor={true}
              />
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#00FF80]" />
                Estados de resultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EstadosResultadosTable
                data={data}
                onDataChange={handleProveedorDataChange}
                isProveedor={true}
              />
            </CardContent>
          </Card>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-[#00FF80]" />
                Índices financieros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IndicesFinancierosTable
                data={data}
                onDataChange={handleProveedorDataChange}
                isProveedor={true}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProveedorSection;