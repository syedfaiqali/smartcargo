import { SeaLocalInvoice } from '../domain/seaLocalInvoice';
import { Repository } from './repository';
import { seaExportJobRepo } from './seaExportJobService';
import { createEmptySeaLocalInvoice } from '../domain/seaLocalInvoiceFactory';

export const seaLocalInvoiceRepo = new Repository<SeaLocalInvoice>('seaLocalInvoice');

export function ensureSeaLocalInvoiceDemo(): void {
  if (seaLocalInvoiceRepo.list().length) return;
  const demo = createEmptySeaLocalInvoice('KHI');
  demo.invoiceNo = 'KHI-SLI-101'; demo.date = '2026-09-17'; demo.jobNo = 'KHI-SEA-101'; demo.type = 'EXPORT';
  demo.partyCode = 'P-1003'; demo.partyName = 'Sindh Rice Exporters'; demo.consignee = 'Gulf Cargo Partners';
  demo.portOfLoad = 'PKKHI'; demo.destination = 'AEJEA'; demo.lclFcl = 'FCL'; demo.pkgs = 120; demo.weightGrs = 18000;
  demo.mblNo = 'MBL-8890021'; demo.invoiceTotalPkr = 405496; demo.status = { final: false, posted: false, void: false };
  seaLocalInvoiceRepo.save(demo);
}

let invoiceSequence = 100;

export function nextSeaInvoiceNo(branch: string): string {
  const existing = seaLocalInvoiceRepo.find((i) => i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.invoiceNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, invoiceSequence);
  invoiceSequence = maxSeq + 1;
  return `${branch}-SLI-${invoiceSequence}`;
}

/** Pulls MBL/HBL/Port of Load/Destination/LCL-FCL/CBM from a selected Sea-Export Job No. */
export function lookupSeaJobForInvoice(jobNo: string) {
  const job = seaExportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.date).getFullYear(),
    mblNo: job.mblNo,
    hblNo: job.hblNo,
    portOfLoad: job.portOfLoad,
    destination: job.destination,
    lclFcl: job.lclFcl,
    cbm: job.cbm,
    grossWeight: job.grossWeight,
    netWeight: job.netWeight,
    volWeight: job.volWeight,
    partyCode: job.partyCode,
    partyName: job.partyName,
    spoCode: job.spoCode,
    job,
  };
}

export interface SeaInvoiceFilter {
  branches?: string[];
  partyCode?: string;
  destination?: string;
  lclFcl?: string;
  consignee?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  startingInvoiceNo?: string;
  endingInvoiceNo?: string;
  startingJobNo?: string;
  endingJobNo?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'POST' | 'UN_POSTED' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchSeaInvoices(filter: SeaInvoiceFilter): SeaLocalInvoice[] {
  return seaLocalInvoiceRepo.find((inv) => {
    if (filter.branches?.length && !filter.branches.includes(inv.branch)) return false;
    if (filter.partyCode && inv.partyCode !== filter.partyCode) return false;
    if (filter.destination && inv.destination !== filter.destination) return false;
    if (filter.lclFcl && inv.lclFcl !== filter.lclFcl) return false;
    if (filter.consignee && !inv.consignee.toLowerCase().includes(filter.consignee.toLowerCase())) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (inv.date < filter.startDate || inv.date > filter.endDate) return false;
    }
    if (filter.startingInvoiceNo && inv.invoiceNo < filter.startingInvoiceNo) return false;
    if (filter.endingInvoiceNo && inv.invoiceNo > filter.endingInvoiceNo) return false;
    if (filter.startingJobNo && inv.jobNo < filter.startingJobNo) return false;
    if (filter.endingJobNo && inv.jobNo > filter.endingJobNo) return false;

    switch (filter.status) {
      case 'FINAL':
        if (!inv.status.final) return false;
        break;
      case 'UN_FINAL':
        if (inv.status.final) return false;
        break;
      case 'POST':
        if (!inv.status.posted) return false;
        break;
      case 'UN_POSTED':
        if (inv.status.posted) return false;
        break;
      case 'VOID':
        if (!inv.status.void) return false;
        break;
      case 'UN_VOID':
        if (inv.status.void) return false;
        break;
      default:
        break;
    }
    return true;
  });
}

export function finalizeSeaInvoice(id: string): SeaLocalInvoice | undefined {
  const inv = seaLocalInvoiceRepo.get(id);
  if (!inv) return undefined;
  return seaLocalInvoiceRepo.save({ ...inv, status: { ...inv.status, final: true } });
}

export function voidSeaInvoice(id: string): SeaLocalInvoice | undefined {
  const inv = seaLocalInvoiceRepo.get(id);
  if (!inv) return undefined;
  return seaLocalInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
