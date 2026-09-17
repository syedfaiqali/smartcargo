import { AirImportJob } from '../domain/airImportJob';
import { Repository } from './repository';

export const airImportJobRepo = new Repository<AirImportJob>('airImportJobs');

let sequence = 100;

export function nextAirImportJobNo(branch: string): string {
  const existing = airImportJobRepo.find((j) => j.branch === branch);
  const maxSeq = existing.reduce((max, j) => {
    const seq = parseInt(j.jobNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, sequence);
  sequence = maxSeq + 1;
  return `${branch}-AI-${sequence}`;
}

export interface AirImportJobFilter {
  branches?: string[];
  partyCode?: string;
  foreignAgent?: string;
  origin?: string;
  destination?: string;
  mawbNo?: string;
  hawbNo?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'VOID' | 'UN_VOID' | 'CLOSED' | 'UN_CLOSED' | 'ALL';
}

export function searchAirImportJobs(filter: AirImportJobFilter): AirImportJob[] {
  return airImportJobRepo.find((j) => {
    if (filter.branches?.length && !filter.branches.includes(j.branch)) return false;
    if (filter.partyCode && j.partyCode !== filter.partyCode) return false;
    if (filter.foreignAgent && j.foreignAgent !== filter.foreignAgent) return false;
    if (filter.origin && j.origin !== filter.origin) return false;
    if (filter.destination && j.destination !== filter.destination) return false;
    if (filter.mawbNo && !j.mawbNo.toLowerCase().includes(filter.mawbNo.toLowerCase())) return false;
    if (filter.hawbNo && !j.hawbNo.toLowerCase().includes(filter.hawbNo.toLowerCase())) return false;

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

export function voidAirImportJob(id: string): AirImportJob | undefined {
  const j = airImportJobRepo.get(id);
  if (!j) return undefined;
  return airImportJobRepo.save({ ...j, status: { ...j.status, void: true } });
}

export function closeAirImportJob(id: string): AirImportJob | undefined {
  const j = airImportJobRepo.get(id);
  if (!j) return undefined;
  return airImportJobRepo.save({ ...j, status: { ...j.status, closed: true } });
}
