import { SeaRefundFromShippingLines, RefundChargeLine } from '../../domain/seaRefundFromShippingLines';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: RefundChargeLine, cbm: number, exRate: number): RefundChargeLine {
  const fAmount = (cbm || 0) * (line.ratePerCbm || 0);
  const pkrAmount = fAmount * (exRate || 0);
  return { ...line, fAmount, pkrAmount };
}

/** Total Amount recomputed from the charge lines. */
export function recomputeRefundTotals(refund: SeaRefundFromShippingLines): SeaRefundFromShippingLines {
  const totalAmount = sum(refund.chargeLines, (l) => l.pkrAmount);
  return { ...refund, totalAmount };
}
