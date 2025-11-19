import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Loader2, Search, Eye, X, TrendingUp, DollarSign, Building2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

const PAGE_SIZE = 20;

interface Top10kBasicData {
  ruc: string;
  razon_social: string;
  sector: string;
  tamano: string;
  ranking_2024: number;
  facturado_2024_soles_maximo: number;
  descripcion_ciiu_rev3: string;
}

interface Top10kFullData extends Top10kBasicData {
  ciiu: number;
  ranking_2023: string;
  ranking_2022: string;
  ranking_2021: string;
  ranking_2020: string;
  ranking_2019: string;
  ranking_2018: string;
  ranking_2017: string;
  ranking_2016: string;
  ranking_2015: string;
  ranking_2014: string;
  ranking_2013: string;
  ranking_2012: string;
  ranking_2011: string;
  ranking_2010: string;
  ranking_2009: string;
  ranking_2008: string;
  ranking_2007: string;
  ranking_2006: string;
  ranking_2005: string;
  ranking_2004: string;
  ranking_2003: string;
  ranking_2002: string;
  ranking_2001: string;
  facturado_2024_soles_minimo: number;
  facturado_2024_usd_minimo: number;
  facturado_2024_usd_maximo: number;
  facturado_2023_soles_minimo: string;
  facturado_2023_soles_maximo: string;
  facturado_2023_usd_minimo: string;
  facturado_2023_usd_maximo: string;
  facturado_2022_soles_minimo: string;
  facturado_2022_soles_maximo: string;
  facturado_2022_usd_minimo: string;
  facturado_2022_usd_maximo: string;
  facturado_2021_soles_minimo: string;
  facturado_2021_soles_maximo: string;
  facturado_2021_usd_minimo: string;
  facturado_2021_usd_maximo: string;
  facturado_2020_soles_minimo: string;
  facturado_2020_soles_maximo: string;
  facturado_2020_usd_minimo: string;
  facturado_2020_usd_maximo: string;
  facturado_2019_soles_minimo: string;
  facturado_2019_soles_maximo: string;
  facturado_2019_usd_minimo: string;
  facturado_2019_usd_maximo: string;
  facturado_2018_soles_minimo: string;
  facturado_2018_soles_maximo: string;
  facturado_2018_usd_minimo: string;
  facturado_2018_usd_maximo: string;
  facturado_2017_soles_minimo: string;
  facturado_2017_soles_maximo: string;
  facturado_2017_usd_minimo: string;
  facturado_2017_usd_maximo: string;
  facturado_2016_soles_minimo: string;
  facturado_2016_soles_maximo: string;
  facturado_2016_usd_minimo: string;
  facturado_2016_usd_maximo: string;
  facturado_2015_soles_minimo: string;
  facturado_2015_soles_maximo: string;
  facturado_2015_usd_minimo: string;
  facturado_2015_usd_maximo: string;
  facturado_2014_soles_minimo: string;
  facturado_2014_soles_maximo: string;
  facturado_2014_usd_minimo: string;
  facturado_2014_usd_maximo: string;
  facturado_2013_soles_minimo: string;
  facturado_2013_soles_maximo: string;
  facturado_2013_usd_minimo: string;
  facturado_2013_usd_maximo: string;
}

