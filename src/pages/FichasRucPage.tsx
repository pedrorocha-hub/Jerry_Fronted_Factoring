import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { FichaRuc } from '@/types/ficha-ruc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building } from 'lucide-react';

const FichasRucPage = () => {
  const [fichas, setFichas] = useState<FichaRuc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFichas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ficha_ruc')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fichas ruc:', error);
      } else {
        setFichas(data as FichaRuc[]);
      }
      setLoading(false);
    };

    fetchFichas();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Building className="h-6 w-6 mr-3 text-[#00FF80]" />
          Fichas RUC Procesadas
        </h1>
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Registros de Fichas RUC</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-900">
                    <TableHead className="text-white">RUC</TableHead>
                    <TableHead className="text-white">Nombre Empresa</TableHead>
                    <TableHead className="text-white">Estado Contribuyente</TableHead>
                    <TableHead className="text-white">Fecha de Creación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fichas.map((ficha) => (
                    <TableRow key={ficha.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="font-mono text-gray-300">{ficha.ruc}</TableCell>
                      <TableCell className="text-white">{ficha.nombre_empresa}</TableCell>
                      <TableCell className="text-gray-400">{ficha.estado_contribuyente}</TableCell>
                      <TableCell className="text-gray-400">{new Date(ficha.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FichasRucPage;