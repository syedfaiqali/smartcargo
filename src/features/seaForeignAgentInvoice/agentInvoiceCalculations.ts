import { SeaForeignAgentInvoice } from '../../domain/seaForeignAgentInvoice';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

/**
 * Recomputes Selling/Buying totals + Difference/Profit Share, Less Expenses total,
 * Handling/Other Charges total, and Total Invoice Amount.
 */
export function recomputeSeaAgentInvoiceTotals(invoice: SeaForeignAgentInvoice): SeaForeignAgentInvoice {
  const sellingLines = invoice.chargeLines.filter((l) => l.side === 'SELLING');
  const buyingLines = invoice.chargeLines.filter((l) => l.side === 'BUYING');
  const totalSelling = sum(sellingLines, (l) => l.charges);
  const totalBuying = sum(buyingLines, (l) => l.charges);
  const difference = totalSelling - totalBuying;

  const totalLessExpenses = sum(invoice.lessExpenseLines, (l) => l.charges);
  const totalOtherCharges = sum(invoice.handlingLines, (l) => l.charges);
  const totalInvoiceAmount = totalSelling - totalLessExpenses + totalOtherCharges;

  return { ...invoice, totalSelling, totalBuying, difference, totalLessExpenses, totalOtherCharges, totalInvoiceAmount };
}

export function recomputeChargeLineAmount<T extends { rate: number; charges: number }>(line: T, qty = 1): T {
  return { ...line, charges: line.rate * qty };
}
