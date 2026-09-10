import { SeaExportJob } from '../domain/seaExportJob';
import { Repository } from './repository';

export const seaExportJobRepo = new Repository<SeaExportJob>('seaExportJobs');

let sequence = 100;

export function nextSeaJobNo(branch: string): string {
  const existing = seaExportJobRepo.find((j) => j.branch === branch);
  const maxSeq = existing.reduce((max, j) => {
    const seq = parseInt(j.jobNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, sequence);
  sequence = maxSeq + 1;
  return `${branch}-SEA-${sequence}`;
}

export interface SeaJobFilter {
  branches?: string[];
  partyCode?: string;
  commodity?: string;
  shippingLine?: string;
  sLineAgent?: string;
  spoCode?: string;
  origin?: string;
  destination?: string;
  lclFcl?: string;
  hblType?: string;
  nomination?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  consolNo?: string;
  bookingNo?: string;
  mblNo?: string;
  hblNo?: string;
  sbNo?: string;
  containerNo?: string;
  sealNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'POST' | 'UN_POSTED' | 'VOID' | 'UN_VOID' | 'CLOSED' | 'UN_CLOSED' | 'ALL';
}

export function searchSeaJobs(filter: SeaJobFilter): SeaExportJob[] {
  return seaExportJobRepo.find((j) => {
    if (filter.branches?.length && !filter.branches.includes(j.branch)) return false;
    if (filter.partyCode && j.partyCode !== filter.partyCode) return false;
    if (filter.commodity && j.commodity !== filter.commodity) return false;
    if (filter.shippingLine && j.shippingLine !== filter.shippingLine) return false;
    if (filter.sLineAgent && j.sLineAgent !== filter.sLineAgent) return false;
    if (filter.spoCode && j.spoCode !== filter.spoCode) return false;
    if (filter.origin && j.portOfLoad !== filter.origin) return false;
    if (filter.destination && j.destination !== filter.destination) return false;
    if (filter.lclFcl && j.lclFcl !== filter.lclFcl) return false;
    if (filter.hblType && j.hblType !== filter.hblType) return false;
    if (filter.nomination && j.nomination !== filter.nomination) return false;
    if (filter.consolNo && j.consolNo !== filter.consolNo) return false;
    if (filter.bookingNo && j.bookingNo !== filter.bookingNo) return false;
    if (filter.mblNo && j.mblNo !== filter.mblNo) return false;
    if (filter.hblNo && j.hblNo !== filter.hblNo) return false;
    if (filter.sbNo && j.sbNo !== filter.sbNo) return false;
    if (filter.containerNo && !j.containers.some((c) => c.containerNo === filter.containerNo)) return false;
    if (filter.sealNo && !j.containers.some((c) => c.sealNo === filter.sealNo)) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (j.date < filter.startDate || j.date > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!j.status.final) return false;
        break;
      case 'UN_FINAL':
        if (j.status.final) return false;
        break;
      case 'POST':
        if (!j.status.posted) return false;
        break;
      case 'UN_POSTED':
        if (j.status.posted) return false;
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

export function finalizeSeaJob(id: string): SeaExportJob | undefined {
  const j = seaExportJobRepo.get(id);
  if (!j) return undefined;
  return seaExportJobRepo.save({ ...j, status: { ...j.status, final: true } });
}

export function voidSeaJob(id: string): SeaExportJob | undefined {
  const j = seaExportJobRepo.get(id);
  if (!j) return undefined;
  return seaExportJobRepo.save({ ...j, status: { ...j.status, void: true } });
}

export function closeSeaJob(id: string): SeaExportJob | undefined {
  const j = seaExportJobRepo.get(id);
  if (!j) return undefined;
  return seaExportJobRepo.save({ ...j, status: { ...j.status, closed: true } });
}

/** 12.7 Consol tab — jobs eligible to be attached to a consolidation, filtered by date/consol-marked state. */
export function findConsolCandidateJobs(input: { branch: string; startDate?: string; endDate?: string; marked: 'Y' | 'N' | 'BOTH' }): SeaExportJob[] {
  return seaExportJobRepo.find((j) => {
    if (j.branch !== input.branch) return false;
    if (j.status.void) return false;
    if (input.marked !== 'BOTH' && j.consolYN !== input.marked) return false;
    if (input.startDate && input.endDate) {
      if (j.date < input.startDate || j.date > input.endDate) return false;
    }
    return true;
  });
}
