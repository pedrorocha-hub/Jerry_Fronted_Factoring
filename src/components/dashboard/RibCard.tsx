import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, FileSearch, TrendingUp, FileBarChart2, CalendarDays, ArrowRight, FileText, MessageSquare } from 'lucide-react';

const RibCard = () => {
  return (
    <Card className="bg-[#121212] border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">Creación del RIB</CardTitle>
        <CardDescription className="text-gray-400">
          Accesos directos para la creación y análisis del RIB.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3">
        <Link to="/solicitudes-operacion">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-[#00FF80]" />
              Solicitudes de operación
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/rib">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <FileSearch className="h-4 w-4 mr-2 text-[#00FF80]" />
              Análisis RIB
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/comportamiento-crediticio">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-[#00FF80]" />
              Comportamiento Crediticio
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/rib-reporte-tributario">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <FileBarChart2 className="h-4 w-4 mr-2 text-[#00FF80]" />
              RIB Reporte Tributario
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/ventas-mensuales">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-[#00FF80]" />
              Ventas Mensuales
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/rib-eeff">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-[#00FF80]" />
              RIB EEFF
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/comentarios-ejecutivo">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-[#00FF80]" />
              Comentarios del Ejecutivo
              <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                BETA
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default RibCard;