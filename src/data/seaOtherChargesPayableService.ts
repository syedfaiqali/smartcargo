import { SeaOtherChargesPayable } from '../domain/seaOtherChargesPayable';
import { Repository } from './repository';
import { seaExportJobRepo } from './seaExportJobService';

export const seaPayableRepo = new Repository<SeaOtherChargesPayable>('seaOtherChargesPayable');

let payableSequence = 100;

export function nextSeaCreditNoteNo(branch: string): string {
  const existing = seaPayableRepo.find((p) => p.branch === branch);
  const maxSeq = existing.reduce((max, p) => {
    const seq = parseInt(p.creditNoteNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, payableSequence);
  payableSequence = maxSeq + 1;
  return `${branch}-SOCP-${payableSequence}`;
}

/** Pulls MBL No./CBM/Job Year from a selected Sea-Export Job No. */
export function lookupSeaJob(jobNo: string) {
  const job = seaExportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    mblNo: job.mblNo,
    consolNo: job.consolNo,
    jobYear: new Date(job.date).getFullYear(),
    lclFcl: job.lclFcl,
    cbm: job.cbm,
    grossWeight: job.grossWeight,
    job,
  };
}

/** Jobs attached to a Consol No., for the Auto Calculate Cost grid's Job No. picker. */
export function getJobsForConsol(consolNo: string) {
  return seaExportJobRepo.find((j) => j.consolNo === consolNo);
}

export interface SeaPayableFilter {
  branches?: string[];
  partyCode?: string;
  payableType?: string;
  jobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaPayables(filter: SeaPayableFilter): SeaOtherChargesPayable[] {
  return seaPayableRepo.find((p) => {
    if (filter.branches?.length && !filter.branches.includes(p.branch)) return false;
    if (filter.partyCode && p.partyCode !== filter.partyCode) return false;
    if (filter.payableType && p.payableType !== filter.payableType) return false;
    if (filter.jobNo && p.jobNo !== filter.jobNo) return false;

    switch (filter.status) {
      case 'FINAL':
        if (!p.status.final) return false;
        break;
      case 'UN_FINAL':
        if (p.status.final) return false;
        break;
      default:
        break;
    }
    return true;
  });
}

export function finalizeSeaPayable(id: string): SeaOtherChargesPayable | undefined {
  const p = seaPayableRepo.get(id);
  if (!p) return undefined;
  return seaPayableRepo.save({ ...p, status: { ...p.status, final: true } });
}
