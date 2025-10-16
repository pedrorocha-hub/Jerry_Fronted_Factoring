import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

type Top10kRecord = {
  [key: string]: any;
};

const ITEMS_PER_PAGE = 50;

const Top10kPage = () => {
  const [data, setData] = useState<Top10kRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const from = page * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { count, error: countError } = await supabase
          .from('top_10k')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        setTotalCount(count || 0);

        const { data: pageData, error: dataError } = await supabase
          .from('top_10k')
          .select('*')
          .order('ranking_2024', { ascending: true, nullsFirst: false })
          .range(from, to);

        if (dataError) throw dataError;

        setData(pageData || []);
      } catch (err) {
        showError('No se pudieron cargar los datos de Top 10k.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const handleNextPage = () => {
    if ((page + 1) * ITEMS_PER_PAGE < totalCount) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return new Intl.NumberFormat('es-PE').format(value);
    }
    return String(value);
  };

  const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <Layout>
      <div className="min-h-screen bg-black p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <TrendingUp className="h-6 w-6 mr-3 text-[#00FF80]" />
            Top 10k Empresas
          </h1>

          <Card className="bg-[#121212] border border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Base de Datos Top 10,000</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron datos en la tabla Top 10k.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border border-gray-800 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 hover:bg-gray-900/50">
                          {tableHeaders.map(header => (
                            <TableHead key={header} className="text-gray-300 whitespace-nowrap px-4 py-2">
                              {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, rowIndex) => (
                          <TableRow key={rowIndex} className="border-gray-800 hover:bg-gray-900/30">
                            {tableHeaders.map(header => (
                              <TableCell key={`${rowIndex}-${header}`} className="text-white whitespace-nowrap px-4 py-2 font-mono text-sm">
                                {formatValue(row[header])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-400">
                      Mostrando {page * ITEMS_PER_PAGE + 1} - {Math.min((page + 1) * ITEMS_PER_PAGE, totalCount)} de {formatValue(totalCount)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={page === 0}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={(page + 1) * ITEMS_PER_PAGE >= totalCount}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
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