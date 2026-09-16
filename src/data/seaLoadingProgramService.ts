import { SeaLoadingProgram } from '../domain/seaLoadingProgram';
import { Repository } from './repository';

export const seaLoadingProgramRepo = new Repository<SeaLoadingProgram>('seaLoadingProgram');

let loadProgramSequence = 100;

export function nextLoadProgramNo(branch: string): string {
  const existing = seaLoadingProgramRepo.find((p) => p.branch === branch);
  const maxSeq = existing.reduce((max, p) => {
    const seq = parseInt(p.loadProgramNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, loadProgramSequence);
  loadProgramSequence = maxSeq + 1;
  return `${branch}-LP-${loadProgramSequence}`;
}

export interface LoadingProgramFilter {
  branches?: string[];
  partyCode?: string;
  shippingLine?: string;
  destination?: string;
  lclFcl?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchLoadingPrograms(filter: LoadingProgramFilter): SeaLoadingProgram[] {
  return seaLoadingProgramRepo.find((p) => {
    if (filter.branches?.length && !filter.branches.includes(p.branch)) return false;
    if (filter.partyCode && p.partyCode !== filter.partyCode) return false;
    if (filter.shippingLine && p.shippingLine !== filter.shippingLine) return false;
    if (filter.destination && p.destination !== filter.destination) return false;
    if (filter.lclFcl && p.lclFcl !== filter.lclFcl) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (p.date < filter.startDate || p.date > filter.endDate) return false;
    }

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
