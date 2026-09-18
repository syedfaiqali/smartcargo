import { v4 as uuid } from 'uuid';
import { SeaImportQuotation } from '../domain/seaImportQuotation';
import { createEmptySeaImportQuotation } from '../domain/seaImportQuotationFactory';
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

/** Adds a couple of sample rows only while the Sea-Import quotations list is empty. */
export function ensureSeaImportQuotationDemo(): void {
  if (seaImportQuotationRepo.list().length) return;

  const demo1 = createEmptySeaImportQuotation('KHI');
  demo1.quotationNo = 'KHI-SIQ-101';
  demo1.transportMode = 'SEA';
  demo1.date = '2026-09-14';
  demo1.validity = '30 Days';
  demo1.localIntl = "Int'l";
  demo1.partyCode = 'P-1003';
  demo1.name = 'Sindh Rice Exporters';
  demo1.address = 'Korangi, Karachi';
  demo1.origin = 'AEJEA';
  demo1.destination = 'PKKHI';
  demo1.commodity = 'Rice';
  demo1.noOfPkgs = 120;
  demo1.uom = 'PCS';
  demo1.grossWeight = 18000;
  demo1.chWeight = 18000;
  demo1.cbm = 28.5;
  demo1.currencies = [{ currencyCode: 'USD', exRate: 278.5 }, { currencyCode: '', exRate: 0 }, { currencyCode: '', exRate: 0 }];
  demo1.jobInfo = [{ jobNo: 'KHI-SI-101', date: '2026-09-15', type: 'FCL' }];
  demo1.serviceChargesOrigin = [{ id: uuid(), description: 'Ocean Freight', buyingCurr: 'USD', buyingAmount: 900, sellingCurr: 'USD', sellingAmount: 1100 }];
  demo1.serviceChargesDestination = [{ id: uuid(), description: 'Terminal Handling', buyingCurr: 'PKR', buyingAmount: 25000, sellingCurr: 'PKR', sellingAmount: 32000 }];
  demo1.grandTotalBuying = 275650;
  demo1.grandTotalSelling = 338350;
  demo1.difference = 62700;
  demo1.status = { final: true };
  seaImportQuotationRepo.save(demo1);

  const demo2 = createEmptySeaImportQuotation('KHI');
  demo2.quotationNo = 'KHI-SIQ-102';
  demo2.transportMode = 'SEA';
  demo2.date = '2026-09-16';
  demo2.validity = '15 Days';
  demo2.localIntl = 'Local';
  demo2.partyCode = 'P-1001';
  demo2.name = 'Al Baraka Textiles Ltd';
  demo2.address = 'Site Area, Karachi';
  demo2.origin = 'CNSHA';
  demo2.destination = 'PKKHI';
  demo2.commodity = 'Textiles';
  demo2.noOfPkgs = 60;
  demo2.uom = 'PCS';
  demo2.grossWeight = 9200;
  demo2.chWeight = 9200;
  demo2.cbm = 14.2;
  demo2.currencies = [{ currencyCode: 'USD', exRate: 278.5 }, { currencyCode: '', exRate: 0 }, { currencyCode: '', exRate: 0 }];
  demo2.jobInfo = [];
  demo2.serviceChargesOrigin = [{ id: uuid(), description: 'Ocean Freight', buyingCurr: 'USD', buyingAmount: 400, sellingCurr: 'USD', sellingAmount: 520 }];
  demo2.serviceChargesDestination = [];
  demo2.grandTotalBuying = 111400;
  demo2.grandTotalSelling = 144820;
  demo2.difference = 33420;
  demo2.status = { final: false };
  seaImportQuotationRepo.save(demo2);
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
