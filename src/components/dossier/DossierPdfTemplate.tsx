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
      padding: '16px 18px',
      marginBottom: '12px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
      WebkitColumnBreakInside: 'avoid' as 'avoid',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
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
      width: '32px',
      height: '32px',
      borderRadius: '7px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700' as '700',
      fontSize: '14px',
      marginRight: '10px',
      flexShrink: 0,
      boxShadow: '0 2px 4px rgba(0, 184, 148, 0.15)',
      WebkitPrintColorAdjust: 'exact' as 'exact',
      printColorAdjust: 'exact' as 'exact',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600' as '600',
      color: '#1f2937',
      margin: '0',
    },
    subsectionTitle: {
      fontSize: '13px',
      fontWeight: '600' as '600',
      color: '#374151',
      marginTop: '14px',
      marginBottom: '8px',
      paddingLeft: '8px',
      borderLeft: '3px solid #00b894',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
      breakAfter: 'avoid' as 'avoid',
      pageBreakAfter: 'avoid' as 'avoid',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0',
      marginTop: '8px',
      breakInside: 'avoid' as 'avoid',
      pageBreakInside: 'avoid' as 'avoid',
    },
    infoItem: {
      padding: '8px 10px',
      borderBottom: '1px solid #f0f0f0',
    },
    infoLabel: {
      fontSize: '9px',
      fontWeight: '600' as '600',
      color: '#6b7280',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.6px',
      marginBottom: '3px',
    },
    infoValue: {
      fontSize: '11px',
      fontWeight: '500' as '500',
      color: '#1f2937',
      wordBreak: 'break-word' as 'break-word',
      lineHeight: '1.3',
    },
    tableWrapper: {
      marginTop: '8px',
      width: '100%',
      breakInside: 'auto' as 'auto',
      pageBreakInside: 'auto' as 'auto',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as 'collapse',
      fontSize: '9px',
      borderRadius: '0',
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
      padding: '9px 8px',
      textAlign: 'left' as 'left',
      fontWeight: '600' as '600',
      fontSize: '8px',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.6px',
      borderRight: 'none',
      borderBottom: '2px solid #00b894',
    },
    thLast: {
      padding: '9px 8px',
      textAlign: 'left' as 'left',
      fontWeight: '600' as '600',
      fontSize: '8px',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.6px',
      borderRight: 'none',
      borderBottom: '2px solid #00b894',
    },
    td: {
      padding: '7px 8px',
      borderBottom: '1px solid #e8e8e8',
      borderRight: 'none',
      fontSize: '10px',
      color: '#374151',
      wordWrap: 'break-word' as 'break-word',
    },
    tdLast: {
      padding: '7px 8px',
      borderBottom: '1px solid #e8e8e8',
      borderRight: 'none',
      fontSize: '10px',
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

  const getVentasMensualesData = () => {
    if (!dossier.ventasMensuales) return [];
    const salesData: { year: number; month: string; proveedorVenta: number | null; deudorVenta: number | null }[] = [];
    const years = [2023, 2024, 2025];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
    
    years.forEach(year => {
      months.forEach(month => {
        const proveedorKey = `${month}_${year}_proveedor`;
        const deudorKey = `${month}_${year}_deudor`;
        const proveedorVenta = dossier.ventasMensuales[proveedorKey] as number | null ?? null;
        const deudorVenta = dossier.ventasMensuales[deudorKey] as number | null ?? null;
        if (proveedorVenta !== null || deudorVenta !== null) {
          salesData.push({ year, month, proveedorVenta, deudorVenta });
        }
      });
    });
    return salesData;
  };
  const ventasMensualesData = getVentasMensualesData();

  const ribEeffFields = {
    activoFields: {
      activo_caja_inversiones_disponible: "Caja e Inversiones Disponibles",
      activo_cuentas_por_cobrar_del_giro: "Cuentas por Cobrar del Giro",
      activo_total_activo_circulante: "Total Activo Circulante",
      activo_activo_fijo_neto: "Activo Fijo Neto",
      activo_total_activos_no_circulantes: "Total Activos no Circulantes",
      activo_total_activos: "Total Activos",
    },
    pasivoFields: {
      pasivo_sobregiro_bancos_y_obligaciones_corto_plazo: "Sobregiro Bancos y Obligaciones (CP)",
      pasivo_cuentas_por_pagar_del_giro: "Cuentas por Pagar del Giro",
      pasivo_total_pasivos_circulantes: "Total Pasivos Circulantes",
      pasivo_total_pasivos_no_circulantes: "Total Pasivos no Circulantes",
      pasivo_total_pasivos: "Total Pasivos",
    },
    patrimonioFields: {
      patrimonio_neto_capital_pagado: "Capital Pagado",
      patrimonio_neto_utilidad_perdida_acumulada: "Utilidad/Pérdida Acumulada",
      patrimonio_neto_utilidad_perdida_del_ejercicio: "Utilidad/Pérdida del Ejercicio",
      patrimonio_neto_total_patrimonio: "Total Patrimonio",
      patrimonio_neto_total_pasivos_y_patrimonio: "Total Pasivos y Patrimonio",
    }
  };

  const getRibEeffData = (tipo: 'deudor' | 'proveedor') => {
    if (!dossier.ribEeff || dossier.ribEeff.length === 0) return { data: {}, years: [] };
    const data = dossier.ribEeff
      .filter((r: RibEeff) => r.tipo_entidad === tipo)
      .reduce((acc, record) => {
        if (record.anio_reporte) acc[record.anio_reporte] = record;
        return acc;
      }, {} as Record<number, Partial<RibEeff>>);
    const years = Object.keys(data).map(Number).sort((a, b) => b - a);
    return { data, years };
  };

  const deudorEeff = getRibEeffData('deudor');
  const proveedorEeff = getRibEeffData('proveedor');

  const FinancialTable: React.FC<{ title: string, fields: Record<string, string>, years: number[], data: Record<number, Partial<RibEeff>> }> = ({ title, fields, years, data }) => (
    <div style={styles.tableWrapper}>
      <div style={styles.subsectionTitle}>{title}</div>
      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>Concepto</th>
            {years.map((year, index) => (
              <th key={year} style={index === years.length - 1 ? styles.thLast : styles.th}>{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(fields).map(([name, label], index) => (
            <tr key={name} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
              <td style={styles.td}>{label}</td>
              {years.map((year, yearIndex) => (
                <td key={year} style={yearIndex === years.length - 1 ? styles.tdLast : styles.td}>
                  {formatCurrency(data[year]?.[name as keyof RibEeff] as number)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div ref={ref} data-pdf-template style={styles.page}>
      <style>
        {`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @page {
              margin: 0;
              size: A4 portrait;
            }
          }
        `}
      </style>
      
      <div style={styles.headerBanner}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>Dossier RIB</h1>
          <p style={styles.headerSubtitle}>{nombreEmpresa}</p>
          <p style={styles.headerRuc}>RUC: {dossier.solicitudOperacion.ruc}</p>
        </div>
      </div>
      <div style={styles.accentBar}></div>

      <div style={styles.content}>
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>1</div>
            <h2 style={styles.sectionTitle}>Solicitud de Operación</h2>
          </div>
          <div style={styles.infoGrid}>
            <InfoItem label="Empresa" value={dossier.fichaRuc?.nombre_empresa} />
            <InfoItem label="RUC" value={dossier.solicitudOperacion.ruc} />
            <InfoItem label="Producto" value={dossier.solicitudOperacion.producto} />
            <InfoItem label="Proveedor" value={dossier.solicitudOperacion.proveedor} />
            <InfoItem label="Exposición Total" value={dossier.solicitudOperacion.exposicion_total} />
            <InfoItem label="Propuesta Comercial" value={dossier.solicitudOperacion.propuesta_comercial} />
            <InfoItem label="Riesgo Aprobado" value={dossier.solicitudOperacion.riesgo_aprobado} />
            <InfoItem label="Fecha Ficha" value={formatDate(dossier.solicitudOperacion.fecha_ficha)} />
          </div>
        </div>

        {dossier.analisisRib && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>2</div>
              <h2 style={styles.sectionTitle}>Análisis RIB</h2>
            </div>
            <div style={styles.infoGrid}>
              <InfoItem label="Descripción Empresa" value={dossier.analisisRib.descripcion_empresa} />
              <InfoItem label="Inicio de Actividades" value={formatDate(dossier.analisisRib.inicio_actividades)} />
              <InfoItem label="Grupo Económico" value={dossier.analisisRib.grupo_economico} />
              <InfoItem label="Dirección" value={dossier.analisisRib.direccion} />
              <InfoItem label="Teléfono" value={dossier.analisisRib.telefono} />
              <InfoItem label="Visita" value={dossier.analisisRib.visita} />
            </div>
          </div>
        )}

        {dossier.comportamientoCrediticio && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>3</div>
              <h2 style={styles.sectionTitle}>Comportamiento Crediticio</h2>
            </div>
            <div style={styles.subsectionTitle}>Proveedor</div>
            <div style={styles.infoGrid}>
              <InfoItem label="Calificación Equifax" value={dossier.comportamientoCrediticio.equifax_calificacion} />
              <InfoItem label="Score Equifax" value={dossier.comportamientoCrediticio.equifax_score} />
              <InfoItem label="Deuda Directa Equifax" value={formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_directa)} />
              <InfoItem label="Calificación Sentinel" value={dossier.comportamientoCrediticio.sentinel_calificacion} />
              <InfoItem label="Score Sentinel" value={dossier.comportamientoCrediticio.sentinel_score} />
              <InfoItem label="Deuda Directa Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_directa)} />
            </div>
            {dossier.comportamientoCrediticio.deudor && (
              <>
                <div style={styles.subsectionTitle}>Deudor</div>
                <div style={styles.infoGrid}>
                  <InfoItem label="Calificación Equifax" value={dossier.comportamientoCrediticio.deudor_equifax_calificacion} />
                  <InfoItem label="Score Equifax" value={dossier.comportamientoCrediticio.deudor_equifax_score} />
                  <InfoItem label="Deuda Directa Equifax" value={formatCurrency(dossier.comportamientoCrediticio.deudor_equifax_deuda_directa)} />
                  <InfoItem label="Calificación Sentinel" value={dossier.comportamientoCrediticio.deudor_sentinel_calificacion} />
                  <InfoItem label="Score Sentinel" value={dossier.comportamientoCrediticio.deudor_sentinel_score} />
                  <InfoItem label="Deuda Directa Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.deudor_sentinel_deuda_directa)} />
                </div>
              </>
            )}
          </div>
        )}

        {dossier.ribReporteTributario && dossier.ribReporteTributario.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>4</div>
              <h2 style={styles.sectionTitle}>RIB - Reporte Tributario</h2>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Año</th>
                    <th style={styles.th}>Tipo</th>
                    <th style={styles.th}>Total Activos</th>
                    <th style={styles.th}>Total Pasivos</th>
                    <th style={styles.thLast}>Ingreso Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.ribReporteTributario.map((reporte: any, index: number) => (
                    <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                      <td style={styles.td}>{reporte.anio}</td>
                      <td style={styles.td}>{reporte.tipo_entidad}</td>
                      <td style={styles.td}>{formatCurrency(reporte.total_activos)}</td>
                      <td style={styles.td}>{formatCurrency(reporte.total_pasivos)}</td>
                      <td style={styles.tdLast}>{formatCurrency(reporte.ingreso_ventas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {ventasMensualesData.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>5</div>
              <h2 style={styles.sectionTitle}>Ventas Mensuales</h2>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Año</th>
                    <th style={styles.th}>Mes</th>
                    <th style={styles.th}>Ventas Proveedor</th>
                    <th style={styles.thLast}>Ventas Deudor</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasMensualesData.map((row, index) => (
                    <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                      <td style={styles.td}>{row.year}</td>
                      <td style={{...styles.td, textTransform: 'capitalize'}}>{row.month}</td>
                      <td style={styles.td}>{formatCurrency(row.proveedorVenta)}</td>
                      <td style={styles.tdLast}>{formatCurrency(row.deudorVenta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {dossier.ribEeff && dossier.ribEeff.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>6</div>
              <h2 style={styles.sectionTitle}>RIB - Estados Financieros (EEFF)</h2>
            </div>
            {deudorEeff.years.length > 0 && (
              <div>
                <div style={{...styles.subsectionTitle, marginTop: '0'}}>Deudor: {nombreEmpresa}</div>
                <FinancialTable title="Activos" fields={ribEeffFields.activoFields} years={deudorEeff.years} data={deudorEeff.data} />
                <FinancialTable title="Pasivos" fields={ribEeffFields.pasivoFields} years={deudorEeff.years} data={deudorEeff.data} />
                <FinancialTable title="Patrimonio" fields={ribEeffFields.patrimonioFields} years={deudorEeff.years} data={deudorEeff.data} />
              </div>
            )}
            {proveedorEeff.years.length > 0 && (
              <div style={{marginTop: '20px'}}>
                <div style={styles.subsectionTitle}>Proveedor</div>
                <FinancialTable title="Activos" fields={ribEeffFields.activoFields} years={proveedorEeff.years} data={proveedorEeff.data} />
                <FinancialTable title="Pasivos" fields={ribEeffFields.pasivoFields} years={proveedorEeff.years} data={proveedorEeff.data} />
                <FinancialTable title="Patrimonio" fields={ribEeffFields.patrimonioFields} years={proveedorEeff.years} data={proveedorEeff.data} />
              </div>
            )}
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>Documento generado el {new Date().toLocaleString('es-ES')}</p>
          <p style={styles.footerBrand}>Upgrade AI - Análisis Inteligente</p>
        </div>
      </div>
    </div>
  );
});

DossierPdfTemplate.displayName = 'DossierPdfTemplate';

export default DossierPdfTemplate;