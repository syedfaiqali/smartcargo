import { SeaImportRefundFromShippingLines, SeaImportRefundChargeLine } from '../../domain/seaImportRefundFromShippingLines';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: SeaImportRefundChargeLine, cbm: number): SeaImportRefundChargeLine {
  const amount1 = (cbm || 0) * (line.ratePerCbm || 0);
  return { ...line, amount1 };
}

/** Total Amount recomputed from the charge lines. */
export function recomputeRefundTotals(refund: SeaImportRefundFromShippingLines): SeaImportRefundFromShippingLines {
  const totalAmount = sum(refund.chargeLines, (l) => l.amount1);
  return { ...refund, totalAmount };
}
