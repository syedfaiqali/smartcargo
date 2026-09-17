import { SeaImportForeignAgentInvoice } from '../../domain/seaImportForeignAgentInvoice';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

/** Recomputes Total Amount from the charges grid. */
export function recomputeAgentInvoiceTotals(invoice: SeaImportForeignAgentInvoice): SeaImportForeignAgentInvoice {
  const totalAmount = sum(invoice.chargeLines, (l) => l.amount1 + l.amount2);
  return { ...invoice, totalAmount };
}
