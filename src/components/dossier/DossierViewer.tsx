import React, { useState } from 'react';
import { Save, Download, FileText, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DossierRib } from '@/types/dossier';
import SolicitudOperacionSection from './sections/SolicitudOperacionSection';
import AnalisisRibSection from './sections/AnalisisRibSection';
import ComportamientoCrediticioSection from './sections/ComportamientoCrediticioSection';
import RibReporteTributarioSection from './sections/RibReporteTributarioSection';
import VentasMensualesSection from './sections/VentasMensualesSection';
import RibEeffSection from './sections/RibEeffSection';
import ComentariosEjecutivoSection from './sections/ComentariosEjecutivoSection';

interface DossierViewerProps {
  dossier: DossierRib;
  onSave?: () => void;
  saving?: boolean;
  onDownload?: () => void;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isComplete: boolean;
  priority: 'high' | 'medium' | 'low';
}

const DossierViewer: React.FC<DossierViewerProps> = ({ dossier, onSave, saving = false, onDownload }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['solicitud']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = sections.map(s => s.id);
    setExpandedSections(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'En revisión':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Borrador':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const nombreEmpresa = dossier.fichaRuc?.nombre_empresa || 
                       dossier.top10kData?.razon_social || 
                       'Empresa sin nombre';

  // Definir secciones con su estado de completitud
  const sections: Section[] = [
    {
      id: 'solicitud',
      title: '1. Solicitud de Operación',
      icon: <FileText className="h-5 w-5" />,
      component: <SolicitudOperacionSection dossier={dossier} />,
      isComplete: !!dossier.solicitudOperacion,
      priority: 'high'
    },
    {
      id: 'analisis',
      title: '2. Análisis RIB',
      icon: <FileText className="h-5 w-5" />,
      component: <AnalisisRibSection dossier={dossier} />,
      isComplete: !!dossier.analisisRib,
      priority: 'high'
    },
    {
      id: 'comportamiento',
      title: '3. Comportamiento Crediticio',
      icon: <FileText className="h-5 w-5" />,
      component: <ComportamientoCrediticioSection dossier={dossier} />,
      isComplete: !!dossier.comportamientoCrediticio,
      priority: 'high'
    },
    {
      id: 'tributario',
      title: '4. RIB Reporte Tributario',
      icon: <FileText className="h-5 w-5" />,
      component: <RibReporteTributarioSection dossier={dossier} />,
      isComplete: !!(dossier.ribReporteTributario && dossier.ribReporteTributario.length > 0),
      priority: 'medium'
    },
    {
      id: 'ventas',
      title: '5. Ventas Mensuales',
      icon: <FileText className="h-5 w-5" />,
      component: <VentasMensualesSection dossier={dossier} />,
      isComplete: !!dossier.ventasMensuales,
      priority: 'medium'
    },
    {
      id: 'eeff',
      title: '6. RIB Estados Financieros (EEFF)',
      icon: <FileText className="h-5 w-5" />,
      component: <RibEeffSection dossier={dossier} />,
      isComplete: !!(dossier.ribEeff && dossier.ribEeff.length > 0),
      priority: 'low'
    },
    {
      id: 'comentarios',
      title: '7. Comentarios del Ejecutivo',
      icon: <FileText className="h-5 w-5" />,
      component: <ComentariosEjecutivoSection dossier={dossier} />,
      isComplete: !!dossier.comentariosEjecutivo,
      priority: 'high'
    }
  ];

  const completedSections = sections.filter(s => s.isComplete).length;
  const totalSections = sections.length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  return (
    <div className="space-y-6">
      {/* Header del Dossier */}
      <Card className="bg-[#121212] border border-gray-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <FileText className="h-8 w-8 text-[#00FF80]" />
                <div>
                  <CardTitle className="text-white text-2xl mb-1">
                    Dossier RIB Completo
                  </CardTitle>
                  <p className="text-xl text-gray-300 font-semibold">{nombreEmpresa}</p>
                  <p className="text-gray-400 text-sm mt-1">RUC: {dossier.solicitudOperacion.ruc}</p>
                </div>
              </div>

              {/* Tipo de Producto y Modalidad Highlights */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="bg-[#00FF80]/10 border border-[#00FF80]/30 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <span className="text-[#00FF80] text-xs font-bold uppercase tracking-wider">PRODUCTO:</span>
                  <span className="text-white text-sm font-medium">{dossier.solicitudOperacion.tipo_producto || 'FACTORING'}</span>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-md flex items-center gap-2">
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">MODALIDAD:</span>
                  <span className="text-white text-sm font-medium">{dossier.solicitudOperacion.tipo_operacion || 'PUNTUAL'}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progreso del Reporte</span>
                  <span className="text-sm font-semibold text-[#00FF80]">
                    {completedSections}/{totalSections} secciones ({completionPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-[#00FF80] to-[#00b894] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <span className="text-gray-400 text-xs block mb-1">Estado</span>
                  <Badge variant="outline" className={getStatusColor(dossier.solicitudOperacion.status)}>
                    {dossier.solicitudOperacion.status}
                  </Badge>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <span className="text-gray-400 text-xs block mb-1">Creado por</span>
                  <p className="text-white font-medium">{dossier.creatorInfo?.fullName || 'N/A'}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                  <span className="text-gray-400 text-xs block mb-1">Última actualización</span>
                  <p className="text-white font-medium">
                    {new Date(dossier.solicitudOperacion.updated_at).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>

              {/* Top 10K Badge si existe */}
              {dossier.top10kData && (
                <div className="mt-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="text-orange-400 font-semibold text-sm">TOP 10K PERÚ</p>
                        <p className="text-gray-300 text-xs">
                          Ranking #{dossier.top10kData.ranking_2024} - {dossier.top10kData.sector}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Facturado 2024</p>
                      <p className="text-white font-bold">
                        {dossier.top10kData.facturado_2024_soles_maximo ? 
                          new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })
                            .format(dossier.top10kData.facturado_2024_soles_maximo) : 
                          'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 ml-6">
              {onSave && (
                <Button 
                  onClick={onSave}
                  disabled={saving}
                  className="bg-[#00FF80] hover:bg-[#00FF80]/90 text-black whitespace-nowrap"
                >
                  <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Guardando...' : 'Guardar Dossier'}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onDownload}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={expandAll}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Expandir Todo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={collapseAll}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Colapsar Todo
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Secciones Colapsables */}
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        
        return (
          <Card key={section.id} className="bg-[#121212] border border-gray-800 overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-900/50 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${section.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}
                  `}>
                    {section.isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : section.priority === 'high' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          section.isComplete 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {section.isComplete ? 'Completo' : 'Pendiente'}
                      </Badge>
                      {section.priority === 'high' && !section.isComplete && (
                        <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                          Prioridad Alta
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border-t border-gray-800 pt-6">
                  {section.component}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default DossierViewer;