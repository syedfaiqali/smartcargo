import { SeaImportManifest } from '../domain/seaImportManifest';
import { Repository } from './repository';
import { createEmptySeaImportManifest } from '../domain/seaImportManifestFactory';

export const seaImportManifestRepo = new Repository<SeaImportManifest>('seaImportManifest');

/** Adds one sample only while the Sea-Import manifest list is empty. */
export function ensureSeaImportManifestDemo(): void {
  if (seaImportManifestRepo.list().length) return;
  const demo = createEmptySeaImportManifest('KHI');
  demo.consoleJobNo = 'KHI-SIM-101'; demo.jobDate = '2026-09-18'; demo.mblNo = 'MBL-8890021';
  demo.pcs = 120; demo.cbm = 28.5; demo.grossWeight = 18000; demo.netWeight = 17500;
  demo.destination = 'KHI'; demo.portOfLoading = 'DXB';
  demo.hblLines = [{ id: 'demo-hbl-1', jobNo: 'KHI-SI-101', partyCode: 'P-1003', partyName: 'Gulf Cargo Partners', hblNo: 'HBL-456789', containerNos: 'TCLU1234567', ppCc: 'PP', pcs: 120, uom: 'PCS', cbm: 28.5, grossWeight: 18000, netWeight: 17500, indexNo: '1', subIndexNo: '1' }];
  seaImportManifestRepo.save(demo);
}

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
