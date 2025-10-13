import CombinedVentasMensualesTable from '@/components/ventas-mensuales/CombinedVentasMensualesTable';
import { DossierRib } from '@/types/dossier';

interface VentasMensualesSectionProps {
  dossier: DossierRib;
}

const VentasMensualesSection = ({ dossier }: VentasMensualesSectionProps) => {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Ventas Mensuales</h3>
      {/* Aquí se mostrarían los datos de ventas mensuales del dossier */}
      <CombinedVentasMensualesTable />
    </div>
  );
};

export default VentasMensualesSection;