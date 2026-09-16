import { SeaOtherChargesPayable, SeaPayableChargeLine } from '../../domain/seaOtherChargesPayable';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

export function recomputeChargeLine(line: SeaPayableChargeLine, exRate: number): SeaPayableChargeLine {
  const fAmount = line.qty * (line.rate || 0);
  const pkrAmount = fAmount * (exRate || 0);
  return { ...line, fAmount, pkrAmount };
}

/** Sub Total / Less Total / Grand Total recomputed from the charge grids. */
export function recomputePayableTotals(payable: SeaOtherChargesPayable): SeaOtherChargesPayable {
  const subTotal = sum(payable.chargeLines, (l) => l.pkrAmount);
  const lessTotal = sum(payable.lessChargeLines, (l) => l.pkrAmount);
  return { ...payable, subTotal, lessTotal, grandTotal: subTotal - lessTotal };
}
