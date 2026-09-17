import { AirImportLocalInvoice } from '../domain/airImportLocalInvoice';
import { Repository } from './repository';
import { airImportJobRepo } from './airImportJobService';

export const airImportInvoiceRepo = new Repository<AirImportLocalInvoice>('airImportLocalInvoice');

let invoiceSequence = 100;

export function nextAirImportInvoiceNo(branch: string): string {
  const existing = airImportInvoiceRepo.find((i) => i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.invoiceNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, invoiceSequence);
  invoiceSequence = maxSeq + 1;
  return `${branch}-AII-${invoiceSequence}`;
}

/** Pulls MAWB/HAWB/Party/Route from a selected Air-Import Job No. */
export function lookupAirImportJobForInvoice(jobNo: string) {
  const job = airImportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    jobType: job.jobType,
    mawbNo: job.mawbNo,
    mawbDate: job.mawbDate,
    mawbPpCc: job.mawbPpCc,
    mawbPcs: job.mawbPcs,
    mawbCbm: job.mawbCbm,
    mawbGrossWeight: job.mawbGrossWeight,
    mawbChargeWeight: job.mawbChargeWeight,
    hawbNo: job.hawbNo,
    hawbDate: job.hawbDate,
    hawbPpCc: job.hawbPpCc,
    hawbPcs: job.hawbPcs,
    hawbCbm: job.hawbCbm,
    hawbGrossWeight: job.hawbGrossWeight,
    hawbChargeWeight: job.hawbChargeWeight,
    partyCode: job.partyCode,
    partyName: job.partyName,
    subAgentParty: job.subAgentParty,
    spoCode: job.spoCode,
    foreignAgent: job.foreignAgent,
    commodity: job.commodity,
    origin: job.origin,
    destination: job.destination,
    job,
  };
}

export interface AirImportInvoiceFilter {
  branches?: string[];
  partyCode?: string;
  destination?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchAirImportInvoices(filter: AirImportInvoiceFilter): AirImportLocalInvoice[] {
  return airImportInvoiceRepo.find((inv) => {
    if (filter.branches?.length && !filter.branches.includes(inv.branch)) return false;
    if (filter.partyCode && inv.partyCode !== filter.partyCode) return false;
    if (filter.destination && inv.destination !== filter.destination) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (inv.date < filter.startDate || inv.date > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!inv.status.final) return false;
        break;
      case 'UN_FINAL':
        if (inv.status.final) return false;
        break;
      case 'VOID':
        if (!inv.status.void) return false;
        break;
      case 'UN_VOID':
        if (inv.status.void) return false;
        break;
      default:
        break;
    }
    return true;
  });
}

export function voidAirImportInvoice(id: string): AirImportLocalInvoice | undefined {
  const inv = airImportInvoiceRepo.get(id);
  if (!inv) return undefined;
  return airImportInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
