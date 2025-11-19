export interface CuentaBancaria {
  id: string;
  documento_id: string;
  ficha_ruc_id?: number; // Relación con tabla ficha_ruc
  nombre_banco?: string; // Nombre del banco
  numero_cuenta: string; // Número de cuenta
  tipo_cuenta?: TipoCuenta; // Tipo de cuenta (Corriente, Ahorros, etc.)
  codigo_cuenta_interbancaria?: string; // CCI
  moneda_cuenta?: Moneda; // Moneda de la cuenta
  titular_cuenta?: string; // Titular de la cuenta
  estado_cuenta: EstadoCuenta; // Estado de la cuenta (Activa, Inactiva, etc.)
  es_principal: boolean;
  notas?: string;
  created_at: string;
  updated_at: string;
  
  // Datos relacionados (cuando se hace JOIN con tabla ficha_ruc)
  ficha_ruc?: {
    id: number;
    ruc: string;
    nombre_empresa: string; // Nombre correcto de la columna
    estado_contribuyente?: string;
    domicilio_fiscal?: string;
    actividad_empresa?: string;
  };
}

export type TipoCuenta = 'corriente' | 'ahorros' | 'detraccion' | 'plazo_fijo' | 'otros';
export type Moneda = 'PEN' | 'USD' | 'EUR';
export type EstadoCuenta = 'activa' | 'inactiva' | 'cerrada' | 'bloqueada';

export interface CuentaBancariaInsert {
  documento_id: string;
  ficha_ruc_id?: number; // Relación con tabla ficha_ruc
  nombre_banco?: string; // Nombre del banco
  numero_cuenta: string; // Número de cuenta
  tipo_cuenta?: TipoCuenta; // Tipo de cuenta
  codigo_cuenta_interbancaria?: string; // CCI
  moneda_cuenta?: Moneda; // Moneda de la cuenta
  titular_cuenta?: string; // Titular de la cuenta
  estado_cuenta?: EstadoCuenta; // Estado de la cuenta
  es_principal?: boolean;
  notas?: string;
}

export interface CuentaBancariaUpdate {
  ficha_ruc_id?: number; // Relación con tabla ficha_ruc
  nombre_banco?: string; // Nombre del banco
  numero_cuenta?: string; // Número de cuenta
  tipo_cuenta?: TipoCuenta; // Tipo de cuenta
  codigo_cuenta_interbancaria?: string; // CCI
  moneda_cuenta?: Moneda; // Moneda de la cuenta
  titular_cuenta?: string; // Titular de la cuenta
  estado_cuenta?: EstadoCuenta; // Estado de la cuenta
  es_principal?: boolean;
  notas?: string;
}

// Datos comunes de bancos peruanos
export const BANCOS_PERU = [
  'BBVA',
  'BCP - Banco de Crédito del Perú',
  'Scotiabank',
  'Interbank',
  'Banco de la Nación',
  'Banco Pichincha',
  'Banco Falabella',
  'Banco Ripley',
  'HSBC',
  'Citibank',
  'Banco Santander',
  'Mi Banco',
  'Banco Azteca',
  'Banco Cencosud',
  'Otros'
] as const;

export const TIPO_CUENTA_LABELS: Record<TipoCuenta, string> = {
  'corriente': 'Cuenta Corriente',
  'ahorros': 'Cuenta de Ahorros',
  'detraccion': 'Cuenta de Detracciones',
  'plazo_fijo': 'Cuenta a Plazo Fijo',
  'otros': 'Otros'
};

export const MONEDA_LABELS: Record<Moneda, { label: string; symbol: string }> = {
  'PEN': { label: 'Soles Peruanos', symbol: 'S/' },
  'USD': { label: 'Dólares Americanos', symbol: '$' },
  'EUR': { label: 'Euros', symbol: '€' }
};

export const ESTADO_CUENTA_LABELS: Record<EstadoCuenta, string> = {
  'activa': 'Activa',
  'inactiva': 'Inactiva',
  'cerrada': 'Cerrada',
  'bloqueada': 'Bloqueada'
};

/**
 * ESTRUCTURA DE LA TABLA CUENTAS_BANCARIAS:
 * 
 * - ID de Cuenta Bancaria (clave primaria, auto-incrementable)
 * - ID de Ficha RUC (clave foránea, referencia a la tabla de Ficha RUC)
 * - Nombre del Banco
 * - Número de Cuenta
 * - Tipo de Cuenta (Corriente, Ahorros, etc.)
 * - Código de Cuenta Interbancaria (CCI)
 * - Moneda de la Cuenta
 * - Titular de la Cuenta
 * - Estado de la Cuenta (Activa, Inactiva, etc.)
 * 
 * Relaciones:
 * - documento_id: Referencia al documento procesado
 * - ficha_ruc_id: Referencia a la tabla ficha_ruc (INTEGER)
 * 
 * Esta estructura permite almacenar toda la información bancaria
 * asociada a una ficha RUC específica.
 */