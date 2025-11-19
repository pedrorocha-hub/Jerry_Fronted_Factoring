import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DossierSearchProps {
  onSearch: (solicitudId: string) => void;
  searching: boolean;
  error: string | null;
}

const DossierSearch: React.FC<DossierSearchProps> = ({ onSearch, searching, error }) => {
  const [solicitudIdInput, setSolicitudIdInput] = useState('');

  const handleSearch = () => {
    onSearch(solicitudIdInput);
  };

  return (
    <>
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Buscar Rib por ID de Solicitud</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Ingrese el ID de la Solicitud de Operación"
              value={solicitudIdInput}
              onChange={(e) => setSolicitudIdInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-gray-900/50 border-gray-700"
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={searching} 
            className="w-full sm:w-auto bg-[#00FF80] hover:bg-[#00FF80]/90 text-black"
          >
            {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Buscar RIB
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default DossierSearch;