import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, AlertCircle } from 'lucide-react';
import { useDossierData } from '@/hooks/useDossierData';
import DossierViewer from '@/components/dossier/DossierViewer';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DossierPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const solicitudIdFromUrl = searchParams.get('solicitudId');
  
  const [solicitudIdInput, setSolicitudIdInput] = useState(solicitudIdFromUrl || '');
  
  const {
    searching,
    saving,
    error,
    dossier,
    searchDossierBySolicitudId,
    saveDossier,
    setError
  } = useDossierData();

  useEffect(() => {
    if (solicitudIdFromUrl) {
      searchDossierBySolicitudId(solicitudIdFromUrl);
    }
  }, [solicitudIdFromUrl]);

  const handleSearch = () => {
    if (solicitudIdInput.trim()) {
      setSearchParams({ solicitudId: solicitudIdInput.trim() });
      searchDossierBySolicitudId(solicitudIdInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dossier RIB</h1>
            <p className="text-gray-400 mt-1">
              Visualiza el dossier completo de una solicitud de operación
            </p>
          </div>
        </div>

        {/* Buscador */}
        <Card className="bg-[#121212] border border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Search className="h-5 w-5 mr-2 text-[#00FF80]" />
              Buscar Dossier por ID de Solicitud
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Ingrese el ID de la solicitud (UUID)"
                value={solicitudIdInput}
                onChange={(e) => setSolicitudIdInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-gray-900 border-gray-700 text-white"
                disabled={searching}
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !solicitudIdInput.trim()}
                className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
              >
                {searching ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Ingrese el ID único de la solicitud de operación para ver su dossier completo
            </p>
          </CardContent>
        </Card>

        {/* Mensajes de Error */}
        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Vista del Dossier */}
        {dossier && (
          <DossierViewer 
            dossier={dossier} 
            onSave={saveDossier}
            saving={saving}
          />
        )}

        {/* Estado vacío */}
        {!dossier && !searching && !error && (
          <Card className="bg-[#121212] border border-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No hay dossier cargado
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Ingrese un ID de solicitud en el buscador para visualizar el dossier completo
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DossierPage;