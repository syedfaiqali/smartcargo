import { SeaLocalInvoice, SeaInvoiceChargeLine } from '../../domain/seaLocalInvoice';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: SeaInvoiceChargeLine, exRate: number): SeaInvoiceChargeLine {
  const fAmount = line.qty * (line.rate || 0);
  const pkrAmount = fAmount * (exRate || 0);
  return { ...line, fAmount, pkrAmount };
}

/** Recomputes S/Line Charges, Other Charges, Gross/Invoice totals and the refund totals. */
export function recomputeInvoiceTotals(invoice: SeaLocalInvoice): SeaLocalInvoice {
  const totalSLineCharges = sum(invoice.shippingLineChargeLines, (l) => l.pkrAmount);
  const totalOtherCharges = sum(invoice.otherChargeLines, (l) => l.pkrAmount);
  const slCharges = totalSLineCharges;
  const otherCharges = totalOtherCharges;

  const grossTotal =
    invoice.freight1 +
    invoice.freight2 +
    invoice.pstAmount +
    invoice.whtSalesTaxAmount +
    invoice.praCharges +
    slCharges +
    otherCharges;

  const totalRefund = invoice.refund1 + invoice.refund2 + invoice.refund3;
  const invoiceTotal = grossTotal - totalRefund;

  return {
    ...invoice,
    totalSLineCharges,
    totalOtherCharges,
    slCharges,
    otherCharges,
    grossTotal,
    totalRefund,
    invoiceTotal,
    invoiceTotalPkr: invoiceTotal,
  };
}
