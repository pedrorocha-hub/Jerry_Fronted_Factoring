export interface DossierRib {
  // 1. Solicitud de operación
  solicitudOperacion: any;
  riesgos: any[];
  fichaRuc: any;
  creatorInfo: any;
  
  // 2. Análisis RIB
  analisisRib: any;
  accionistas: any[];
  gerencia: any[];
  
  // 3. Comportamiento Crediticio
  comportamientoCrediticio: any;
  
  // 4. RIB - Reporte Tributario
  ribReporteTributario: any[];
  
  // 5. Ventas Mensuales
  ventasMensuales: any;
  
  // Datos adicionales
  top10kData: any;
}

export interface DossierSummary {
  ruc: string;
  nombreEmpresa: string;
  status: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  creadorNombre: string;
  ranking?: number;
  sector?: string;
}