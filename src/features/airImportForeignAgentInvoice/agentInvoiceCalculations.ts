import { AirImportForeignAgentInvoice, AirImportAgentChargeLine } from '../../domain/airImportForeignAgentInvoice';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: AirImportAgentChargeLine): AirImportAgentChargeLine {
  return { ...line, amount: line.rate };
}

/** Recomputes Total Amount from the charges grid. */
export function recomputeAgentInvoiceTotals(invoice: AirImportForeignAgentInvoice): AirImportForeignAgentInvoice {
  const totalAmount = sum(invoice.chargeLines, (l) => l.amount);
  return { ...invoice, totalAmount };
}
