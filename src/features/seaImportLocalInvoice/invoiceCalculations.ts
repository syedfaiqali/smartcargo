import { SeaImportLocalInvoice, SeaImportInvoiceChargeLine } from '../../domain/seaImportLocalInvoice';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: SeaImportInvoiceChargeLine): SeaImportInvoiceChargeLine {
  return { ...line, fAmount: line.qty * (line.rate || 0) };
}

/** Recomputes Invoice Total from the charge lines, and Total Refund Amount / Invoice Total (PKR). */
export function recomputeInvoiceTotals(invoice: SeaImportLocalInvoice): SeaImportLocalInvoice {
  const invoiceTotal = sum(invoice.chargeLines, (l) => l.fAmount);
  const totalRefundAmount = invoice.refund + invoice.refund2 + invoice.refund3;
  const invoiceTotalPkr = invoiceTotal - totalRefundAmount;
  return { ...invoice, invoiceTotal, totalRefundAmount, invoiceTotalPkr };
}
