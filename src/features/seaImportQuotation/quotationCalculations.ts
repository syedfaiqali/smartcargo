import { SeaImportQuotation } from '../../domain/seaImportQuotation';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

/** Recomputes Grand Total (Buying), Grand Total (Selling) and Difference from the service charge grids. */
export function recomputeQuotationTotals(quotation: SeaImportQuotation): SeaImportQuotation {
  const allLines = [...quotation.serviceChargesOrigin, ...quotation.serviceChargesDestination];
  const grandTotalBuying = sum(allLines, (l) => l.buyingAmount);
  const grandTotalSelling = sum(allLines, (l) => l.sellingAmount);
  const difference = grandTotalSelling - grandTotalBuying;
  return { ...quotation, grandTotalBuying, grandTotalSelling, difference };
}

/** Recomputes one Dimension Calculation row's Total = L x W x H x No.of Ctns. */
export function recomputeDimensionRow(row: SeaImportQuotation['dimensions'][number]): SeaImportQuotation['dimensions'][number] {
  return { ...row, total: row.length * row.width * row.height * row.noOfCtns };
}
