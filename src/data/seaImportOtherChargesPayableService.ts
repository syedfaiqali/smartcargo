import { SeaImportOtherChargesPayable } from '../domain/seaImportOtherChargesPayable';
import { Repository } from './repository';
import { seaImportJobRepo } from './seaImportJobService';

export const seaImportPayableRepo = new Repository<SeaImportOtherChargesPayable>('seaImportOtherChargesPayable');

let payableSequence = 100;

export function nextSeaImportCreditNoteNo(branch: string): string {
  const existing = seaImportPayableRepo.find((p) => p.branch === branch);
  const maxSeq = existing.reduce((max, p) => {
    const seq = parseInt(p.creditNoteNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, payableSequence);
  payableSequence = maxSeq + 1;
  return `${branch}-SICP-${payableSequence}`;
}

/** Pulls CBM/Job Year from a selected Console Job No. */
export function lookupSeaImportConsoleJob(consoleJobNo: string) {
  const job = seaImportJobRepo.find((j) => j.consoleJob === consoleJobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    cbm: job.mblCbm,
    grossWeight: job.mblGrossWeight,
    job,
  };
}

/** Jobs attached to a Console Job No., for the allocation grid's Job No. picker. */
export function getJobsForSeaImportConsole(consoleJobNo: string) {
  return seaImportJobRepo.find((j) => j.consoleJob === consoleJobNo);
}

export interface SeaImportPayableFilter {
  branches?: string[];
  partyCode?: string;
  payableType?: string;
  consoleJobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaImportPayables(filter: SeaImportPayableFilter): SeaImportOtherChargesPayable[] {
  return seaImportPayableRepo.find((p) => {
    if (filter.branches?.length && !filter.branches.includes(p.branch)) return false;
    if (filter.partyCode && p.partyCode !== filter.partyCode) return false;
    if (filter.payableType && p.payableType !== filter.payableType) return false;
    if (filter.consoleJobNo && p.consoleJobNo !== filter.consoleJobNo) return false;

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
