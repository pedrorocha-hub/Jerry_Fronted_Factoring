export const formatCurrency = (value: number | null | undefined, currency = 'PEN') => {
  if (value === null || value === undefined) {
    return '-';
  }
  // Formato para Sol Peruano (S/)
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};