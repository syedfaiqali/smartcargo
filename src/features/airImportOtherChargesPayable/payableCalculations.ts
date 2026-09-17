import { AirImportOtherChargesPayable, AirImportPayableChargeLine } from '../../domain/airImportOtherChargesPayable';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: AirImportPayableChargeLine, exRate: number): AirImportPayableChargeLine {
  const fAmount = line.qty * (line.rate || 0);
  const pkrAmount = fAmount * (exRate || 0);
  return { ...line, fAmount, pkrAmount };
}

/** Total Charges (the final payable amount) recomputed from the charge lines. */
export function recomputePayableTotals(payable: AirImportOtherChargesPayable): AirImportOtherChargesPayable {
  const totalCharges = sum(payable.chargeLines, (l) => l.pkrAmount);
  return { ...payable, totalCharges, grandTotal: totalCharges };
}
