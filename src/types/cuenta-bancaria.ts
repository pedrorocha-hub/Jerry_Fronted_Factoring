export interface CuentaBancaria {
  id: string;
  documento_id: string;
  ficha_ruc_id?: number;
  nombre_banco?: string;
  numero_cuenta: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string; // Corregido: de codigo_cci a este nombre
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
  estado_cuenta: EstadoCuenta;
  es_principal: boolean;
  notas?: string;
  created_at: string;
  updated_at: string;
  
  ficha_ruc?: {
    id: number;
    ruc: string;
    nombre_empresa: string;
    estado_contribuyente?: string;
    domicilio_fiscal?: string;
    actividad_empresa?: string;
  };
}

export type TipoCuenta = 'Corriente' | 'Ahorros' | 'Plazo Fijo' | 'CTS' | 'Otros';
export type Moneda = 'PEN' | 'USD' | 'EUR';
export type EstadoCuenta = 'Activa' | 'Inactiva' | 'Bloqueada' | 'Cerrada';

export interface CuentaBancariaInsert {
  documento_id: string;
  ficha_ruc_id?: number;
  nombre_banco?: string;
  numero_cuenta: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string; // Corregido
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
  estado_cuenta?: EstadoCuenta;
  es_principal?: boolean;
  notas?: string;
}

export interface CuentaBancariaUpdate {
  ficha_ruc_id?: number;
  nombre_banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string; // Corregido
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
  estado_cuenta?: EstadoCuenta;
  es_principal?: boolean;
  notas?: string;
}

export const TIPO_CUENTA_LABELS: Record<TipoCuenta, string> = {
  'Corriente': 'Cuenta Corriente',
  'Ahorros': 'Cuenta de Ahorros',
  'Plazo Fijo': 'Cuenta a Plazo Fijo',
  'CTS': 'CTS',
  'Otros': 'Otros'
};

export const MONEDA_LABELS: Record<Moneda, { label: string; symbol: string }> = {
  'PEN': { label: 'Soles', symbol: 'S/' },
  'USD': { label: 'Dólares', symbol: '$' },
  'EUR': { label: 'Euros', symbol: '€' }
};

export const ESTADO_CUENTA_LABELS: Record<EstadoCuenta, string> = {
  'Activa': 'Activa',
  'Inactiva': 'Inactiva',
  'Cerrada': 'Cerrada',
  'Bloqueada': 'Bloqueada'
};