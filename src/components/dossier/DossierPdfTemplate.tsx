import React, { forwardRef } from 'react';
import { DossierRib } from '@/types/dossier';
import { RibEeff } from '@/types/rib-eeff';

interface DossierPdfTemplateProps {
  dossier: DossierRib;
}

const DossierPdfTemplate = forwardRef<HTMLDivElement, DossierPdfTemplateProps>(({ dossier }, ref) => {
  const styles = {
    page: {
      padding: '15mm',
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
    h3: {
      fontSize: '14px',
      fontWeight: 'bold' as 'bold',
      marginTop: '15px',
      marginBottom: '10px',
      color: '#2a2a2a',
    },
    p: {
      fontSize: '12px',
      color: '#555',
      margin: '4px 0',
    },
    section: {
      pageBreakInside: 'avoid' as 'avoid',
      marginBottom: '20px',
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
      pasivo_sobregiro_bancos_y_obligaciones_corto_plazo: "Sobregiro Bancos y Obligaciones (Corto Plazo)",
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
      <h3 style={styles.h3}>{title}</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Concepto</th>
            {years.map(year => <th key={year} style={styles.th}>{year}</th>)}
          </tr>
        </thead>
        <tbody>
          {Object.entries(fields).map(([name, label]) => (
            <tr key={name}>
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
      <header style={styles.header}>
        <h1 style={styles.h1}>Dossier RIB</h1>
        <p style={styles.p}>{nombreEmpresa}</p>
        <p style={styles.p}>RUC: {dossier.solicitudOperacion.ruc}</p>
      </header>

      <section style={styles.section}>
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
        <section style={styles.section}>
          <h2 style={styles.h2}>2. Análisis RIB</h2>
          <InfoRow label="Descripción Empresa" value={dossier.analisisRib.descripcion_empresa} />
          <InfoRow label="Inicio de Actividades" value={formatDate(dossier.analisisRib.inicio_actividades)} />
          <InfoRow label="Grupo Económico" value={dossier.analisisRib.grupo_economico} />
          <InfoRow label="Dirección" value={dossier.analisisRib.direccion} />
          <InfoRow label="Teléfono" value={dossier.analisisRib.telefono} />
        </section>
      )}

      {dossier.comportamientoCrediticio && (
        <section style={styles.section}>
          <h2 style={styles.h2}>3. Comportamiento Crediticio</h2>
          <InfoRow label="Proveedor - Calificación Equifax" value={dossier.comportamientoCrediticio.equifax_calificacion} />
          <InfoRow label="Proveedor - Deuda Directa Equifax" value={formatCurrency(dossier.comportamientoCrediticio.equifax_deuda_directa)} />
          <InfoRow label="Proveedor - Calificación Sentinel" value={dossier.comportamientoCrediticio.sentinel_calificacion} />
          <InfoRow label="Proveedor - Deuda Directa Sentinel" value={formatCurrency(dossier.comportamientoCrediticio.sentinel_deuda_directa)} />
        </section>
      )}

      {dossier.ribReporteTributario && dossier.ribReporteTributario.length > 0 && (
        <section style={styles.section}>
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

      {ventasMensualesData.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.h2}>5. Ventas Mensuales</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Año</th>
                <th style={styles.th}>Mes</th>
                <th style={styles.th}>Ventas Proveedor</th>
                <th style={styles.th}>Ventas Deudor</th>
              </tr>
            </thead>
            <tbody>
              {ventasMensualesData.map((row, index) => (
                <tr key={index}>
                  <td style={styles.td}>{row.year}</td>
                  <td style={styles.td}>{row.month}</td>
                  <td style={styles.td}>{formatCurrency(row.proveedorVenta)}</td>
                  <td style={styles.td}>{formatCurrency(row.deudorVenta)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {dossier.ribEeff && dossier.ribEeff.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.h2}>6. RIB - Estados Financieros (EEFF)</h2>
          {deudorEeff.years.length > 0 && (
            <div>
              <h3 style={styles.h3}>Deudor: {nombreEmpresa}</h3>
              <FinancialTable title="Activos" fields={ribEeffFields.activoFields} years={deudorEeff.years} data={deudorEeff.data} />
              <FinancialTable title="Pasivos" fields={ribEeffFields.pasivoFields} years={deudorEeff.years} data={deudorEeff.data} />
              <FinancialTable title="Patrimonio" fields={ribEeffFields.patrimonioFields} years={deudorEeff.years} data={deudorEeff.data} />
            </div>
          )}
          {proveedorEeff.years.length > 0 && (
            <div>
              <h3 style={styles.h3}>Proveedor</h3>
              <FinancialTable title="Activos" fields={ribEeffFields.activoFields} years={proveedorEeff.years} data={proveedorEeff.data} />
              <FinancialTable title="Pasivos" fields={ribEeffFields.pasivoFields} years={proveedorEeff.years} data={proveedorEeff.data} />
              <FinancialTable title="Patrimonio" fields={ribEeffFields.patrimonioFields} years={proveedorEeff.years} data={proveedorEeff.data} />
            </div>
          )}
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