import { v4 as uuid } from 'uuid';
import { SeaImportQuotation } from '../domain/seaImportQuotation';
import { createEmptySeaImportQuotation } from '../domain/seaImportQuotationFactory';
import { recomputeQuotationTotals } from '../features/seaImportQuotation/quotationCalculations';
import { isSeeded, markSeeded } from './localStore';
import { Repository } from './repository';

export const seaImportQuotationRepo = new Repository<SeaImportQuotation>('seaImportQuotations');

let quotationSequence = 100;

export function nextSeaImportQuotationNo(branch: string): string {
  const existing = seaImportQuotationRepo.find((q) => q.branch === branch);
  const maxSeq = existing.reduce((max, q) => {
    const seq = parseInt(q.quotationNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, quotationSequence);
  quotationSequence = maxSeq + 1;
  return `${branch}-SIQ-${quotationSequence}`;
}

let relatedQuoteSequence = 100;

/** Auto-generates a unique Related Quote No. (branch-scoped, REL-prefixed) for a new quotation. */
export function nextRelatedQuoteNo(branch: string): string {
  const existing = seaImportQuotationRepo.list();
  const maxSeq = existing.reduce((max, q) => {
    const seq = parseInt(q.relatedQuoteNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, relatedQuoteSequence);
  relatedQuoteSequence = maxSeq + 1;
  return `${branch}-REL-${relatedQuoteSequence}`;
}

/** Backfills fields/shapes added after some browsers already had quotations saved. */
function backfillMissingFields(): void {
  const items = seaImportQuotationRepo.list();
  let changed = false;
  const patched = items.map((q) => {
    const normalizedMode = q.transportMode?.toUpperCase();
    const needsAirlineRates = !q.airlineRates;
    const needsModeFix = normalizedMode !== q.transportMode && (normalizedMode === 'AIR' || normalizedMode === 'SEA');
    const needsRelatedQuoteNo = !q.relatedQuoteNo;
    const needsLocalCharges = !q.localCharges;
    const needsCarrierOptions = !q.carrierOptions;
    const needsPackageType = q.packageType === undefined;
    if (!needsAirlineRates && !needsModeFix && !needsRelatedQuoteNo && !needsLocalCharges && !needsCarrierOptions && !needsPackageType) return q;
    changed = true;
    const fixed: SeaImportQuotation = {
      ...q,
      airlineRates: q.airlineRates ?? [],
      transportMode: needsModeFix ? (normalizedMode as 'AIR' | 'SEA') : q.transportMode,
      relatedQuoteNo: needsRelatedQuoteNo ? nextRelatedQuoteNo(q.branch) : q.relatedQuoteNo,
      localCharges: q.localCharges ?? [],
      carrierOptions: q.carrierOptions ?? [],
      packageType: q.packageType ?? '',
    };
    return recomputeQuotationTotals(fixed);
  });
  if (changed) seaImportQuotationRepo.replaceAll(patched);
}

export const CARGOMIND_SAMPLE_QUOTATION_NO = 'BUH-Q26000854';

/**
 * Builds the Cargomind (Romania) "Pricing Air Export" sample quotation — the exact dataset shown in the
 * reference PDF (BUH-Q26000854 / Masum Logistics / 15 pcs Chips / TK, QR, QY carrier options). Kept as a
 * single builder so the record can always be restored on demand via `restoreCargomindSampleQuotation()`,
 * whether it was deleted, edited, or never seeded in this browser.
 */
function buildCargomindSampleQuotation(): SeaImportQuotation {
  const demo = createEmptySeaImportQuotation('KHI');
  demo.quotationNo = CARGOMIND_SAMPLE_QUOTATION_NO;
  demo.transportMode = 'AIR';
  demo.date = '2026-09-22';
  demo.validity = '22 Sep 2026 - 29 Sep 2026';
  demo.localIntl = "Int'l";
  demo.partyCode = 'MSL-01';
  demo.name = 'Masum Logistics';
  demo.address = '815 8th Floor Park Avenue, Block-6, Pechs, Shahrah-e-Faisal, Karachi, Pakistan';
  demo.origin = 'BUH';
  demo.destination = 'KHI';
  demo.commodity = 'Chips (food)';
  demo.ccPort = 'Bucharest';
  demo.noOfPkgs = 15;
  demo.uom = 'PCS';
  demo.packageType = '';
  demo.grossWeight = 2622;
  demo.chWeight = 3600;
  demo.incoTerm = 'FOB Bucharest';
  demo.cbm = 21.6;
  demo.currencies = [{ currencyCode: 'EUR', exRate: 1 }, { currencyCode: '', exRate: 0 }, { currencyCode: '', exRate: 0 }];
  demo.jobInfo = [];
  demo.airlineRates = [];
  demo.dimensions = [
    { length: 120, width: 80, height: 150, noOfCtns: 15, total: 21.6 },
    ...demo.dimensions.slice(1),
  ];
  demo.localCharges = [
    { id: uuid(), description: 'Freight Booking Commission', amount: 95, currencyCode: 'EUR' },
    { id: uuid(), description: 'Airwaybill Fee', amount: 25, currencyCode: 'EUR' },
  ];
  demo.carrierOptions = [
    {
      id: uuid(),
      optionCode: 'TK - Turkish Airlines',
      carrierName: 'Turkish Airlines',
      routing: 'OTP-IST-KHI',
      scheduleNote: 'DEP TK1040/30.09-OTP-IST\nETA TK0708/05.10-IST-KHI',
      ratePerKg: 1.95,
      currencyCode: 'EUR',
    },
    {
      id: uuid(),
      optionCode: 'QR - Qatar Airways',
      carrierName: 'Qatar Airways',
      routing: 'OTP-BUD-DOH-KHI',
      scheduleNote: '5-6 days as TT -subj to booking cfm',
      ratePerKg: 1.74,
      currencyCode: 'EUR',
    },
    {
      id: uuid(),
      optionCode: 'QY - European Air Transport',
      carrierName: 'European Air Transport',
      routing: 'OTP-LEJ-MXP-KHI',
      scheduleNote: '5-6 days as TT -subj to booking cfm',
      ratePerKg: 1.98,
      currencyCode: 'EUR',
    },
  ];
  demo.vendorInfo = {
    serviceSolicitorName: 'Masum Logistics',
    serviceSolicitorAddress: '815 8th Floor Park Avenue, Block-6, Pechs, Shahrah-e-Faisal, Karachi, Pakistan',
    serviceSolicitorContact: 'Muharram Ali',
    serviceProviderName: 'Masum Logistics',
    serviceProviderAddress: '815 8th Floor Park Avenue, Block-6, Pechs, Shahrah-e-Faisal, Karachi, Pakistan',
    issuedByName: 'Irina Leu',
    issuedByCompany: 'Cargomind (Romania) S.R.L.',
    issuedByPhone: '+40 (373) 7600 14',
    issuedByEmail: 'irina.leu@cargomind.com',
    co2EmissionsKg: 11301,
    originCity: 'Bucharest',
    destinationCity: 'Karachi',
    placeOfAcceptance: '',
    notIncluded: ['waiting times during loading/unloading', 'Storage charges caused by delays beyond our reasonable control'],
    termsText:
      'All business undertaken is subject to the General conditions of transport and services governing the activity of freight forwarding companies (Uniunea Societăților de Expediții din România, USER) ' +
      'International conventions limit the liability subject to the transport mode (air, sea, road, rail). These limits can be raised by explicit request against payment of a valuation charge. ' +
      'As a preferable solution, we offer transport insurance for an attractive premium. Goods must be properly packed to withstand cargo handling and stacking, unless quoted otherwise. ' +
      'This quotation is non-binding until final booking confirmation.',
  };
  demo.serviceChargesOrigin = [];
  demo.serviceChargesDestination = [];
  demo.status = { final: false };
  return recomputeQuotationTotals(demo);
}

/**
 * Restores the Cargomind sample quotation (BUH-Q26000854) on demand — call this any time the user wants that
 * exact dataset back, whether it was deleted, edited away, or never existed in this browser. Replaces any
 * existing record with that quotation number so re-running it is always safe (no duplicates).
 */
export function restoreCargomindSampleQuotation(): SeaImportQuotation {
  const sample = buildCargomindSampleQuotation();
  const others = seaImportQuotationRepo.list().filter((q) => q.quotationNo !== CARGOMIND_SAMPLE_QUOTATION_NO);
  seaImportQuotationRepo.replaceAll([...others, sample]);
  return sample;
}

/** One-time migration: replaces all quotations with the single Cargomind (Romania) vendor rate quote BUH-Q26000854. */
export function ensureSeaImportQuotationDemo(): void {
  backfillMissingFields();
  if (isSeeded('seaImportQuotationsCargomindResetV2')) return;
  markSeeded('seaImportQuotationsCargomindResetV2');
  seaImportQuotationRepo.replaceAll([buildCargomindSampleQuotation()]);
}

export interface SeaImportQuotationFilter {
  branches?: string[];
  partyCode?: string;
  destination?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaImportQuotations(filter: SeaImportQuotationFilter): SeaImportQuotation[] {
  return seaImportQuotationRepo.find((q) => {
    if (filter.branches?.length && !filter.branches.includes(q.branch)) return false;
    if (filter.partyCode && q.partyCode !== filter.partyCode) return false;
    if (filter.destination && q.destination !== filter.destination) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (q.date < filter.startDate || q.date > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!q.status.final) return false;
        break;
      case 'UN_FINAL':
        if (q.status.final) return false;
        break;
      default:
        break;
    }
    return true;
  });
}
