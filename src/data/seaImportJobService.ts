import { SeaImportJob } from '../domain/seaImportJob';
import { Repository } from './repository';

export const seaImportJobRepo = new Repository<SeaImportJob>('seaImportJobs');

let sequence = 100;

export function nextSeaImportJobNo(branch: string): string {
  const existing = seaImportJobRepo.find((j) => j.branch === branch);
  const maxSeq = existing.reduce((max, j) => {
    const seq = parseInt(j.jobNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, sequence);
  sequence = maxSeq + 1;
  return `${branch}-SI-${sequence}`;
}

export interface SeaImportJobFilter {
  branches?: string[];
  partyCode?: string;
  foreignAgent?: string;
  shippingLine?: string;
  origin?: string;
  destination?: string;
  mblNo?: string;
  hblNo?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'VOID' | 'UN_VOID' | 'CLOSED' | 'UN_CLOSED' | 'ALL';
}

export function searchSeaImportJobs(filter: SeaImportJobFilter): SeaImportJob[] {
  return seaImportJobRepo.find((j) => {
    if (filter.branches?.length && !filter.branches.includes(j.branch)) return false;
    if (filter.partyCode && j.partyCode !== filter.partyCode) return false;
    if (filter.foreignAgent && j.foreignAgent !== filter.foreignAgent) return false;
    if (filter.shippingLine && j.shippingLine !== filter.shippingLine) return false;
    if (filter.origin && j.origin !== filter.origin) return false;
    if (filter.destination && j.destination !== filter.destination) return false;
    if (filter.mblNo && !j.mblNo.toLowerCase().includes(filter.mblNo.toLowerCase())) return false;
    if (filter.hblNo && !j.hblNo.toLowerCase().includes(filter.hblNo.toLowerCase())) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (j.jobDate < filter.startDate || j.jobDate > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!j.status.final) return false;
        break;
      case 'UN_FINAL':
        if (j.status.final) return false;
        break;
      case 'VOID':
        if (!j.status.void) return false;
        break;
      case 'UN_VOID':
        if (j.status.void) return false;
        break;
      case 'CLOSED':
        if (!j.status.closed) return false;
        break;
      case 'UN_CLOSED':
        if (j.status.closed) return false;
        break;
      default:
        break;
    }
    return true;
  });
}

export function voidSeaImportJob(id: string): SeaImportJob | undefined {
  const j = seaImportJobRepo.get(id);
  if (!j) return undefined;
  return seaImportJobRepo.save({ ...j, status: { ...j.status, void: true } });
}

export function closeSeaImportJob(id: string): SeaImportJob | undefined {
  const j = seaImportJobRepo.get(id);
  if (!j) return undefined;
  return seaImportJobRepo.save({ ...j, status: { ...j.status, closed: true } });
}
