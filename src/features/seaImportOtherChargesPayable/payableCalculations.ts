import { SeaImportOtherChargesPayable, SeaImportPayableChargeLine } from '../../domain/seaImportOtherChargesPayable';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: SeaImportPayableChargeLine, exRate: number): SeaImportPayableChargeLine {
  const pkrAmount = line.fAmount * (exRate || 0);
  return { ...line, pkrAmount };
}

/** Total Charges (the final payable amount) recomputed from the charge lines. */
export function recomputePayableTotals(payable: SeaImportOtherChargesPayable): SeaImportOtherChargesPayable {
  const totalCharges = sum(payable.chargeLines, (l) => l.pkrAmount);
  return { ...payable, totalCharges, grandTotal: totalCharges };
}
