import { AirImportManifest } from '../domain/airImportManifest';
import { Repository } from './repository';

export const airImportManifestRepo = new Repository<AirImportManifest>('airImportManifest');

export interface AirImportManifestFilter {
  branches?: string[];
  foreignAgent?: string;
  origin?: string;
  destination?: string;
  mawbNo?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchAirImportManifests(filter: AirImportManifestFilter): AirImportManifest[] {
  return airImportManifestRepo.find((m) => {
    if (filter.branches?.length && !filter.branches.includes(m.branch)) return false;
    if (filter.foreignAgent && m.foreignAgent !== filter.foreignAgent) return false;
    if (filter.origin && m.origin !== filter.origin) return false;
    if (filter.destination && m.destination !== filter.destination) return false;
    if (filter.mawbNo && !m.mawbNo.toLowerCase().includes(filter.mawbNo.toLowerCase())) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (m.jobDate < filter.startDate || m.jobDate > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!m.status.final) return false;
        break;
      case 'UN_FINAL':
        if (m.status.final) return false;
        break;
      default:
        break;
    }
    return true;
  });
}
