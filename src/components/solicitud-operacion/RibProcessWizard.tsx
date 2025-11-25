import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Search, 
  TrendingUp, 
  FileBarChart2, 
  Calendar, 
  FileSpreadsheet, 
  MessageSquare,
  Check,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface RibProcessWizardProps {
  solicitudId?: string;
  currentStep: 'solicitud' | 'rib' | 'comportamiento' | 'reporte' | 'ventas' | 'eeff' | 'comentarios';
}

const steps = [
  { id: 'solicitud', label: 'Solicitud', icon: FileText, table: 'solicitudes_operacion', path: '/solicitudes-operacion' },
  { id: 'rib', label: 'Análisis RIB', icon: Search, table: 'rib', path: '/rib' },
  { id: 'comportamiento', label: 'Comp. Crediticio', icon: TrendingUp, table: 'comportamiento_crediticio', path: '/comportamiento-crediticio' },
  { id: 'reporte', label: 'Reporte Trib.', icon: FileBarChart2, table: 'rib_reporte_tributario', path: '/rib-reporte-tributario' },
  { id: 'ventas', label: 'Ventas Mens.', icon: Calendar, table: 'ventas_mensuales', path: '/ventas-mensuales' },
  { id: 'eeff', label: 'RIB EEFF', icon: FileSpreadsheet, table: 'rib_eeff', path: '/rib-eeff' },
  { id: 'comentarios', label: 'Comentarios', icon: MessageSquare, table: 'comentarios_ejecutivo', path: '/comentarios-ejecutivo' },
];

const RibProcessWizard: React.FC<RibProcessWizardProps> = ({ solicitudId, currentStep }) => {
  const [relatedIds, setRelatedIds] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!solicitudId) {
      setLoading(false);
      return;
    }

    const fetchRelatedRecords = async () => {
      setLoading(true);
      try {
        const results: Record<string, string | null> = {};

        // Helper to fetch ID safely
        const fetchId = async (table: string, foreignKey: string = 'solicitud_id') => {
          const { data, error } = await supabase
            .from(table)
            .select('id')
            .eq(foreignKey, solicitudId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (!error && data) return data.id;
          return null;
        };

        // Fetch all related IDs in parallel
        const [ribId, compId, repId, ventasId, eeffId, comId] = await Promise.all([
          fetchId('rib'),
          fetchId('comportamiento_crediticio'),
          fetchId('rib_reporte_tributario'),
          fetchId('ventas_mensuales'),
          fetchId('rib_eeff'),
          fetchId('comentarios_ejecutivo')
        ]);

        results['rib'] = ribId;
        results['comportamiento'] = compId;
        results['reporte'] = repId;
        results['ventas'] = ventasId;
        results['eeff'] = eeffId;
        results['comentarios'] = comId;
        results['solicitud'] = solicitudId; // Always exists if we are here

        setRelatedIds(results);
      } catch (error) {
        console.error("Error fetching wizard steps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedRecords();
  }, [solicitudId]);

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full bg-[#121212] border border-gray-800 rounded-lg p-4 mb-6 overflow-x-auto">
      <div className="flex items-center min-w-max justify-between relative px-2">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-800 -z-0 transform -translate-y-1/2 hidden md:block" />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex || (index > 0 && !!relatedIds[step.id]);
          const isCurrent = step.id === currentStep;
          const isClickable = solicitudId && (isCompleted || isCurrent || index === 0 || index === currentStepIndex + 1);
          const hasRecord = !!relatedIds[step.id];
          
          let linkPath = '#';
          if (step.id === 'solicitud') {
             linkPath = `/solicitudes-operacion/edit/${solicitudId}`;
          } else {
             // If record exists, go to edit, otherwise create with solicitud_id param
             if (hasRecord) {
               linkPath = `${step.path}/edit/${relatedIds[step.id]}`;
             } else {
               linkPath = `${step.path}/create?solicitud_id=${solicitudId}`;
             }
          }

          if (!solicitudId && index > 0) isClickable &&= false; // Disable forward nav if no solicitud created

          return (
            <div key={step.id} className="relative flex flex-col items-center group z-10 px-4 md:px-0">
              <Link 
                to={isClickable ? linkPath : '#'} 
                className={cn(
                  "flex flex-col items-center transition-all duration-200",
                  !isClickable && "cursor-not-allowed opacity-50 pointer-events-none"
                )}
              >
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-[#121212]",
                    isCurrent ? "border-[#00FF80] text-[#00FF80] shadow-[0_0_10px_rgba(0,255,128,0.3)] scale-110" : 
                    isCompleted ? "border-[#00FF80] bg-[#00FF80]/10 text-[#00FF80]" : 
                    "border-gray-700 text-gray-500 hover:border-gray-500"
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                
                <span className={cn(
                  "mt-2 text-xs font-medium whitespace-nowrap transition-colors",
                  isCurrent ? "text-[#00FF80]" : 
                  isCompleted ? "text-gray-300" : "text-gray-600"
                )}>
                  {step.label}
                </span>

                {/* Status Indicator Dot */}
                {hasRecord && !isCurrent && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00FF80] rounded-full border-2 border-[#121212]" />
                )}
              </Link>
            </div>
          );
        })}
      </div>
      
      {/* Mobile-only Current Step Info */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-gray-400 text-sm px-2">
        <span>Paso {currentStepIndex + 1} de {steps.length}</span>
        <span className="text-[#00FF80] font-medium">{steps[currentStepIndex].label}</span>
      </div>
    </div>
  );
};

export default RibProcessWizard;