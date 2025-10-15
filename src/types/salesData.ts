export interface MonthlySales {
  [month: string]: number | null;
}

export interface SalesData {
  [year: number]: MonthlySales;
}