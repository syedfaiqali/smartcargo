import { SeaImportLocalInvoice } from '../domain/seaImportLocalInvoice';
import { Repository } from './repository';
import { seaImportJobRepo } from './seaImportJobService';

export const seaImportInvoiceRepo = new Repository<SeaImportLocalInvoice>('seaImportLocalInvoice');

let invoiceSequence = 100;

export function nextSeaImportInvoiceNo(branch: string): string {
  const existing = seaImportInvoiceRepo.find((i) => i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.invoiceNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, invoiceSequence);
  invoiceSequence = maxSeq + 1;
  return `${branch}-SLII-${invoiceSequence}`;
}

/** Pulls MBL/HBL/Party/Route/Commodity from a selected Sea-Import Job No. */
export function lookupSeaImportJobForInvoice(jobNo: string) {
  const job = seaImportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    jobType: job.jobType,
    mblNo: job.mblNo,
    mblDate: job.mblDate,
    mblPpCc: job.mblPpCc,
    mblPcs: job.mblPcs,
    mblCbm: job.mblCbm,
    mblGrossWeight: job.mblGrossWeight,
    mblNetWeight: job.mblNetWeight,
    hblNo: job.hblNo,
    hblDate: job.hblDate,
    hblPpCc: job.hblPpCc,
    hblPcs: job.hblPcs,
    hblCbm: job.hblCbm,
    hblGrossWeight: job.hblGrossWeight,
    hblNetWeight: job.hblNetWeight,
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

export interface SeaImportInvoiceFilter {
  branches?: string[];
  partyCode?: string;
  destination?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchSeaImportInvoices(filter: SeaImportInvoiceFilter): SeaImportLocalInvoice[] {
  return seaImportInvoiceRepo.find((inv) => {
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

export function voidSeaImportInvoice(id: string): SeaImportLocalInvoice | undefined {
  const inv = seaImportInvoiceRepo.get(id);
  if (!inv) return undefined;
  return seaImportInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
