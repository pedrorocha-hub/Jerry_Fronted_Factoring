export interface CuentaBancaria {
  id: number;
  ficha_ruc_id?: number;
  nombre_banco: string;
  numero_cuenta: string;
  tipo_cuenta?: string;
  codigo_cci?: string;
  moneda_cuenta: string;
  titular_cuenta: string;
  estado_cuenta: string;
  created_at: string;
  updated_at: string;
}

export interface CuentaBancariaInsert {
  ficha_ruc_id?: number;
  nombre_banco: string;
  numero_cuenta: string;
  tipo_cuenta?: string;
  codigo_cci?: string;
  moneda_cuenta: string;
  titular_cuenta: string;
  estado_cuenta?: string;
}

export interface CuentaBancariaUpdate {
  ficha_ruc_id?: number;
  nombre_banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: string;
  codigo_cci?: string;
  moneda_cuenta?: string;
  titular_cuenta?: string;
  estado_cuenta?: string;
  updated_at?: string;
}

// Tipo extendido que incluye datos de la ficha RUC
export interface CuentaBancariaWithFicha extends CuentaBancaria {
  ficha_ruc?: {
    id: number;
    nombre_empresa: string;
    ruc: string;
  };
}