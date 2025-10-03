import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sentinel } from '@/types/sentinel';
import { SentinelService } from '@/services/sentinelService';
import { showSuccess, showError } from '@/utils/toast';
import SentinelTable from '@/components/sentinel/SentinelTable';
import SentinelForm from '@/components/sentinel/SentinelForm';
import { useSession } from '@/contexts/SessionContext';

const SentinelPage = () => {
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSentinel, setSelectedSentinel] = useState<Sentinel | null>(null);
  const { isAdmin } = useSession();

  const loadSentinels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SentinelService.getAll();
      setSentinels(data);
    } catch (error) {
      showError('Error al cargar los documentos Sentinel.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSentinels();
  }, [loadSentinels]);

  const handleEdit = (sentinel: Sentinel) => {
    setSelectedSentinel(sentinel);
    setIsModalOpen(true);
  };

  const handleDelete = async (sentinel: Sentinel) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el documento para el RUC ${sentinel.ruc}?`)) {
      try {
        await SentinelService.delete(sentinel.id);
        showSuccess('Documento Sentinel eliminado correctamente.');
        loadSentinels();
      } catch (error) {
        showError('Error al eliminar el documento.');
        console.error(error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setSelectedSentinel(null);
    loadSentinels();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestión de Documentos Sentinel</h1>
          {isAdmin && (
            <Button onClick={() => { setSelectedSentinel(null); setIsModalOpen(true); }} className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black">
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir Documento
            </Button>
          )}
        </div>

        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle>Documentos Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#00FF80]" />
              </div>
            ) : (
              <SentinelTable
                sentinels={sentinels}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        {isModalOpen && (
          <SentinelForm
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setSelectedSentinel(null); }}
            onSuccess={handleFormSuccess}
            sentinel={selectedSentinel}
          />
        )}
      </div>
    </Layout>
  );
};

export default SentinelPage;