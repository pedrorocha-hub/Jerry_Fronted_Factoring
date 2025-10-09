import React, { useState, useEffect } from 'react';
import { Banknote, Plus, RefreshCw, Building2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CuentaBancariaService, CuentaBancariaWithFicha } from '@/services/cuentaBancariaService';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CuentaBancariaPage = () => {
  const [cuentas, setCuentas] = useState<CuentaBancariaWithFicha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCuentas();
  }, []);

  const loadCuentas = async () => {
    setLoading(true);
    try {
      const data = await CuentaBancariaService.getAll();
      setCuentas(data);
    } catch (error) {
      showError('Error al cargar las cuentas bancarias.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    const toastId = showLoading('Actualizando...');
    await loadCuentas();
    dismissToast(toastId);
    showSuccess('Cuentas actualizadas.');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Banknote className="h-6 w-6 mr-3 text-[#00FF80]" />
            Cuentas Bancarias
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRefresh} className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button className="bg-[#00FF80] text-black hover:bg-[#00FF80]/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
          </div>
        </div>
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Listado de Cuentas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">Banco</TableHead>
                  <TableHead className="text-gray-300">Número de Cuenta</TableHead>
                  <TableHead className="text-gray-300">Tipo</TableHead>
                  <TableHead className="text-gray-300">Moneda</TableHead>
                  <TableHead className="text-gray-300">Empresa (RUC)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuentas.map(cuenta => (
                  <TableRow key={cuenta.id} className="border-gray-800">
                    <TableCell className="text-white">{cuenta.banco}</TableCell>
                    <TableCell className="text-white font-mono">{cuenta.numero_cuenta}</TableCell>
                    <TableCell className="text-gray-300">{cuenta.tipo_cuenta}</TableCell>
                    <TableCell className="text-gray-300">{cuenta.moneda_cuenta}</TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <div>
                          <div>{cuenta.ficha_ruc?.nombre_empresa}</div>
                          <div className="text-xs text-gray-500">{cuenta.ruc}</div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CuentaBancariaPage;