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
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      width: '210mm',
      minHeight: '297mm',
      boxSizing: 'border-box' as 'border-box',
    },
    headerBanner: {
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '30px 40px',
      color: 'white',
      marginBottom: '0',
    },
    headerTitle: {
      fontSize: '32px',
      fontWeight: '700' as '700',
      margin: '0 0 8px 0',
      letterSpacing: '-0.5px',
    },
    headerSubtitle: {
      fontSize: '18px',
      fontWeight: '400' as '400',
      margin: '0 0 4px 0',
      opacity: 0.95,
    },
    headerRuc: {
      fontSize: '14px',
      fontWeight: '300' as '300',
      margin: '0',
      opacity: 0.8,
      letterSpacing: '1px',
    },
    accentBar: {
      height: '6px',
      background: 'linear-gradient(90deg, #00FF80 0%, #00cc66 100%)',
      marginBottom: '30px',
    },
    content: {
      padding: '0 40px 40px 40px',
    },
    sectionCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '2px solid #00FF80',
    },
    sectionNumber: {
      backgroundColor: '#00FF80',
      color: '#000',
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700' as '700',
      fontSize: '16px',
      marginRight: '12px',
      flexShrink: 0,
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600' as '600',
      color: '#1a1a1a',
      margin: '0',
    },
    subsectionTitle: {
      fontSize: '16px',
      fontWeight: '600' as '600',
      color: '#2d2d2d',
      marginTop: '20px',
      marginBottom: '12px',
      paddingLeft: '12px',
      borderLeft: '4px solid #00FF80',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginTop: '16px',
    },
    infoItem: {
      backgroundColor: '#f9fafb',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
    },
    infoLabel: {
      fontSize: '11px',
      fontWeight: '600' as '600',
      color: '#6b7280',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px',
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '500' as '500',
      color: '#1a1a1a',
      wordBreak: 'break-word' as 'break-word',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as 'collapse',
      marginTop: '16px',
      fontSize: '12px',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    tableHeader: {
      backgroundColor: '#1a1a1a',
      color: 'white',
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left' as 'left',
      fontWeight: '600' as '600',
      fontSize: '11px',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
      borderRight: '1px solid rgba(255,255,255,0.1)',
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb',
      fontSize: '12px',
      color: '#374151',
    },
    tableRowEven: {
      backgroundColor: '#f9fafb',
    },
    tableRowOdd: {
      backgroundColor: '#ffffff',
    },
    footer: {
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '2px solid #e5e7eb',
      textAlign: 'center' as 'center',
      color: '#6b7280',
    },
    footerText: {
      fontSize: '11px',
      margin: '4px 0',
    },
    footerBrand: {
      fontSize: '12px',
      fontWeight: '600' as '600',
      color: '#1a1a1a',
      marginTop: '8px',
    },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '600' as '600',
      textTransform: 'uppercase' as 'uppercase',
      letterSpacing: '0.5px',
    },
    badgeSuccess: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    badgeWarning: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    badgeInfo: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
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

  // --- Ventas Mensuales Data Processing ---
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

  // --- RIB EEFF Data Processing ---
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
    <>
      <div style={styles.subsectionTitle}>{title}</div>
      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>Concepto</th>
            {years.map(year => <th key={year} style={styles.th}>{year}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.entries(fields).map(([name, label], index) => (
            <tr key={name} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
              <td style={styles.td}>{label}</td>
              {years.map(year => (
                <td key={year} style={styles.td}>
                  {formatCurrency(data[year]?.[name as keyof RibEeff] as number)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div ref={ref} style={styles.page}>
      {/* Header Banner */}
      <div style={styles.headerBanner}>
        <h1 style={styles.headerTitle}>Dossier RIB</h1>
        <p style={styles.headerSubtitle}>{nombreEmpresa}</p>
        <p style={styles.headerRuc}>RUC: {dossier.solicitudOperacion.ruc}</p>
      </div>
      <div style={styles.accentBar}></div>

      <div style={styles.content}>
        {/* Section 1: Solicitud de Operación */}
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

        {/* Section 2: Análisis RIB */}
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

        {/* Section 3: Comportamiento Crediticio */}
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

        {/* Section 4: RIB Reporte Tributario */}
        {dossier.ribReporteTributario && dossier.ribReporteTributario.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>4</div>
              <h2 style={styles.sectionTitle}>RIB - Reporte Tributario</h2>
            </div>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
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
                  <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                    <td style={styles.td}>{reporte.anio}</td>
                    <td style={styles.td}>{reporte.tipo_entidad}</td>
                    <td style={styles.td}>{formatCurrency(reporte.total_activos)}</td>
                    <td style={styles.td}>{formatCurrency(reporte.total_pasivos)}</td>
                    <td style={styles.td}>{formatCurrency(reporte.ingreso_ventas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 5: Ventas Mensuales */}
        {ventasMensualesData.length > 0 && (
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>5</div>
              <h2 style={styles.sectionTitle}>Ventas Mensuales</h2>
            </div>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Año</th>
                  <th style={styles.th}>Mes</th>
                  <th style={styles.th}>Ventas Proveedor</th>
                  <th style={styles.th}>Ventas Deudor</th>
                </tr>
              </thead>
              <tbody>
                {ventasMensualesData.map((row, index) => (
                  <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                    <td style={styles.td}>{row.year}</td>
                    <td style={styles.td} style={{...styles.td, textTransform: 'capitalize'}}>{row.month}</td>
                    <td style={styles.td}>{formatCurrency(row.proveedorVenta)}</td>
                    <td style={styles.td}>{formatCurrency(row.deudorVenta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section 6: RIB EEFF */}
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
              <div style={{marginTop: '24px'}}>
                <div style={styles.subsectionTitle}>Proveedor</div>
                <FinancialTable title="Activos" fields={ribEeffFields.activoFields} years={proveedorEeff.years} data={proveedorEeff.data} />
                <FinancialTable title="Pasivos" fields={ribEeffFields.pasivoFields} years={proveedorEeff.years} data={proveedorEeff.data} />
                <FinancialTable title="Patrimonio" fields={ribEeffFields.patrimonioFields} years={proveedorEeff.years} data={proveedorEeff.data} />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>Documento generado el {new Date().toLocaleString('es-ES')}</p>
          <p style={styles.footerBrand}>Upgrade AI - Análisis Inteligente</p>
        </div>
      </div>
    </div>
  );
});

export default DossierPdfTemplate;