import React from 'react';
import { Building2, Calendar, FileText, ChevronRight } from 'lucide-react';
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
import { ReporteTributarioPorEmpresa } from '@/services/reporteTributarioService';

interface ReportePorEmpresaTableProps {
  data: ReporteTributarioPorEmpresa[];
  onSelectEmpresa: (ruc: string) => void;
}

const ReportePorEmpresaTable: React.FC<ReportePorEmpresaTableProps> = ({ data, onSelectEmpresa }) => {
  return (
    <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900/50">
            <TableHead className="text-gray-300">Empresa</TableHead>
            <TableHead className="text-gray-300">RUC</TableHead>
            <TableHead className="text-gray-300">Años con Reportes</TableHead>
            <TableHead className="text-gray-300">Último Reporte</TableHead>
            <TableHead className="text-right text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p>No se encontraron empresas con reportes tributarios</p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((empresa) => (
              <TableRow key={empresa.ruc} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-white">{empresa.nombre_empresa}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="font-mono text-sm text-gray-300">{empresa.ruc}</code>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {empresa.años_disponibles.map(año => año && <Badge key={año} variant="outline" className="border-gray-700 text-gray-300">{año}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{empresa.ultimo_reporte}</span>
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

export default ReportePorEmpresaTable;