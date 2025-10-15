import React, { forwardRef } from 'react';
import { DossierRib } from '@/types/dossier';

interface DossierPdfTemplateProps {
  dossier: DossierRib;
}

const DossierPdfTemplate = forwardRef<HTMLDivElement, DossierPdfTemplateProps>(({ dossier }, ref) => {
  const styles = {
    page: {
      padding: '20px',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box' as 'border-box',
    },
    header: {
      textAlign: 'center' as 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #eee',
      paddingBottom: '10px',
    },
    h1: {
      fontSize: '24px',
      fontWeight: 'bold' as 'bold',
      color: '#000',
      margin: 0,
    },
    h2: {
      fontSize: '18px',
      fontWeight: 'bold' as 'bold',
      borderBottom: '2px solid #333',
      paddingBottom: '4px',
      marginBottom: '12px',
      marginTop: '20px',
      color: '#1a1a1a',
    },
    p: {
      fontSize: '12px',
      color: '#555',
      margin: '4px 0',
    },
    infoRow: {
      display: 'flex',
      marginBottom: '8px',
      fontSize: '12px',
    },
    label: {
      width: '200px',
      fontWeight: 'bold' as 'bold',
      color: '#333',
    },
    value: {
      flex: 1,
      color: '#555',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as 'collapse',
      marginTop: '10px',
    },
    th: {
      border: '1px solid #ddd',
      padding: '8px',
      textAlign: 'left' as 'left',
      backgroundColor: '#f2f2f2',
      fontSize: '11px',
    },
    td: {
      border: '1px solid #ddd',
      padding: '8px',
      fontSize: '11px',
    },
    footer: {
      marginTop: '30px',
      paddingTop: '10px',
      borderTop: '1px solid #eee',
      textAlign: 'center' as 'center',
      fontSize: '10px',
      color: '#888',
    },
  };

  const nombreEmpresa = dossier.fichaRuc?.nombre_empresa || dossier.top10kData?.razon_social || 'Empresa sin nombre';

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
    if (isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      // Asegurarse de que la fecha se interpreta correctamente como UTC
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { timeZone: 'UTC' });
    } catch (error) {
      return 'N/A';
    }
  };

  const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div style={styles.infoRow}>
      <p style={styles.label}>{label}:</p>
      <p style={styles.value}>{value || 'N/A'}</p>
    </div>
  );

  return (
    <div ref={ref} style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.h1}>Dossier RIB</h1>
        <p style={styles.p}>{nombreEmpresa}</p>
        <p style={styles.p}>RUC: {dossier.solicitudOperacion.ruc}</p>
      </header>

      <section>
        <h2 style={styles.h2}>1. Solicitud de Operación</h2>
        <InfoRow label="Empresa" value={dossier.fichaRuc?.nombre_empresa} />
        <InfoRow label="RUC" value={dossier.solicitudOperacion.ruc} />
        <InfoRow label="Producto" value={dossier.solicitudOperacion.producto} />
        <InfoRow label="Proveedor" value={dossier.solicitudOperacion.proveedor} />
        <InfoRow label="Exposición Total" value={dossier.solicitudOperacion.exposicion_total} />
        <InfoRow label="Propuesta Comercial" value={dossier.solicitudOperacion.propuesta_comercial} />
        <InfoRow label="Riesgo Aprobado" value={dossier.solicitudOperacion.riesgo_aprobado} />
        <InfoRow label="Fecha Ficha" value={formatDate(dossier.solicitudOperacion.fecha_ficha)} />
      </section>

      {dossier.analisisRib && (
        <section>
          <h2 style={styles.h2}>2. Análisis RIB</h2>
          <InfoRow label="Descripción Empresa" value={dossier.analisisRib.descripcion_empresa} />
          <InfoRow label="Inicio de Actividades" value={formatDate(dossier.analisisRib.inicio_actividades)} />
          <InfoRow label="Grupo Económico" value={dossier.analisisRib.grupo_economico} />
          <InfoRow label="Dirección" value={dossier.analisisRib.direccion} />
          <InfoRow label="Teléfono" value={dossier.analisisRib.telefono} />
        </section>
      )}

      {dossier.comportamientoCrediticio && (
        <section>
          <h2 style={styles.h2}>3. Comportamiento Crediticio</h2>
          <InfoRow label="Proveedor - Calificación Equifax" value={dossier.comportamientoCrediticio.equifax_calificacion} />
          <InfoRow label="Proveedor - Deuda Directa Equifax" value={formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_directa)} />
          <InfoRow label="Proveedor - Calificación Sentinel" value={dossier.comportamientoCrediticio.sentinel_calificacion} />
          <InfoRow label="Proveedor - Deuda Directa Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_directa)} />
        </section>
      )}

      {dossier.ribReporteTributario && dossier.ribReporteTributario.length > 0 && (
        <section>
          <h2 style={styles.h2}>4. RIB - Reporte Tributario</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Año</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Total Activos</th>
                <th style={styles.th}>Total Pasivos</th>
                <th style={styles.th}>Ingreso Ventas</th>
              </tr>
            </thead>
            <tbody>
              {dossier.ribReporteTributario.map((reporte: any, index: number) => (
                <tr key={index}>
                  <td style={styles.td}>{reporte.anio}</td>
                  <td style={styles.td}>{reporte.tipo_entidad}</td>
                  <td style={styles.td}>{formatCurrency(reporte.total_activos)}</td>
                  <td style={styles.td}>{formatCurrency(reporte.total_pasivos)}</td>
                  <td style={styles.td}>{formatCurrency(reporte.ingreso_ventas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <footer style={styles.footer}>
        <p>Documento generado el {new Date().toLocaleString('es-ES')}</p>
        <p>Upgrade AI - Análisis Inteligente</p>
      </footer>
    </div>
  );
});

export default DossierPdfTemplate;