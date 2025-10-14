import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit } from 'lucide-react';

const DossierTable = ({ dossiers, loading, onViewDossier }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center text-gray-400 py-8">Cargando dossiers...</div>;
  }

  if (!dossiers || dossiers.length === 0) {
    return (
      <div className="text-center text-gray-500 bg-[#121212] p-8 rounded-lg border border-gray-800">
        <p>No hay dossiers guardados.</p>
        <p className="text-sm text-gray-600 mt-2">Intenta buscar un RUC para generar un nuevo dossier.</p>
      </div>
    );
  }

  const handleEditRibEeff = (ruc: string) => {
    navigate(`/dossiers/rib-eeff/${ruc}`);
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-[#121212] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-900/50 border-b-gray-800">
            <TableHead className="text-white">RUC</TableHead>
            <TableHead className="text-white">Nombre Empresa</TableHead>
            <TableHead className="text-white">Estado</TableHead>
            <TableHead className="text-white text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dossiers.map((dossier) => (
            <TableRow key={dossier.ruc} className="border-gray-800">
              <TableCell className="font-medium">{dossier.ruc}</TableCell>
              <TableCell>{dossier.nombre_empresa}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-[#00FF80] text-[#00FF80]">{dossier.status}</Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onViewDossier(dossier.ruc)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Dossier
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditRibEeff(dossier.ruc)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Gestionar RIB EEFF
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DossierTable;