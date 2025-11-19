import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Filter, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EeffService, EeffSummary } from '@/services/eeffService';
import { Eeff } from '@/types/eeff';
import { toast } from 'sonner';
import EeffSummaryTable from '@/components/eeff/EeffSummaryTable';
import EeffDetailTable from '@/components/eeff/EeffDetailTable';
import UnifiedEeffAuditLogViewer from '@/components/audit/UnifiedEeffAuditLogViewer';

const EeffPage = () => {
  const [allEeffs, setAllEeffs] = useState<Eeff[]>([]);
  const [summaries, setSummaries] = useState<EeffSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuc, setSelectedRuc] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eeffsData, summariesData] = await Promise.all([
        EeffService.getAll(),
        EeffService.getAllSummaries()
      ]);
      setAllEeffs(eeffsData);
      setSummaries(summariesData);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos de EEFF');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro de EEFF?')) return;

    try {
      await EeffService.delete(id);
      toast.success('Registro de EEFF eliminado correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el registro de EEFF');
    }
  };

  const filteredSummaries = summaries.filter(summary =>
    summary.nombre_empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.ruc.includes(searchTerm)
  );

  const selectedEeffs = allEeffs.filter(eeff => eeff.ruc === selectedRuc);
  const selectedEmpresa = summaries.find(s => s.ruc === selectedRuc);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF80]"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <FileText className="h-8 w-8 mr-3 text-[#00FF80]" />
                Estados Financieros (EEFF)
              </h1>
              <p className="text-gray-400 mt-2">
                {selectedRuc 
                  ? `Mostrando detalles para ${selectedEmpresa?.nombre_empresa || selectedRuc}`
                  : 'Gestión de Declaraciones Juradas y Estados Financieros'}
              </p>
            </div>
            {selectedRuc ? (
              <div className="flex items-center space-x-2">
                <UnifiedEeffAuditLogViewer ruc={selectedRuc} />
                <Button variant="outline" onClick={() => setSelectedRuc(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Empresas
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black font-medium"
                onClick={() => navigate('/eeff/nuevo')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo EEFF
              </Button>
            )}
          </div>

          {!selectedRuc && (
            <Card className="bg-[#121212] border border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por empresa o RUC..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="pt-6">
              {!selectedRuc ? (
                <EeffSummaryTable data={filteredSummaries} onSelectEmpresa={setSelectedRuc} />
              ) : (
                <EeffDetailTable eeffs={selectedEeffs} onDelete={handleDelete} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EeffPage;