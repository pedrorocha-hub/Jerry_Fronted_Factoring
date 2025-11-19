export interface CuentaBancaria {
  id: string;
  documento_id?: string;
  ruc?: string;
  banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string;
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
  created_at: string;
  updated_at: string;

  ficha_ruc?: {
    id: number;
    ruc: string;
    nombre_empresa: string;
  };
}

export type TipoCuenta = 'corriente' | 'ahorros' | 'plazo_fijo' | 'cts' | 'otros' | 'detraccion';
export type Moneda = 'PEN' | 'USD' | 'EUR';

export interface CuentaBancariaInsert {
  documento_id?: string;
  ruc?: string;
  banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string;
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
}

export interface CuentaBancariaUpdate {
  ruc?: string;
  banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: TipoCuenta;
  codigo_cuenta_interbancaria?: string;
  moneda_cuenta?: Moneda;
  titular_cuenta?: string;
}

export const TIPO_CUENTA_LABELS: Record<TipoCuenta, string> = {
  'corriente': 'Cuenta Corriente',
  'ahorros': 'Cuenta de Ahorros',
  'plazo_fijo': 'Cuenta a Plazo Fijo',
  'cts': 'CTS',
  'detraccion': 'Cuenta de Detracciones',
  'otros': 'Otros'
};

export const MONEDA_LABELS: Record<Moneda, { label: string; symbol: string }> = {
  'PEN': { label: 'Soles', symbol: 'S/' },
  'USD': { label: 'Dólares', symbol: '$' },
  'EUR': { label: 'Euros', symbol: '€' }
};

export type CuentaBancariaWithFicha = CuentaBancaria;