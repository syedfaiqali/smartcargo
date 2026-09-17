import { SeaImportRefundFromShippingLines } from '../domain/seaImportRefundFromShippingLines';
import { Repository } from './repository';
import { seaImportJobRepo } from './seaImportJobService';

export const seaImportRefundRepo = new Repository<SeaImportRefundFromShippingLines>('seaImportRefundFromShippingLines');

let refundSequence = 100;

export function nextSeaImportRefundDocNo(branch: string): string {
  const existing = seaImportRefundRepo.find((r) => r.branch === branch);
  const maxSeq = existing.reduce((max, r) => {
    const seq = parseInt(r.documentNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, refundSequence);
  refundSequence = maxSeq + 1;
  return `${branch}-SIREF-${refundSequence}`;
}

/** Pulls MBL/HBL/Vessel/Party/Route/CBM from a selected Sea-Import Job No. */
export function lookupSeaImportJobForRefund(jobNo: string) {
  const job = seaImportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    lclFcl: job.lclFcl,
    mblNo: job.mblNo,
    hblNo: job.hblNo,
    vessel: job.vessel,
    origin: job.origin,
    destination: job.destination,
    cbm: job.mblCbm,
    partyCode: job.partyCode,
    partyName: job.partyName,
    sLineAgent: job.sLineAgent,
    job,
  };
}

export interface SeaImportRefundFilter {
  branches?: string[];
  jobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaImportRefunds(filter: SeaImportRefundFilter): SeaImportRefundFromShippingLines[] {
  return seaImportRefundRepo.find((r) => {
    if (filter.branches?.length && !filter.branches.includes(r.branch)) return false;
    if (filter.jobNo && r.jobNo !== filter.jobNo) return false;

    switch (filter.status) {
      case 'FINAL':
        if (!r.status.final) return false;
        break;
      case 'UN_FINAL':
        if (r.status.final) return false;
        break;
      default:
        break;
    }
    return true;
  });
}
