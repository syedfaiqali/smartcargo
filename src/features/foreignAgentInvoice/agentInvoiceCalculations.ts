import { ForeignAgentInvoice } from '../../domain/foreignAgentInvoice';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

/**
 * Recomputes 6.5 Selling/Buying totals + Difference/Profit Share and 6.6 Handling charges +
 * Total Invoice Amount. Per docs 6.11: Difference, Profit Share %, Total Other Charges and
 * Total Invoice Amount are calculated/read-only outputs.
 */
export function recomputeAgentInvoiceTotals(invoice: ForeignAgentInvoice): ForeignAgentInvoice {
  const sellingLines = invoice.chargeLines.filter((l) => l.side === 'SELLING');
  const buyingLines = invoice.chargeLines.filter((l) => l.side === 'BUYING');
  const totalSelling = sum(sellingLines, (l) => l.charges);
  const totalBuying = sum(buyingLines, (l) => l.charges);
  const difference = totalSelling - totalBuying;

  const totalOtherCharges = sum(invoice.handlingLines, (l) => l.charges);
  const totalInvoiceAmount = totalSelling + totalOtherCharges;

  return { ...invoice, totalSelling, totalBuying, difference, totalOtherCharges, totalInvoiceAmount };
}

export function recomputeChargeLineAmount<T extends { rate: number; charges: number }>(line: T, qty = 1): T {
  return { ...line, charges: line.rate * qty };
}
