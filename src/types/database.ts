// Tipos actualizados para la base de datos
export interface Database {
  public: {
    Tables: {
      documentos: {
        Row: {
          id: string;
          nombre_archivo: string | null;
          tipo: string;
          storage_path: string;
          tamaño_archivo: number | null;
          estado: string;
          error_msg: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre_archivo?: string | null;
          tipo: string;
          storage_path: string;
          tamaño_archivo?: number | null;
          estado?: string;
          error_msg?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre_archivo?: string | null;
          tipo?: string;
          storage_path?: string;
          tamaño_archivo?: number | null;
          estado?: string;
          error_msg?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cuentas_bancarias: {
        Row: {
          id: string;
          documento_id: string;
          banco: string;
          tipo_cuenta: 'corriente' | 'ahorros' | 'detraccion' | 'otros';
          moneda: 'PEN' | 'USD' | 'EUR';
          numero_cuenta: string;
          numero_cci: string | null;
          titular_cuenta: string | null;
          estado: 'activa' | 'inactiva' | 'cerrada';
          es_principal: boolean;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          documento_id: string;
          banco: string;
          tipo_cuenta: 'corriente' | 'ahorros' | 'detraccion' | 'otros';
          moneda: 'PEN' | 'USD' | 'EUR';
          numero_cuenta: string;
          numero_cci?: string | null;
          titular_cuenta?: string | null;
          estado?: 'activa' | 'inactiva' | 'cerrada';
          es_principal?: boolean;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          documento_id?: string;
          banco?: string;
          tipo_cuenta?: 'corriente' | 'ahorros' | 'detraccion' | 'otros';
          moneda?: 'PEN' | 'USD' | 'EUR';
          numero_cuenta?: string;
          numero_cci?: string | null;
          titular_cuenta?: string | null;
          estado?: 'activa' | 'inactiva' | 'cerrada';
          es_principal?: boolean;
          notas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}