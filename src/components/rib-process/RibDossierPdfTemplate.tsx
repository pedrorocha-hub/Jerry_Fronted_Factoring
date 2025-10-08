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
    <h2 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '12px', color: '#1a1a1a' }}>
      {title}
    </h2>
    <div style={{ fontSize: '10px', color: '#333' }}>{children}</div>
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div style={{ display: 'flex', marginBottom: '6px', pageBreakInside: 'avoid' }}>
    <p style={{ width: '180px', fontWeight: 'bold', paddingRight: '10px' }}>{label}:</p>
    <p style={{ flex: 1, wordBreak: 'break-word' }}>{value || 'N/A'}</p>
  </div>
);

const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
    <thead>
      <tr>
        {headers.map(h => <th key={h} style={{ border: '1px solid #ddd', padding: '4px', backgroundColor: '#f2f2f2', textAlign: 'left' }}>{h}</th>)}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);

const Tr: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr style={{ pageBreakInside: 'avoid' }}>{children}</tr>
);

const Td: React.FC<{ children: React.ReactNode; bold?: boolean }> = ({ children, bold }) => (
  <td style={{ border: '1px solid #ddd', padding: '4px', fontWeight: bold ? 'bold' : 'normal' }}>{children || 'N/A'}</td>
);

const RibDossierPdfTemplate = forwardRef<HTMLDivElement, RibDossierPdfTemplateProps>(({ data }, ref) => {
  const { solicitud, rib, comportamiento, reporteDeudor, ventasProveedor, fichaProveedor, fichaDeudor } = data;

  return (
    <div ref={ref} style={{ padding: '20px', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', width: '210mm' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', margin: 0 }}>Dossier de Operación RIB</h1>
        <p style={{ fontSize: '12px', color: '#555', margin: '4px 0 0' }}>Proveedor: {fichaProveedor?.nombre_empresa} ({fichaProveedor?.ruc})</p>
        <p style={{ fontSize: '12px', color: '#555', margin: '4px 0 0' }}>Deudor: {fichaDeudor?.nombre_empresa || 'N/A'} ({solicitud?.deudor || 'N/A'})</p>
      </header>

      {solicitud && (
        <Section title="1. Solicitud de Operación">
          <InfoRow label="Fecha de Ficha" value={solicitud.fecha_ficha ? new Date(solicitud.fecha_ficha).toLocaleDateString('es-ES') : 'N/A'} />
          <InfoRow label="Moneda" value={solicitud.moneda_operacion} />
          <InfoRow label="Tipo de Cambio" value={solicitud.tipo_cambio} />
          <InfoRow label="Producto" value={solicitud.producto} />
          <InfoRow label="LP" value={solicitud.lp} />
          <InfoRow label="LP Vigente GVE" value={solicitud.lp_vigente_gve} />
          <InfoRow label="Riesgo Aprobado" value={solicitud.riesgo_aprobado} />
          <InfoRow label="Propuesta Comercial" value={solicitud.propuesta_comercial} />
          <InfoRow label="Exposición Total" value={solicitud.exposicion_total} />
          <InfoRow label="Resumen" value={solicitud.resumen_solicitud} />
          <InfoRow label="Garantías" value={solicitud.garantias} />
          <InfoRow label="Condiciones de Desembolso" value={solicitud.condiciones_desembolso} />
          <InfoRow label="Comentarios" value={solicitud.comentarios} />
        </Section>
      )}

      {rib && (
        <Section title="2. Análisis RIB">
          <InfoRow label="Estado" value={rib.status} />
          <InfoRow label="Dirección" value={rib.direccion} />
          <InfoRow label="Teléfono" value={rib.telefono} />
          <InfoRow label="Grupo Económico" value={rib.grupo_economico} />
          <InfoRow label="Descripción de la Empresa" value={rib.descripcion_empresa} />
        </Section>
      )}

      {comportamiento && (
        <Section title="3. Comportamiento Crediticio">
          <h3 style={{fontSize: '11px', fontWeight: 'bold', marginBottom: '8px'}}>Proveedor</h3>
          <Table headers={['Concepto', 'Equifax', 'Sentinel']}>
            <Tr><Td bold>Score</Td><Td>{comportamiento.equifax_score}</Td><Td>{comportamiento.sentinel_score}</Td></Tr>
            <Tr><Td bold>Calificación</Td><Td>{comportamiento.equifax_calificacion}</Td><Td>{comportamiento.sentinel_calificacion}</Td></Tr>
            <Tr><Td bold>Deuda Directa</Td><Td>{comportamiento.equifax_deuda_directa}</Td><Td>{comportamiento.sentinel_deuda_directa}</Td></Tr>
          </Table>
          <h3 style={{fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', marginTop: '12px'}}>Deudor</h3>
          <Table headers={['Concepto', 'Equifax', 'Sentinel']}>
            <Tr><Td bold>Score</Td><Td>{comportamiento.deudor_equifax_score}</Td><Td>{comportamiento.deudor_sentinel_score}</Td></Tr>
            <Tr><Td bold>Calificación</Td><Td>{comportamiento.deudor_equifax_calificacion}</Td><Td>{comportamiento.deudor_sentinel_calificacion}</Td></Tr>
            <Tr><Td bold>Deuda Directa</Td><Td>{comportamiento.deudor_equifax_deuda_directa}</Td><Td>{comportamiento.deudor_sentinel_deuda_directa}</Td></Tr>
          </Table>
        </Section>
      )}

      {reporteDeudor && (
        <Section title="4. Reporte Tributario del Deudor">
          <Table headers={['Concepto', '2022', '2023', '2024']}>
            <Tr><Td bold>Cuentas por Cobrar</Td><Td>{reporteDeudor.cuentas_por_cobrar_giro_2022}</Td><Td>{reporteDeudor.cuentas_por_cobrar_giro_2023}</Td><Td>{reporteDeudor.cuentas_por_cobrar_giro_2024}</Td></Tr>
            <Tr><Td bold>Total Activos</Td><Td>{reporteDeudor.total_activos_2022}</Td><Td>{reporteDeudor.total_activos_2023}</Td><Td>{reporteDeudor.total_activos_2024}</Td></Tr>
            <Tr><Td bold>Total Pasivos</Td><Td>{reporteDeudor.total_pasivos_2022}</Td><Td>{reporteDeudor.total_pasivos_2023}</Td><Td>{reporteDeudor.total_pasivos_2024}</Td></Tr>
            <Tr><Td bold>Total Patrimonio</Td><Td>{reporteDeudor.total_patrimonio_2022}</Td><Td>{reporteDeudor.total_patrimonio_2023}</Td><Td>{reporteDeudor.total_patrimonio_2024}</Td></Tr>
          </Table>
        </Section>
      )}

      {ventasProveedor && (
        <Section title="5. Ventas Mensuales del Proveedor">
          <Table headers={['Mes', '2023', '2024', '2025']}>
            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(month => (
              <Tr key={month}>
                <Td bold>{month}</Td>
                <Td>{ventasProveedor[`${month.toLowerCase()}_2023`]}</Td>
                <Td>{ventasProveedor[`${month.toLowerCase()}_2024`]}</Td>
                <Td>{ventasProveedor[`${month.toLowerCase()}_2025`]}</Td>
              </Tr>
            ))}
          </Table>
        </Section>
      )}

      <footer style={{ marginTop: '30px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '9px', color: '#888' }}>
        <p>Documento generado el {new Date().toLocaleString('es-ES')}</p>
      </footer>
    </div>
  );
});

export default RibDossierPdfTemplate;