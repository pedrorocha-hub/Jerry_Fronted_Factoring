export interface CuentaBancaria {
  id: string;
  documento_id: string;
  banco?: string;
  numero_cuenta?: string; // Ahora es opcional
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string;
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
  created_at: string;
  updated_at: string;
  
  // Campos de la segunda cuenta
  numero_cuenta_2?: string;
  codigo_cuenta_interbancaria_2?: string;
  tipo_cuenta_2?: TipoCuenta;
  moneda_cuenta_2?: Moneda;
}

export type TipoCuenta = 'Corriente' | 'Ahorros' | 'Plazo Fijo' | 'CTS' | 'Otros';
export type Moneda = 'PEN' | 'USD' | 'EUR';

export interface CuentaBancariaInsert {
  documento_id: string;
  banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string;
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
  numero_cuenta_2?: string;
  codigo_cuenta_interbancaria_2?: string;
  tipo_cuenta_2?: TipoCuenta;
  moneda_cuenta_2?: Moneda;
}

export interface CuentaBancariaUpdate {
  banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string;
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
  numero_cuenta_2?: string;
  codigo_cuenta_interbancaria_2?: string;
  tipo_cuenta_2?: TipoCuenta;
  moneda_cuenta_2?: Moneda;
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