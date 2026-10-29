export const SALES_VAT_RATE = 0.19;
export function saleMonth(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'unknown';
  const parts = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit' }).formatToParts(date);
  return parts.find(part => part.type === 'year')!.value + '-' + parts.find(part => part.type === 'month')!.value;
}
export function monthLabel(month: string): string {
  if (month === 'unknown') return 'Ohne gültiges Verkaufsdatum';
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', month: 'long', year: 'numeric' }).format(new Date(month + '-01T12:00:00Z'));
}

export function saleAmounts(value: number) {
  const gross = Math.round(Number(value) * 100) / 100;
  const net = Math.round(gross / (1 + SALES_VAT_RATE) * 100) / 100;
  return { gross, net, vat: Math.round((gross - net) * 100) / 100 };
}
