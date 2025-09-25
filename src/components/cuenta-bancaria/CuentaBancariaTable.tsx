import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Building2,
  Hash
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CuentaBancariaWithFicha, TIPO_CUENTA_LABELS, TipoCuenta } from '@/types/cuenta-bancaria';
import { useSession } from '@/contexts/SessionContext';

interface CuentaBancariaTableProps {
  cuentas: CuentaBancariaWithFicha[];
  onViewCuenta: (cuenta: CuentaBancariaWithFicha) => void;
  onEditCuenta: (cuenta: CuentaBancariaWithFicha) => void;
  onDeleteCuenta: (cuenta: CuentaBancariaWithFicha) => void;
}

const CuentaBancariaTable: React.FC<CuentaBancariaTableProps> = ({
  cuentas,
  onViewCuenta,
  onEditCuenta,
  onDeleteCuenta,
}) => {
  const { isAdmin } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [monedaFilter, setMonedaFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const safeCuentas = Array.isArray(cuentas) ? cuentas : [];

  const uniqueMonedas = Array.from(new Set(
    safeCuentas
      .map(cuenta => cuenta.moneda_cuenta)
      .filter((moneda): moneda is string => !!moneda)
  )).sort();

  const filteredCuentas = safeCuentas.filter(cuenta => {
    const matchesSearch = 
      (cuenta.banco?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (cuenta.numero_cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (cuenta.titular_cuenta?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (cuenta.codigo_cuenta_interbancaria && cuenta.codigo_cuenta_interbancaria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cuenta.ficha_ruc?.nombre_empresa && cuenta.ficha_ruc.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cuenta.ficha_ruc?.ruc && cuenta.ficha_ruc.ruc.includes(searchTerm));
    
    const matchesMoneda = monedaFilter === 'all' || cuenta.moneda_cuenta === monedaFilter;
    
    return matchesSearch && matchesMoneda;
  });

  const totalPages = Math.ceil(filteredCuentas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCuentas = filteredCuentas.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getMonedaBadge = (moneda?: string) => {
    if (!moneda) return null;
    const variants = {
      'PEN': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'USD': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'EUR': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    };
    const symbols = { 'PEN': 'S/', 'USD': '$', 'EUR': '€' };
    return (
      <Badge className={variants[moneda as keyof typeof variants] || variants.PEN}>
        {symbols[moneda as keyof typeof symbols] || moneda}
      </Badge>
    );
  };

  const getTipoCuentaBadge = (tipo?: TipoCuenta) => {
    if (!tipo) return null;
    const variants = {
      'corriente': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'ahorros': 'bg-green-500/10 text-green-400 border border-green-500/20',
      'plazo_fijo': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      'cts': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      'detraccion': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      'otros': 'bg-gray-800 text-gray-300 border border-gray-700',
    };
    return <Badge variant="outline" className={variants[tipo] || variants.otros}>{TIPO_CUENTA_LABELS[tipo] || tipo}</Badge>;
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por banco, cuenta, titular o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-[#00FF80]/50"
          />
        </div>
        
        <Select value={monedaFilter} onValueChange={setMonedaFilter}>
          <SelectTrigger className="w-full sm:w-32 bg-gray-900/50 border-gray-700 text-white focus:border-[#00FF80]/50">
            <SelectValue placeholder="Moneda" />
          </SelectTrigger>
          <SelectContent className="bg-[#121212] border-gray-800">
            <SelectItem value="all" className="text-white hover:bg-gray-800">Todas</SelectItem>
            {uniqueMonedas.map((moneda) => (
              <SelectItem key={moneda} value={moneda} className="text-white hover:bg-gray-800">
                {moneda}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-[#121212] rounded-lg border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-900/50">
              <TableHead className="text-gray-300">Banco</TableHead>
              <TableHead className="text-gray-300">Tipo / Moneda</TableHead>
              <TableHead className="text-gray-300">Número de Cuenta</TableHead>
              <TableHead className="text-gray-300">CCI</TableHead>
              <TableHead className="text-gray-300">Titular</TableHead>
              <TableHead className="text-gray-300">Empresa</TableHead>
              <TableHead className="text-right text-gray-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCuentas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                  <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p>No se encontraron cuentas bancarias</p>
                  <p className="text-sm">Las cuentas procesadas aparecerán aquí</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCuentas.map((cuenta) => (
                <TableRow key={cuenta.id} className="border-gray-800 hover:bg-gray-900/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-[#00FF80]" />
                      <div className="font-medium text-white">{cuenta.banco}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getTipoCuentaBadge(cuenta.tipo_cuenta)}
                      {getMonedaBadge(cuenta.moneda_cuenta)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <code className="font-mono text-sm text-white bg-gray-900/50 px-2 py-1 rounded">
                        {cuenta.numero_cuenta}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    {cuenta.codigo_cuenta_interbancaria ? (
                      <div className="flex items-center space-x-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <code className="font-mono text-xs text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
                          {cuenta.codigo_cuenta_interbancaria}
                        </code>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Sin CCI</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-xs truncate text-white">
                      {cuenta.titular_cuenta}
                    </div>
                  </TableCell>
                  <TableCell>
                    {cuenta.ficha_ruc ? (
                      <div>
                        <div className="font-medium text-sm text-white">{cuenta.ficha_ruc.nombre_empresa}</div>
                        <div className="text-xs text-gray-500 font-mono">RUC: {cuenta.ficha_ruc.ruc}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No asociada</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => onViewCuenta(cuenta)} title="Ver detalles" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => onEditCuenta(cuenta)} title="Editar" className="text-gray-400 hover:text-[#00FF80] hover:bg-[#00FF80]/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDeleteCuenta(cuenta)} title="Eliminar" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCuentas.length)} de {filteredCuentas.length} cuentas bancarias
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page)} className={currentPage === page ? "bg-[#00FF80] text-black hover:bg-[#00FF80]/90" : "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"}>
                {page}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white disabled:opacity-50">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuentaBancariaTable;