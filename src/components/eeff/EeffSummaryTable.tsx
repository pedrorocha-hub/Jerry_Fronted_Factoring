import React from 'react';
import { Building2, Calendar, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EeffSummary } from '@/services/eeffService';

interface EeffSummaryTableProps {
  data: EeffSummary[];
  onSelectEmpresa: (ruc: string) => void;
}

const EeffSummaryTable: React.FC<EeffSummaryTableProps> = ({ data, onSelectEmpresa }) => {
  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">Empresa</TableHead>
            <TableHead className="text-gray-300">Años con Reportes</TableHead>
            <TableHead className="text-gray-300">Última Actualización</TableHead>
            <TableHead className="text-right text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p>No se encontraron empresas con Estados Financieros</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((empresa) => (
              // make console log of empresa
              console.log(empresa), // eslint-disable-line no-consolen
              <TableRow key={empresa.ruc} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                <TableCell>
                  <div className="font-medium text-white">{empresa.nombre_empresa}</div>
                  <div className="text-sm text-gray-400 font-mono">{empresa.ruc}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {empresa.years?.map(año => año && <Badge key={año} variant="outline" className="border-gray-700 text-gray-300">{año}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(empresa.last_updated_at).toLocaleDateString('es-ES')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectEmpresa(empresa.ruc)}
                    className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10"
                  >
                    Ver Desglose <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EeffSummaryTable;