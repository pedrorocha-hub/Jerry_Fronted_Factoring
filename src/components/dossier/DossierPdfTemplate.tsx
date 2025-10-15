import React, { forwardRef } from 'react';
import { DossierRib } from '@/types/dossier';
import { RibEeff } from '@/types/rib-eeff';

interface DossierPdfTemplateProps {
  dossier: DossierRib;
}

const DossierPdfTemplate = forwardRef<HTMLDivElement, DossierPdfTemplateProps>(({ dossier }, ref) => {
  const styles = {
    page: {
      padding: '0',
      backgroundColor: '#f8f9fa',
      color: '#1f2937',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box' as 'border-box',
      margin: '0 auto',
      position: 'relative' as 'relative',
    },
    headerBanner: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)',
      padding: '16px 0',
      color: 'white',
      WebkitPrintColorAdjust: 'exact' as 'exact',
      printColorAdjust: 'exact' as 'exact',
    },
    headerContent: {
      maxWidth: '190mm',
      margin: '0 auto',
      padding: '0 10mm',
    },
    headerTitle: {
      fontSize: '22px',
      fontWeight: '700' as '700',
      margin: '0 0 4px 0',
      letterSpacing: '-0.5px',
    },
    headerSubtitle: {
      fontSize: '14px',
      fontWeight: '400' as '400',
      margin: '0 0 2px 0',
      opacity: 0.95,
    },
    headerRuc: {
      fontSize: '12px',
      fontWeight: '300' as '300',
      margin: '0',
      opacity: 0.85,
      letterSpacing: '0.5px',
    },
    accentBar: {
      height: '3px',
      background: 'linear-gradient(90deg, #00b894 0%, #00cec9 100%)',
      WebkitPrintColorAdjust: 'exact' as 'exact',
      printColorAdjust: 'exact' as 'exact',
    },
    content: {
      maxWidth: '190mm',
      margin: '0 auto',
      padding: '12px 10mm 16px 10mm',
    },
    sectionCard: {
      backgroundColor: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      padding: '14px 16px',
      marginBottom: '10px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '2px solid #f0f0f0',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
      breakAfter: 'avoid' as 'avoid',
      pageBreakAfter: 'avoid' as 'avoid',
    },
    sectionNumber: {
      backgroundColor: '#00b894',
      color: '#ffffff',
      width: '30px',
      height: '30px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700' as '700',
      fontSize: '13px',
      marginRight: '8px',
      flexShrink: 0,
      boxShadow: '0 2px 4px rgba(0, 184, 148, 0.15)',
      WebkitPrintColorAdjust: 'exact' as 'exact',
      printColorAdjust: 'exact' as 'exact',
    },
    sectionTitle: {
      fontSize: '15px',
      fontWeight: '600' as '600',
      color: '#1f2937',
      margin: '0',
    },
    subsectionTitle: {
      fontSize: '12px',
      fontWeight: '600' as '600',
      color: '#374151',
      marginTop: '12px',
      marginBottom: '6px',
      paddingLeft: '8px',
      borderLeft: '3px solid #00b894',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
      breakAfter: 'avoid' as 'avoid',
      pageBreakAfter: 'avoid' as 'avoid',
    },
    yearSubtitle: {
      fontSize: '11px',
      fontWeight: '600' as '600',
      color: '#00b894',
      marginTop: '8px',
      marginBottom: '4px',
      paddingLeft: '8px',
      backgroundColor: '#f0fdf4',
      padding: '4px 8px',
      borderRadius: '4px',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
      breakAfter: 'avoid' as 'avoid',
      pageBreakAfter: 'avoid' as 'avoid',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0',
      marginTop: '6px',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
    },
    infoItem: {
      padding: '6px 8px',
      borderBottom: '1px solid #f0f0f0',
    },
    infoLabel: {
      fontSize: '8px',
      fontWeight: '600' as '600',
      color: '#6b7280',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '2px',
    },
    infoValue: {
      fontSize: '10px',
      fontWeight: '500' as '500',
      color: '#1f2937',
      wordBreak: 'break-word' as 'break-word',
      lineHeight: '1.3',
    },
    textBlock: {
      backgroundColor: '#f9fafb',
      padding: '8px 10px',
      borderRadius: '4px',
      marginTop: '6px',
      border: '1px solid #e5e7eb',
    },
    textBlockContent: {
      fontSize: '9px',
      color: '#374151',
      lineHeight: '1.4',
      margin: '0',
    },
    tableWrapper: {
      marginTop: '8px',
      width: '100%',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
      marginBottom: '6px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as 'collapse',
      fontSize: '8px',
      border: 'none',
      tableLayout: 'auto' as 'auto',
    },
    tableHeader: {
      backgroundColor: '#374151',
      color: 'white',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
      breakAfter: 'avoid' as 'avoid',
      pageBreakAfter: 'avoid' as 'avoid',
      WebkitPrintColorAdjust: 'exact' as 'exact',
      printColorAdjust: 'exact' as 'exact',
    },
    th: {
      padding: '8px 6px',
      textAlign: 'left' as 'left',
      fontWeight: '600' as '600',
      fontSize: '7px',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #00b894',
    },
    thLast: {
      padding: '8px 6px',
      textAlign: 'left' as 'left',
      fontWeight: '600' as '600',
      fontSize: '7px',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #00b894',
    },
    tr: {
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
    },
    td: {
      padding: '6px 6px',
      borderBottom: '1px solid #e8e8e8',
      fontSize: '9px',
      color: '#374151',
      wordWrap: 'break-word' as 'break-word',
    },
    tdLast: {
      padding: '6px 6px',
      borderBottom: '1px solid #e8e8e8',
      fontSize: '9px',
      color: '#374151',
      wordWrap: 'break-word' as 'break-word',
    },
    tableRowEven: {
      backgroundColor: '#fafbfc',
    },
    tableRowOdd: {
      backgroundColor: '#ffffff',
    },
    footer: {
      marginTop: '14px',
      paddingTop: '10px',
      borderTop: '2px solid #e5e7eb',
      textAlign: 'center' as 'center',
      color: '#6b7280',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
    },
    footerText: {
      fontSize: '8px',
      margin: '2px 0',
    },
    footerBrand: {
      fontSize: '9px',
      fontWeight: '600' as '600',
      color: '#1f2937',
      marginTop: '4px',
    },
    highlightBox: {
      backgroundColor: '#fff7ed',
      border: '1px solid #fed7aa',
      borderRadius: '6px',
      padding: '10px 12px',
      marginBottom: '10px',
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
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('es-PE', { timeZone: 'UTC' });
    } catch (error) {
      return 'N/A';
    }
  };

  const InfoItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div style={styles.infoItem}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value || 'N/A'}</div>
    </div>
  );

  const TextBlock: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div style={{ marginTop: '8px' }}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.textBlock}>
        <p style={styles.textBlockContent}>{value || 'No especificado'}</p>
      </div>
    </div>
  );

  // NUEVA FUNCIÓN: Agrupar ventas mensuales por año
  const getVentasMensualesDataByYear = () => {
    if (!dossier.ventasMensuales) return {};
    const salesByYear: Record<number, Array<{ month: string; proveedorVenta: number | null; deudorVenta: number | null }>> = {};
    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
    
    years.forEach(year => {
      salesByYear[year] = [];
      months.forEach(month => {
        const proveedorKey = `${month}_${year}_proveedor`;
        const deudorKey = `${month}_${year}_deudor`;
        const proveedorVenta = dossier.ventasMensuales[proveedorKey] as number | null ?? null;
        const deudorVenta = dossier.ventasMensuales[deudorKey] as number | null ?? null;
        if (proveedorVenta !== null || deudorVenta !== null) {
          salesByYear[year].push({ month, proveedorVenta, deudorVenta });
        }
      });
    });
    return salesByYear;
  };
  const ventasMensualesByYear = getVentasMensualesDataByYear();