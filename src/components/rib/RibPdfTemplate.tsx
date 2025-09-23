import React, { forwardRef } from 'react';
import { Rib } from '@/types/rib';
import { FichaRuc } from '@/types/ficha-ruc';

interface Top10kData {
  descripcion_ciiu_rev3: string | null;
  sector: string | null;
  ranking_2024: number | null;
}

interface RibPdfTemplateProps {
  data: {
    rib: Rib;
    ficha: FichaRuc;
    top10k: Top10kData | null;
  };
}

const RibPdfTemplate = forwardRef<HTMLDivElement, RibPdfTemplateProps>(({ data }, ref) => {
  const { rib, ficha, top10k } = data;

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #00FF80', paddingBottom: '4px', marginBottom: '12px', color: '#1a1a1a' }}>
      {children}
    </h2>
  );

  const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div style={{ display: 'flex', marginBottom: '8px', fontSize: '12px' }}>
      <p style={{ width: '200px', fontWeight: 'bold', color: '#333' }}>{label}:</p>
      <p style={{ flex: 1, color: '#555' }}>{value || 'N/A'}</p>
    </div>
  );

  return (
    <div ref={ref} style={{ padding: '20px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', width: '210mm' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', margin: 0 }}>Reporte de Inicio Básico (RIB)</h1>
        <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0' }}>{ficha.nombre_empresa}</p>
        <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 0' }}>RUC: {ficha.ruc}</p>
      </header>

      <section style={{ marginBottom: '20px' }}>
        <SectionTitle>Ficha RUC</SectionTitle>
        <InfoRow label="Razón Social" value={ficha.nombre_empresa} />
        <InfoRow label="RUC" value={ficha.ruc} />
        <InfoRow label="Estado del Contribuyente" value={ficha.estado_contribuyente} />
        <InfoRow label="Inicio de Actividades" value={ficha.fecha_inicio_actividades ? new Date(ficha.fecha_inicio_actividades).toLocaleDateString('es-ES') : 'N/A'} />
        <InfoRow label="Domicilio Fiscal" value={ficha.domicilio_fiscal} />
        <InfoRow label="Actividad Principal" value={ficha.actividad_empresa} />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <SectionTitle>Riesgo Vigente del Deudor (TOP 10K)</SectionTitle>
        <InfoRow label="Giro (CIIU)" value={top10k?.descripcion_ciiu_rev3} />
        <InfoRow label="Sector" value={top10k?.sector} />
        <InfoRow label="Ranking 2024" value={top10k?.ranking_2024 ? `#${top10k.ranking_2024}` : 'N/A'} />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <SectionTitle>Información del Pagador</SectionTitle>
        <InfoRow label="Dirección" value={rib.direccion} />
        <InfoRow label="Visita" value={rib.visita} />
        <InfoRow label="Contacto" value={rib.contacto} />
        <InfoRow label="Fianza" value={rib.fianza} />
        <InfoRow label="Comentarios" value={rib.comentarios} />
      </section>

      <section>
        <SectionTitle>Condiciones Comerciales</SectionTitle>
        <InfoRow label="L/P" value={rib.lp} />
        <InfoRow label="Producto" value={rib.producto} />
        <InfoRow label="Proveedor" value={rib.proveedor} />
        <InfoRow label="L/P Vigente (GVE)" value={rib.lp_vigente_gve} />
        <InfoRow label="Riesgo Aprobado" value={rib.riesgo_aprobado} />
        <InfoRow label="Propuesta Comercial" value={rib.propuesta_comercial} />
        <InfoRow label="Exposición Total" value={rib.exposicion_total} />
      </section>

      <footer style={{ marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '10px', color: '#888' }}>
        <p>Documento generado el {new Date().toLocaleString('es-ES')}</p>
        <p>Upgrade AI - Análisis Inteligente</p>
      </footer>
    </div>
  );
});

export default RibPdfTemplate;