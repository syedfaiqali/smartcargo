import { SeaImportJob } from '../domain/seaImportJob';
import { Repository } from './repository';
import { createEmptySeaImportJob } from '../domain/seaImportJobFactory';

export const seaImportJobRepo = new Repository<SeaImportJob>('seaImportJobs');

/** Adds one sample only while the Sea-Import Inbond job list is empty. */
export function ensureSeaImportJobDemo(): void {
  if (seaImportJobRepo.list().length) return;
  const demo = createEmptySeaImportJob('KHI');
  demo.jobNo = 'KHI-SI-101'; demo.jobDate = '2026-09-18'; demo.mblNo = 'MBL-8890021'; demo.hblNo = 'HBL-456789';
  demo.partyCode = 'P-1003'; demo.partyName = 'Gulf Cargo Partners'; demo.spoCode = 'SPO-01';
  demo.hblPcs = 120; demo.hblNetWeight = 17500; demo.mblPcs = 120; demo.mblNetWeight = 17500;
  demo.beNo = 'BE-7788'; demo.beDate = '2026-09-17'; demo.destination = 'KHI'; demo.origin = 'DXB';
  demo.containers = [{ id: 'demo-container-1', containerNo: 'TCLU1234567', size: "40HC", sealNo: 'SL-1234', isoCode: '', pkgs: 120, weight: 17500, netWeight: 17000, croFreeDate: '', detentionDays: 0, detentionAmount: 0, emptyLocation: '' }];
  seaImportJobRepo.save(demo);
}

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
