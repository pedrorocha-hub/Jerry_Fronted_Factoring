import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Shield, FileBarChart, ArrowRight, FileSpreadsheet } from 'lucide-react';

const DocumentsCard = () => {
  return (
    <Card className="bg-[#121212] border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">Documentos</CardTitle>
        <CardDescription className="text-gray-400">
          Accesos directos a las secciones de documentos.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3">
        <Link to="/fichas-ruc">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-[#00FF80]" />
              Ficha RUC
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/eeff">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-[#00FF80]" />
              EEFF
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/sentinel">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-[#00FF80]" />
              Sentinel
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
        <Link to="/reporte-tributario">
          <Button variant="outline" className="w-full justify-between border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
            <div className="flex items-center">
              <FileBarChart className="h-4 w-4 mr-2 text-[#00FF80]" />
              Reportes Tributarios
            </div>
            <ArrowRight className="h-4 w-4 text-gray-500" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;