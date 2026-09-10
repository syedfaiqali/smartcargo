import { OtherChargesPayable, PayableChargeLine } from '../../domain/otherChargesPayable';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: PayableChargeLine, exRate: number): PayableChargeLine {
  const fAmount = line.qty * (line.rate || 0);
  const pkrAmount = fAmount * (exRate || 0);
  return { ...line, fAmount, pkrAmount };
}

/** 5.4 Total Charges (the final payable amount) recomputed from the charge lines. */
export function recomputePayableTotals(payable: OtherChargesPayable): OtherChargesPayable {
  const totalCharges = sum(payable.chargeLines, (l) => l.pkrAmount);
  return { ...payable, totalCharges, grandTotal: totalCharges };
}
