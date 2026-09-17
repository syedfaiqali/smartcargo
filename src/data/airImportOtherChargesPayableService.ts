import { AirImportOtherChargesPayable } from '../domain/airImportOtherChargesPayable';
import { Repository } from './repository';
import { airImportJobRepo } from './airImportJobService';

export const airImportPayableRepo = new Repository<AirImportOtherChargesPayable>('airImportOtherChargesPayable');

let payableSequence = 100;

export function nextAirImportCreditNoteNo(branch: string): string {
  const existing = airImportPayableRepo.find((p) => p.branch === branch);
  const maxSeq = existing.reduce((max, p) => {
    const seq = parseInt(p.creditNoteNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, payableSequence);
  payableSequence = maxSeq + 1;
  return `${branch}-AICP-${payableSequence}`;
}

/** Pulls Gross Weight/Charge Weight and MAWB No. from a selected M/Job No. */
export function lookupAirImportMasterJob(jobNo: string) {
  const job = airImportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    mawbNo: job.mawbNo,
    jobYear: new Date(job.jobDate).getFullYear(),
    grossWeight: job.mawbGrossWeight,
    chargeWeight: job.mawbChargeWeight,
    job,
  };
}

/** House shipments attached under a Master, for the allocation grid's Job No./HAWB No. picker. */
export function getHouseJobsForAirImportMaster(masterJobNo: string) {
  const master = airImportJobRepo.find((j) => j.jobNo === masterJobNo)[0];
  return master?.houseAirwayBills ?? [];
}

export interface AirImportPayableFilter {
  branches?: string[];
  partyCode?: string;
  payableType?: string;
  mJobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchAirImportPayables(filter: AirImportPayableFilter): AirImportOtherChargesPayable[] {
  return airImportPayableRepo.find((p) => {
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

export function finalizeAirImportPayable(id: string): AirImportOtherChargesPayable | undefined {
  const p = airImportPayableRepo.get(id);
  if (!p) return undefined;
  return airImportPayableRepo.save({ ...p, status: { ...p.status, final: true } });
}
