import { AirImportLocalInvoice, AirImportInvoiceChargeLine } from '../../domain/airImportLocalInvoice';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: AirImportInvoiceChargeLine): AirImportInvoiceChargeLine {
  return { ...line, fAmount: line.rate };
}

/** Recomputes Invoice Total from the charge lines, and Total Refund Amount / Invoice Total (PKR). */
export function recomputeInvoiceTotals(invoice: AirImportLocalInvoice): AirImportLocalInvoice {
  const invoiceTotal = sum(invoice.chargeLines, (l) => l.fAmount);
  const totalRefundAmount = invoice.refund + invoice.refund2 + invoice.refund3;
  const invoiceTotalPkr = invoiceTotal - totalRefundAmount;
  return { ...invoice, invoiceTotal, totalRefundAmount, invoiceTotalPkr };
}
