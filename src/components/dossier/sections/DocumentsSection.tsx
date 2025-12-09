import React from 'react';
import { DossierRib } from '@/types/dossier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Receipt, Camera, FolderOpen, Paperclip } from 'lucide-react';
import { DocumentoService } from '@/services/documentoService';

interface DocumentsSectionProps {
  dossier: DossierRib;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ dossier }) => {
  const documentos = dossier.documentos || [];

  if (documentos.length === 0) {
    return (
      <div className="text-center py-12">
        <Paperclip className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No hay documentos adjuntos a este expediente.</p>
      </div>
    );
  }

  const handleDownload = async (path: string, name: string) => {
    try {
      const url = await DocumentoService.getSignedUrl(path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const groups = [
    { 
      id: 'facturas', 
      title: 'Facturas a Negociar', 
      icon: Receipt, 
      color: 'text-blue-400',
      docs: documentos.filter(d => d.tipo === 'factura_negociar')
    },
    { 
      id: 'evidencias', 
      title: 'Evidencias de Visita', 
      icon: Camera, 
      color: 'text-purple-400',
      docs: documentos.filter(d => d.tipo === 'evidencia_visita')
    },
    { 
      id: 'otros', 
      title: 'Sustentos y Otros', 
      icon: FolderOpen, 
      color: 'text-[#00FF80]',
      docs: documentos.filter(d => !['factura_negociar', 'evidencia_visita'].includes(d.tipo))
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="text-gray-400 text-xs mb-1">Total Archivos</div>
          <div className="text-2xl font-bold text-white">{documentos.length}</div>
        </div>
      </div>

      {groups.map((group) => (
        group.docs.length > 0 && (
          <Card key={group.id} className="bg-[#121212] border border-gray-800">
            <CardHeader className="pb-3 border-b border-gray-800">
              <CardTitle className="text-base text-white flex items-center">
                <group.icon className={`h-5 w-5 mr-2 ${group.color}`} />
                {group.title}
                <Badge variant="secondary" className="ml-2 bg-gray-800 text-gray-300">
                  {group.docs.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-3">
                {group.docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="h-10 w-10 rounded bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <FileText className={`h-5 w-5 ${group.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate" title={doc.nombre_archivo || ''}>
                          {doc.nombre_archivo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()} • {(doc.tamaño_archivo ? (doc.tamaño_archivo / 1024 / 1024).toFixed(2) : '0')} MB
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => handleDownload(doc.storage_path, doc.nombre_archivo || 'archivo')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

export default DocumentsSection;