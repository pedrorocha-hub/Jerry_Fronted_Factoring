export interface Accionista {
  id: string;
  ruc: string;
  dni: string;
  nombre: string;
  porcentaje: number | null;
  vinculo: string | null;
  calificacion: string | null;
  comentario: string | null;
  created_at: string;
  updated_at: string;
}