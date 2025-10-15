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
          <tr style={styles.tr}>
            <th style={styles.th}>Concepto</th>
            {years.map((year, index) => (
              <th key={year} style={index === years.length - 1 ? styles.thLast : styles.th}>{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(fields).map(([name, label], index) => (
            <tr key={name} style={{ ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd), ...styles.tr }}>
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
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
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
        {/* SECCIÓN 1: SOLICITUD DE OPERACIÓN */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionNumber}>1</div>
            <h2 style={styles.sectionTitle}>Solicitud de Operación</h2>
          </div>

          {dossier.top10kData && (
            <div style={styles.highlightBox}>
              <div style={{ ...styles.infoLabel, marginBottom: '6px' }}>⭐ INFORMACIÓN TOP 10K PERÚ</div>
              <div style={styles.infoGrid}>
                <InfoItem label="Sector" value={dossier.top10kData.sector} />
                <InfoItem label="Ranking 2024" value={dossier.top10kData.ranking_2024 ? `#${dossier.top10kData.ranking_2024}` : 'N/A'} />
                <InfoItem label="Facturado 2024 (Máx)" value={formatCurrency(dossier.top10kData.facturado_2024_soles_maximo)} />
                <InfoItem label="Tamaño Empresa" value={dossier.top10kData.tamano} />
              </div>
            </div>
          )}

          <div style={styles.subsectionTitle}>Información Básica</div>
          <div style={styles.infoGrid}>
            <InfoItem label="Empresa" value={dossier.fichaRuc?.nombre_empresa} />
            <InfoItem label="RUC" value={dossier.solicitudOperacion.ruc} />
            <InfoItem label="Producto" value={dossier.solicitudOperacion.producto} />
            <InfoItem label="Proveedor" value={dossier.solicitudOperacion.proveedor} />
            <InfoItem label="Deudor" value={dossier.solicitudOperacion.deudor} />
            <InfoItem label="Moneda" value={dossier.solicitudOperacion.moneda_operacion} />
            <InfoItem label="Exposición Total" value={dossier.solicitudOperacion.exposicion_total} />
            <InfoItem label="Propuesta Comercial" value={dossier.solicitudOperacion.propuesta_comercial} />
            <InfoItem label="Riesgo Aprobado" value={dossier.solicitudOperacion.riesgo_aprobado} />
            <InfoItem label="Fecha Ficha" value={formatDate(dossier.solicitudOperacion.fecha_ficha)} />
            <InfoItem label="L/P" value={dossier.solicitudOperacion.lp} />
            <InfoItem label="L/P Vigente GVE" value={dossier.solicitudOperacion.lp_vigente_gve} />
            <InfoItem label="Fianza" value={dossier.solicitudOperacion.fianza} />
            <InfoItem label="Tipo de Cambio" value={dossier.solicitudOperacion.tipo_cambio} />
            <InfoItem label="Orden de Servicio" value={dossier.solicitudOperacion.orden_servicio} />
            <InfoItem label="Factura" value={dossier.solicitudOperacion.factura} />
          </div>

          {dossier.solicitudOperacion.direccion && (
            <>
              <div style={styles.subsectionTitle}>Información del Deudor</div>
              <div style={styles.infoGrid}>
                <InfoItem label="Dirección" value={dossier.solicitudOperacion.direccion} />
                <InfoItem label="Visita" value={dossier.solicitudOperacion.visita} />
                <InfoItem label="Contacto" value={dossier.solicitudOperacion.contacto} />
              </div>
            </>
          )}

          {dossier.solicitudOperacion.resumen_solicitud && (
            <TextBlock label="Resumen Solicitud" value={dossier.solicitudOperacion.resumen_solicitud} />
          )}

          {dossier.solicitudOperacion.garantias && (
            <TextBlock label="Garantías" value={dossier.solicitudOperacion.garantias} />
          )}

          {dossier.solicitudOperacion.condiciones_desembolso && (
            <TextBlock label="Condiciones de Desembolso" value={dossier.solicitudOperacion.condiciones_desembolso} />
          )}

          {dossier.solicitudOperacion.comentarios && (
            <TextBlock label="Comentarios" value={dossier.solicitudOperacion.comentarios} />
          )}

          {dossier.riesgos && dossier.riesgos.length > 0 && (
            <>
              <div style={styles.subsectionTitle}>Riesgos del Proveedor</div>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr style={styles.tr}>
                      <th style={styles.th}>L/P</th>
                      <th style={styles.th}>Producto</th>
                      <th style={styles.th}>Deudor</th>
                      <th style={styles.th}>Riesgo Aprobado</th>
                      <th style={styles.thLast}>Propuesta Comercial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossier.riesgos.map((riesgo: any, index: number) => (
                      <tr key={index} style={{ ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd), ...styles.tr }}>
                        <td style={styles.td}>{riesgo.lp || 'N/A'}</td>
                        <td style={styles.td}>{riesgo.producto || 'N/A'}</td>
                        <td style={styles.td}>{riesgo.deudor || 'N/A'}</td>
                        <td style={styles.td}>{formatCurrency(riesgo.riesgo_aprobado)}</td>
                        <td style={styles.tdLast}>{formatCurrency(riesgo.propuesta_comercial)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        {/* SECCIÓN 2: ANÁLISIS RIB */}
        {dossier.analisisRib && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>2</div>
              <h2 style={styles.sectionTitle}>Análisis RIB</h2>
            </div>
            
            <div style={styles.subsectionTitle}>Información de la Empresa</div>
            <div style={styles.infoGrid}>
              <InfoItem label="Inicio de Actividades" value={formatDate(dossier.analisisRib.inicio_actividades)} />
              <InfoItem label="Grupo Económico" value={dossier.analisisRib.grupo_economico} />
              <InfoItem label="Cómo llegó a LCP" value={dossier.analisisRib.como_llego_lcp} />
              <InfoItem label="Validado por" value={dossier.analisisRib.validado_por} />
              <InfoItem label="Dirección" value={dossier.analisisRib.direccion} />
              <InfoItem label="Teléfono" value={dossier.analisisRib.telefono} />
              <InfoItem label="Relación Comercial con Deudor" value={dossier.analisisRib.relacion_comercial_deudor} />
            </div>

            {dossier.analisisRib.descripcion_empresa && (
              <TextBlock label="Descripción de la Empresa" value={dossier.analisisRib.descripcion_empresa} />
            )}

            {dossier.analisisRib.visita && (
              <TextBlock label="Visita" value={dossier.analisisRib.visita} />
            )}

            {dossier.accionistas && dossier.accionistas.length > 0 && (
              <>
                <div style={styles.subsectionTitle}>Accionistas</div>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr style={styles.tr}>
                        <th style={styles.th}>Nombre</th>
                        <th style={styles.th}>DNI</th>
                        <th style={styles.th}>%</th>
                        <th style={styles.th}>Vínculo</th>
                        <th style={styles.th}>Calificación</th>
                        <th style={styles.thLast}>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossier.accionistas.map((acc: any, index: number) => (
                        <tr key={index} style={{ ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd), ...styles.tr }}>
                          <td style={styles.td}>{acc.nombre}</td>
                          <td style={styles.td}>{acc.dni}</td>
                          <td style={styles.td}>{acc.porcentaje ? `${acc.porcentaje}%` : 'N/A'}</td>
                          <td style={styles.td}>{acc.vinculo || 'N/A'}</td>
                          <td style={styles.td}>{acc.calificacion || 'N/A'}</td>
                          <td style={styles.tdLast}>{acc.comentario || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {dossier.gerencia && dossier.gerencia.length > 0 && (
              <>
                <div style={styles.subsectionTitle}>Gerencia</div>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead style={styles.tableHeader}>
                      <tr style={styles.tr}>
                        <th style={styles.th}>Nombre</th>
                        <th style={styles.th}>DNI</th>
                        <th style={styles.th}>Cargo</th>
                        <th style={styles.th}>Vínculo</th>
                        <th style={styles.th}>Calificación</th>
                        <th style={styles.thLast}>Comentario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossier.gerencia.map((ger: any, index: number) => (
                        <tr key={index} style={{ ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd), ...styles.tr }}>
                          <td style={styles.td}>{ger.nombre}</td>
                          <td style={styles.td}>{ger.dni}</td>
                          <td style={styles.td}>{ger.cargo || 'N/A'}</td>
                          <td style={styles.td}>{ger.vinculo || 'N/A'}</td>
                          <td style={styles.td}>{ger.calificacion || 'N/A'}</td>
                          <td style={styles.tdLast}>{ger.comentario || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* SECCIÓN 3: COMPORTAMIENTO CREDITICIO */}
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
              <InfoItem label="Deuda Indirecta Equifax" value={formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_indirecta)} />
              <InfoItem label="Calificación Sentinel" value={dossier.comportamientoCrediticio.sentinel_calificacion} />
              <InfoItem label="Score Sentinel" value={dossier.comportamientoCrediticio.sentinel_score} />
              <InfoItem label="Deuda Directa Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_directa)} />
              <InfoItem label="Deuda Indirecta Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_indirecta)} />
            </div>

            {dossier.comportamientoCrediticio.deudor && (
              <>
                <div style={styles.subsectionTitle}>Deudor</div>
                <div style={styles.infoGrid}>
                  <InfoItem label="Deudor" value={dossier.comportamientoCrediticio.deudor} />
                  <InfoItem label="Calificación Equifax" value={dossier.comportamientoCrediticio.deudor_equifax_calificacion} />
                  <InfoItem label="Score Equifax" value={dossier.comportamientoCrediticio.deudor_equifax_score} />
                  <InfoItem label="Deuda Directa Equifax" value={formatCurrency(dossier.comportamientoCrediticio.deudor_equifax_deuda_directa)} />
                  <InfoItem label="Deuda Indirecta Equifax" value={formatCurrency(dossier.comportamientoCrediticio.deudor_equifax_deuda_indirecta)} />
                  <InfoItem label="Calificación Sentinel" value={dossier.comportamientoCrediticio.deudor_sentinel_calificacion} />
                  <InfoItem label="Score Sentinel" value={dossier.comportamientoCrediticio.deudor_sentinel_score} />
                  <InfoItem label="Deuda Directa Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.deudor_sentinel_deuda_directa)} />
                  <InfoItem label="Deuda Indirecta Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.deudor_sentinel_deuda_indirecta)} />
                </div>
              </>
            )}
          </div>
        )}

        {/* SECCIÓN 4: RIB REPORTE TRIBUTARIO */}
        {dossier.ribReporteTributario && dossier.ribReporteTributario.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>4</div>
              <h2 style={styles.sectionTitle}>RIB - Reporte Tributario</h2>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr style={styles.tr}>
                    <th style={styles.th}>Año</th>
                    <th style={styles.th}>Tipo</th>
                    <th style={styles.th}>Total Activos</th>
                    <th style={styles.th}>Total Pasivos</th>
                    <th style={styles.thLast}>Ingreso Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {dossier.ribReporteTributario.map((reporte: any, index: number) => (
                    <tr key={index} style={{ ...(index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd), ...styles.tr }}>
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