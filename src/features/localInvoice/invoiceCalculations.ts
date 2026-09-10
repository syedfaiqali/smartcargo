import { AirwayBillLine, InvoiceLine, LocalInvoice } from '../../domain/localInvoice';
import { DueAgentChargeLine, DueCarrierChargeLine } from '../../domain/job';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeInvoiceLine(line: InvoiceLine, exRate: number): InvoiceLine {
  const freight = line.rate * (line.chWeight || 0);
  const freightPkr = freight * (exRate || 0);
  return { ...line, freight, freightPkr };
}

export function recomputeAirwayBillLine(line: AirwayBillLine): AirwayBillLine {
  const freight = line.rate * (line.chWeight || 0);
  const freightPkr = line.ratePkr * (line.chWeight || 0);
  const kbAmount = (freightPkr - line.netNet) * (line.kbPercent / 100);
  return { ...line, freight, freightPkr, kbAmount };
}

export function recomputeDueCarrierTotal(lines: DueCarrierChargeLine[]): number {
  return sum(lines, (l) => l.charges);
}

export function recomputeDueAgentTotal(lines: DueAgentChargeLine[]): number {
  return sum(lines, (l) => l.chargesForeign);
}

/**
 * Recomputes 4.3 Tax, Commission & Totals from the Invoice grid (4.5) and Due
 * Carrier/Agent charges (4.4). Formula per docs Section 4.3:
 *   Gross Invoice Amount = Total Freight + Total Due Carrier + Total Due Agent
 *   Invoice Total = Gross - Commission - WHT - K.B. Amount - Discount
 *                   + Sales Tax + PRA Tax + WHT Sales Tax
 */
export function recomputeInvoiceTotals(invoice: LocalInvoice): LocalInvoice {
  const totalFreight = sum(invoice.invoiceLines, (l) => l.freightPkr);
  const totalDueCarrier = recomputeDueCarrierTotal(invoice.dueCarrierLines);
  const totalDueAgent = recomputeDueAgentTotal(invoice.dueAgentLines);
  const grossInvoiceAmount = totalFreight + totalDueCarrier + totalDueAgent;

  const commissionAmount = grossInvoiceAmount * (invoice.commissionPercent / 100);
  const whtAmount = grossInvoiceAmount * (invoice.whtPercent / 100);
  const freightDifference = invoice.agreedFreight - totalFreight;
  const kbAmount = freightDifference * (invoice.kbRatePercent / 100);
  const pstAmount = grossInvoiceAmount * (invoice.salesTaxPercent / 100);
  const whtSalesTaxAmount = pstAmount * (invoice.whtSalesTaxPercent / 100);

  const invoiceTotal =
    grossInvoiceAmount -
    commissionAmount -
    whtAmount -
    kbAmount -
    invoice.totalDiscount +
    pstAmount +
    invoice.praTax +
    whtSalesTaxAmount;

  return {
    ...invoice,
    totalFreight,
    totalDueCarrier,
    totalDueAgent,
    totalDueCarrierComputed: totalDueCarrier,
    totalDueAgentComputed: totalDueAgent,
    grossInvoiceAmount,
    commissionAmount,
    whtAmount,
    freightDifference,
    kbAmount,
    pstAmount,
    whtSalesTaxAmount,
    invoiceTotal,
  };
}
