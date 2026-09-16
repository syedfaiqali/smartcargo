import { SeaRefundFromShippingLines } from '../domain/seaRefundFromShippingLines';
import { Repository } from './repository';
import { seaExportJobRepo } from './seaExportJobService';

export const seaRefundRepo = new Repository<SeaRefundFromShippingLines>('seaRefundFromShippingLines');

let refundSequence = 100;

export function nextSeaRefundDocNo(branch: string): string {
  const existing = seaRefundRepo.find((r) => r.branch === branch);
  const maxSeq = existing.reduce((max, r) => {
    const seq = parseInt(r.documentNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, refundSequence);
  refundSequence = maxSeq + 1;
  return `${branch}-REF-${refundSequence}`;
}

/** Pulls CBM/Job Year from a selected Sea-Export Job No. */
export function lookupSeaJobForRefund(jobNo: string) {
  const job = seaExportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    consolNo: job.consolNo,
    jobYear: new Date(job.date).getFullYear(),
    cbm: job.cbm,
    grossWeight: job.grossWeight,
    mblNo: job.mblNo,
    hblNo: job.hblNo,
    sLineAgent: job.sLineAgent,
    job,
  };
}

/** Jobs attached to a Consol No., for the allocation grid's Job No. picker. */
export function getJobsForConsolRefund(consolNo: string) {
  return seaExportJobRepo.find((j) => j.consolNo === consolNo);
}

export interface SeaRefundFilter {
  branches?: string[];
  jobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaRefunds(filter: SeaRefundFilter): SeaRefundFromShippingLines[] {
  return seaRefundRepo.find((r) => {
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

export function finalizeSeaRefund(id: string): SeaRefundFromShippingLines | undefined {
  const r = seaRefundRepo.get(id);
  if (!r) return undefined;
  return seaRefundRepo.save({ ...r, status: { ...r.status, final: true } });
}
