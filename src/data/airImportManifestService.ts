import { AirImportManifest } from '../domain/airImportManifest';
import { Repository } from './repository';
import { createEmptyAirImportManifest } from '../domain/airImportManifestFactory';

export const airImportManifestRepo = new Repository<AirImportManifest>('airImportManifest');

/** Adds one visible sample only until a real Import-Air manifest is saved. */
export function ensureAirImportManifestDemo(): void {
  if (airImportManifestRepo.list().length) return;
  const demo = createEmptyAirImportManifest('KHI');
  demo.jobDate = '2026-09-17';
  demo.mawbNo = '176-98765432';
  demo.pcs = 42;
  demo.cbm = 3.25;
  demo.grossWeight = 480;
  demo.chargeWeight = 525;
  demo.origin = 'DXB';
  demo.destination = 'KHI';
  demo.hawbLines = [{ id: 'demo-hawb-1', jobNo: 'KHI-AIM-101', partyCode: 'P-1003', partyName: 'Gulf Cargo Partners', hawbNo: 'HAWB-456789', ppCc: 'PP', pcs: 42, uom: 'PCS', cbm: 3.25, grossWeight: 480, chargeWeight: 525, indexNo: '1', subIndexNo: '1' }];
  airImportManifestRepo.save(demo);
}

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
