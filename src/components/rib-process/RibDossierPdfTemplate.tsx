import React, { forwardRef } from 'react';
import { SolicitudOperacion } from '@/types/solicitud-operacion';
import { Rib } from '@/types/rib';
import { ComportamientoCrediticio } from '@/types/comportamientoCrediticio';
import { ReporteTributarioDeudor } from '@/services/reporteTributarioDeudorService';
import { VentasMensualesProveedor } from '@/types/ventasMensualesProveedor';
import { FichaRuc } from '@/types/ficha-ruc';

interface RibDossierPdfTemplateProps {
  data: {
    solicitud: SolicitudOperacion | null;
    rib: Rib | null;
    comportamiento: ComportamientoCrediticio | null;
    reporteDeudor: ReporteTributarioDeudor | null;
    ventasProveedor: VentasMensualesProveedor | null;
    fichaProveedor: FichaRuc | null;
    fichaDeudor: FichaRuc | null;
  };
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
    <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '4px', marginBottom: '12px', color: '#1a1a1a' }}>
      {title}
    </h2>
    <div style={{ fontSize: '12px', color: '#333' }}>{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div style={{ display: 'flex', marginBottom: '8px' }}>
    <p style={{ width: '200px', fontWeight: 'bold' }}>{label}:</p>
    <p style={{ flex: 1 }}>{value || 'N/A'}</p>
  </div>
);

const RibDossierPdfTemplate = forwardRef<HTMLDivElement, RibDossierPdfTemplateProps>(({ data }, ref) => {
  const { solicitud, rib, comportamiento, reporteDeudor, ventasProveedor, fichaProveedor, fichaDeudor } = data;

  return (
    <div ref={ref} style={{ padding: '20px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', width: '210mm' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', margin: 0 }}>Dossier de Operación RIB</h1>
        <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0' }}>Proveedor: {fichaProveedor?.nombre_empresa}</p>
        <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0' }}>Deudor: {fichaDeudor?.nombre_empresa || 'N/A'}</p>
      </header>

      {solicitud && <Section title="1. Solicitud de Operación"><InfoRow label="Resumen" value={solicitud.resumen_solicitud} /></Section>}
      {rib && <Section title="2. Análisis RIB"><InfoRow label="Descripción Empresa" value={rib.descripcion_empresa} /></Section>}
      {comportamiento && <Section title="3. Comportamiento Crediticio"><InfoRow label="Score Equifax" value={comportamiento.equifax_score} /></Section>}
      {reporteDeudor && <Section title="4. Reporte Tributario del Deudor"><InfoRow label="Total Activos 2024" value={reporteDeudor.total_activos_2024} /></Section>}
      {ventasProveedor && <Section title="5. Ventas Mensuales del Proveedor"><InfoRow label="Total Ventas 2024" value={'Calculado...'} /></Section>}

      <footer style={{ marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '10px', color: '#888' }}>
        <p>Documento generado el {new Date().toLocaleString('es-ES')}</p>
      </footer>
    </div>
  );
});

export default RibDossierPdfTemplate;