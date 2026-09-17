import { SeaImportManifest } from '../domain/seaImportManifest';
import { Repository } from './repository';

export const seaImportManifestRepo = new Repository<SeaImportManifest>('seaImportManifest');

export interface SeaImportManifestFilter {
  branches?: string[];
  foreignAgent?: string;
  shippingLine?: string;
  destination?: string;
  mblNo?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'ALL';
}

export function searchSeaImportManifests(filter: SeaImportManifestFilter): SeaImportManifest[] {
  return seaImportManifestRepo.find((m) => {
    if (filter.branches?.length && !filter.branches.includes(m.branch)) return false;
    if (filter.foreignAgent && m.foreignAgent !== filter.foreignAgent) return false;
    if (filter.shippingLine && m.shippingLine !== filter.shippingLine) return false;
    if (filter.destination && m.destination !== filter.destination) return false;
    if (filter.mblNo && !m.mblNo.toLowerCase().includes(filter.mblNo.toLowerCase())) return false;

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
