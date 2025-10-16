import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Loader2, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

const PAGE_SIZE = 20;

const Top10kPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async (currentPage: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('top_10k')
        .select('ruc, razon_social, sector, ranking_2024, facturado_2024_soles_maximo', { count: 'exact' })
        .range(from, to)
        .order('ranking_2024', { ascending: true, nullsFirst: false });

      if (search) {
        query = query.or(`razon_social.ilike.%${search}%,ruc::text.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setData(data || []);
      setCount(count);
    } catch (err: any) {
      setError('No se pudieron cargar los datos. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(debounce((p, s) => fetchData(p, s), 500), [fetchData]);

  useEffect(() => {
    debouncedFetch(page, searchTerm);
    return () => debouncedFetch.cancel();
  }, [page, searchTerm, debouncedFetch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0;

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <BarChart className="h-6 w-6 mr-3 text-[#00FF80]" />
                Top 10,000 Empresas
              </h1>
              <p className="text-gray-400">
                Explora el ranking de las principales empresas.
              </p>
            </div>
          </div>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Ranking de Empresas</CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por RUC o Razón Social..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 bg-gray-900/50 border-gray-700 w-full md:w-1/3"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">{error}</div>
              ) : data.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No se encontraron resultados.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900/50">
                          <TableHead className="text-gray-300">Ranking 2024</TableHead>
                          <TableHead className="text-gray-300">RUC</TableHead>
                          <TableHead className="text-gray-300">Razón Social</TableHead>
                          <TableHead className="text-gray-300">Sector</TableHead>
                          <TableHead className="text-right text-gray-300">Facturado 2024 (Máx)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((empresa) => (
                          <TableRow key={empresa.ruc} className="border-gray-800 hover:bg-gray-900/30">
                            <TableCell className="font-mono text-white">#{empresa.ranking_2024 || 'N/A'}</TableCell>
                            <TableCell className="font-mono text-white">{empresa.ruc}</TableCell>
                            <TableCell className="text-white">{empresa.razon_social}</TableCell>
                            <TableCell className="text-gray-400">{empresa.sector || 'N/A'}</TableCell>
                            <TableCell className="text-right font-mono text-white">{formatCurrency(empresa.facturado_2024_soles_maximo)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-400">
                      Página {page + 1} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Top10kPage;