const Top10kPage = () => {
  const [data, setData] = useState<Top10kBasicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Top10kFullData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = useCallback(async (currentPage: number, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('top_10k')
        .select('ruc, razon_social, sector, tamano, ranking_2024, facturado_2024_soles_maximo, descripcion_ciiu_rev3', { count: 'exact' })
        .range(from, to)
        .order('ranking_2024', { ascending: true, nullsFirst: false });

      if (search) {
        // Verificar si el término de búsqueda es numérico (RUC)
        const isNumeric = /^\d+$/.test(search.trim());
        
        if (isNumeric) {
          // Buscar solo por RUC
          query = query.eq('ruc', search.trim());
        } else {
          // Buscar solo por razón social
          query = query.ilike('razon_social', `%${search}%`);
        }
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

  const fetchCompanyDetails = async (ruc: string) => {
    setDetailLoading(true);
    try {
      const { data, error } = await supabase
        .from('top_10k')
        .select('*')
        .eq('ruc', ruc)
        .single();

      if (error) throw error;

      setSelectedCompany(data);
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error('Error fetching company details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

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

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === '') return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const formatCurrencyUSD = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined || amount === '') return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const getTamañoBadgeColor = (tamano: string) => {
    switch (tamano?.toLowerCase()) {
      case 'grande': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'mediana': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pequeña': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const renderRankingHistory = () => {
    if (!selectedCompany) return null;

    const years = [
      2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
      2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005,
      2004, 2003, 2002, 2001
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {years.map(year => {
          const rankingKey = `ranking_${year}` as keyof Top10kFullData;
          const ranking = selectedCompany[rankingKey];
          const displayRanking = ranking && ranking !== '' ? `#${ranking}` : 'N/A';
          
          return (
            <div key={year} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">{year}</div>
              <div className="text-lg font-bold text-white">{displayRanking}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFacturacionHistory = () => {
    if (!selectedCompany) return null;

    const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013];

    return (
      <div className="space-y-4">
        {years.map(year => {
          const solesMinKey = `facturado_${year}_soles_minimo` as keyof Top10kFullData;
          const solesMaxKey = `facturado_${year}_soles_maximo` as keyof Top10kFullData;
          const usdMinKey = `facturado_${year}_usd_minimo` as keyof Top10kFullData;
          const usdMaxKey = `facturado_${year}_usd_maximo` as keyof Top10kFullData;

          const solesMin = selectedCompany[solesMinKey];
          const solesMax = selectedCompany[solesMaxKey];
          const usdMin = selectedCompany[usdMinKey];
          const usdMax = selectedCompany[usdMaxKey];

          return (
            <div key={year} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-[#00FF80]" />
                Año {year}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Soles (PEN)</div>
                  <div className="text-sm text-white">
                    <span className="text-gray-400">Min:</span> {formatCurrency(solesMin)}
                  </div>
                  <div className="text-sm text-white">
                    <span className="text-gray-400">Máx:</span> {formatCurrency(solesMax)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Dólares (USD)</div>
                  <div className="text-sm text-white">
                    <span className="text-gray-400">Min:</span> {formatCurrencyUSD(usdMin)}
                  </div>
                  <div className="text-sm text-white">
                    <span className="text-gray-400">Máx:</span> {formatCurrencyUSD(usdMax)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
                Explora el ranking de las principales empresas del Perú
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
                  className="pl-10 bg-gray-900/50 border-gray-700 w-full md:w-1/2"
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
                          <TableHead className="text-gray-300">Tamaño</TableHead>
                          <TableHead className="text-right text-gray-300">Facturado 2024 (Máx)</TableHead>
                          <TableHead className="text-center text-gray-300">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((empresa) => (
                          <TableRow key={empresa.ruc} className="border-gray-800 hover:bg-gray-900/30">
                            <TableCell className="font-mono text-white font-semibold">
                              #{empresa.ranking_2024 || 'N/A'}
                            </TableCell>
                            <TableCell className="font-mono text-white">{empresa.ruc}</TableCell>
                            <TableCell className="text-white max-w-xs truncate" title={empresa.razon_social}>
                              {empresa.razon_social}
                            </TableCell>
                            <TableCell className="text-gray-400">{empresa.sector || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge className={getTamañoBadgeColor(empresa.tamano)}>
                                {empresa.tamano || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-white">
                              {formatCurrency(empresa.facturado_2024_soles_maximo)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchCompanyDetails(empresa.ruc)}
                                className="text-[#00FF80] hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-400">
                      Página {page + 1} de {totalPages} ({count} empresas en total)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="border-gray-700"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="border-gray-700"
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

      {/* Modal de Detalles Completos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#121212] border-gray-800 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              <Building2 className="h-6 w-6 mr-3 text-[#00FF80]" />
              {selectedCompany?.razon_social}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
            </div>
          ) : selectedCompany ? (
            <div className="space-y-6">
              {/* Información General */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">RUC</div>
                      <div className="font-mono text-white">{selectedCompany.ruc}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Sector</div>
                      <div className="text-white">{selectedCompany.sector || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Tamaño</div>
                      <Badge className={getTamañoBadgeColor(selectedCompany.tamano)}>
                        {selectedCompany.tamano || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">CIIU</div>
                      <div className="text-white">{selectedCompany.ciiu || 'N/A'}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-400 mb-1">Descripción CIIU</div>
                      <div className="text-white text-sm">{selectedCompany.descripcion_ciiu_rev3 || 'N/A'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs para Rankings y Facturación */}
              <Tabs defaultValue="rankings" className="w-full">
                <TabsList className="bg-gray-900 border-gray-800">
                  <TabsTrigger value="rankings" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Rankings Históricos
                  </TabsTrigger>
                  <TabsTrigger value="facturacion" className="data-[state=active]:bg-[#00FF80] data-[state=active]:text-black">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Facturación Histórica
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rankings" className="mt-4">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Evolución del Ranking (2001-2024)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderRankingHistory()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="facturacion" className="mt-4">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Facturación Histórica (2013-2024)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderFacturacionHistory()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Top10kPage;