import { OtherChargesPayable } from '../domain/otherChargesPayable';
import { Repository } from './repository';
import { jobRepo } from './jobService';

export const payableRepo = new Repository<OtherChargesPayable>('otherChargesPayable');

let payableSequence = 100;

/** Credit Note No. — the payable's own document number (docs 5.2 notes this same field/screen also issues credit notes). */
export function nextCreditNoteNo(branch: string): string {
  const existing = payableRepo.find((p) => p.branch === branch);
  const maxSeq = existing.reduce((max, p) => {
    const seq = parseInt(p.creditNoteNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, payableSequence);
  payableSequence = maxSeq + 1;
  return `${branch}-OCP-${payableSequence}`;
}

/** Pulls Gross Weight/Charge Weight and MAWB No. (docs 5.2) from a selected Master Job No. */
export function lookupMasterJob(jobNo: string) {
  const job = jobRepo.find((j) => j.kind === 'MAWB' && j.jobNo === jobNo)[0];
  if (!job) return null;
  const grossWeight = job.chargeLines.reduce((sum, l) => sum + l.grossWt, 0);
  const chargeWeight = job.chargeLines.reduce((sum, l) => sum + l.chargeWt, 0);
  return { mawbNo: job.mawbNo, jobYear: new Date(job.jobDate).getFullYear(), grossWeight, chargeWeight, job };
}

/** House jobs under a Master, for the 5.3 allocation grid's Job No. / HAWB No. picker. */
export function getHouseJobsForMaster(masterJobNo: string) {
  return jobRepo.find((j) => j.kind === 'HAWB' && j.parentJobNo === masterJobNo);
}

export interface PayableFilter {
  branches?: string[];
  partyCode?: string;
  payableType?: string;
  mJobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchPayables(filter: PayableFilter): OtherChargesPayable[] {
  return payableRepo.find((p) => {
    if (filter.branches?.length && !filter.branches.includes(p.branch)) return false;
    if (filter.partyCode && p.partyCode !== filter.partyCode) return false;
    if (filter.payableType && p.payableType !== filter.payableType) return false;
    if (filter.mJobNo && p.mJobNo !== filter.mJobNo) return false;

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

export function finalizePayable(id: string): OtherChargesPayable | undefined {
  const p = payableRepo.get(id);
  if (!p) return undefined;
  return payableRepo.save({ ...p, status: { ...p.status, final: true } });
}
