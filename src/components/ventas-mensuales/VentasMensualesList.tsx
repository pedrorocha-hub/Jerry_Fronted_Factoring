import { Card, CardContent } from '@/components/ui/card';
import { VentasMensualesSummary } from '@/types/ventasMensuales';
import { FilePenLine, Calendar, User, Building2, Trash2 } from 'lucide-react';

interface VentasMensualesListProps {
  items: VentasMensualesSummary[];
  onSelectReport: (ruc: string) => void;
  onDeleteReport: (ruc: string) => void;
}

const VentasMensualesList = ({ items, onSelectReport, onDeleteReport }: VentasMensualesListProps) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-400">No hay registros de ventas mensuales.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.ruc} className="bg-[#121212] border-gray-800 text-white">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-bold flex items-center"><Building2 className="w-4 h-4 mr-2" />{item.nombre_empresa} ({item.ruc})</p>
              <p className="text-sm text-gray-400 flex items-center"><User className="w-4 h-4 mr-2" />Creado por: {item.creator_name}</p>
              <p className="text-sm text-gray-400 flex items-center"><Calendar className="w-4 h-4 mr-2" />Última actualización: {new Date(item.last_updated_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'Completado' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {item.status}
              </span>
              <button onClick={() => onSelectReport(item.ruc)} className="text-gray-400 hover:text-white"><FilePenLine className="w-5 h-5" /></button>
              <button onClick={() => onDeleteReport(item.ruc)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VentasMensualesList;