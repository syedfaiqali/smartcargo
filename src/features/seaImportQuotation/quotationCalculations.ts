import { SeaImportQuotation } from '../../domain/seaImportQuotation';

function sum<T>(items: T[], selector: (item: T) => number): number {
  return items.reduce((acc, item) => acc + (selector(item) || 0), 0);
}

/** IATA volumetric divisor: 1 chargeable kg per 6,000 cm³ (equivalently 166.67 kg per m³). */
const IATA_VOLUMETRIC_DIVISOR_CM3_PER_KG = 6000;

/**
 * Recomputes Volume (m³, from Pieces × the first Shipment Details dimension row) and Chargeable Weight
 * (IATA volumetric formula vs. actual Gross Weight, whichever is higher) for the vendor-quote Shipment
 * Details fields — independent of the legacy "Dimension Calculation" accordion grid below it.
 */
function recomputeShipmentWeights(quotation: SeaImportQuotation): SeaImportQuotation {
  const row = quotation.dimensions[0];
  if (!row || !row.length || !row.width || !row.height || !quotation.noOfPkgs) {
    return quotation;
  }
  const volumeM3 = quotation.noOfPkgs * ((row.length / 100) * (row.width / 100) * (row.height / 100));
  const volumetricWeightKg = (row.length * row.width * row.height * quotation.noOfPkgs) / IATA_VOLUMETRIC_DIVISOR_CM3_PER_KG;
  const chWeight = Math.max(volumetricWeightKg, quotation.grossWeight);
  return { ...quotation, cbm: Math.round(volumeM3 * 100) / 100, chWeight: Math.round(chWeight) };
}

/** Recomputes Grand Total (Buying), Grand Total (Selling), Difference, and the Shipment Details weights. */
export function recomputeQuotationTotals(quotation: SeaImportQuotation): SeaImportQuotation {
  const allLines = [...quotation.serviceChargesOrigin, ...quotation.serviceChargesDestination];
  const grandTotalBuying = sum(allLines, (l) => l.buyingAmount);
  const grandTotalSelling = sum(allLines, (l) => l.sellingAmount);
  const difference = grandTotalSelling - grandTotalBuying;
  return recomputeShipmentWeights({ ...quotation, grandTotalBuying, grandTotalSelling, difference });
}

/** Recomputes one Dimension Calculation row's Total = L x W x H x No.of Ctns. */
export function recomputeDimensionRow(row: SeaImportQuotation['dimensions'][number]): SeaImportQuotation['dimensions'][number] {
  return { ...row, total: row.length * row.width * row.height * row.noOfCtns };
}
