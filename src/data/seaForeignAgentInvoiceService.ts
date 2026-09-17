import { SeaForeignAgentInvoice, SeaForeignAgentInvoiceVariant } from '../domain/seaForeignAgentInvoice';
import { Repository } from './repository';
import { seaExportJobRepo } from './seaExportJobService';
import { SEA_VARIANT_CONFIG } from '../features/seaForeignAgentInvoice/variantConfig';
import { createEmptySeaForeignAgentInvoice } from '../domain/seaForeignAgentInvoiceFactory';

export const seaForeignAgentInvoiceRepo = new Repository<SeaForeignAgentInvoice>('seaForeignAgentInvoices');

/** Adds one visual sample only when this document type has no saved records yet. */
export function ensureSeaAgentInvoiceDemo(variant: SeaForeignAgentInvoiceVariant): void {
  if (seaForeignAgentInvoiceRepo.find((item) => item.variant === variant).length) return;
  const demo = createEmptySeaForeignAgentInvoice(variant, 'KHI');
  demo.documentNo = `KHI-${SEA_VARIANT_CONFIG[variant].numberingPrefix}-101`;
  demo.documentDate = '2026-09-17';
  demo.jobNo = 'KHI-SEA-101';
  demo.mblNo = 'MBL-8890021';
  demo.fAgentCode = 'FA-201';
  demo.fAgentName = 'Gulf Cargo Partners LLC';
  demo.origin = 'PKKHI';
  demo.destination = 'AEJEA';
  demo.currencyCode = 'USD';
  demo.totalSelling = 1600;
  demo.totalInvoiceAmount = 1650000;
  seaForeignAgentInvoiceRepo.save(demo);
}

let sequence = 100;

export function nextSeaDocumentNo(variant: SeaForeignAgentInvoiceVariant, branch: string): string {
  const prefix = SEA_VARIANT_CONFIG[variant].numberingPrefix;
  const existing = seaForeignAgentInvoiceRepo.find((i) => i.variant === variant && i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.documentNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, sequence);
  sequence = maxSeq + 1;
  return `${branch}-${prefix}-${sequence}`;
}

/** Pulls MBL No./Date/CBM/Vessel/Voyage from a selected Sea-Export Job No. */
export function lookupSeaJobForAgentInvoice(jobNo: string) {
  const job = seaExportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    consolNo: job.consolNo,
    jobYear: new Date(job.date).getFullYear(),
    mblNo: job.mblNo,
    mblDate: job.mblDate,
    lclFcl: job.lclFcl,
    grossWeight: job.grossWeight,
    netWeight: job.netWeight,
    cbm: job.cbm,
    vessel: job.vessel,
    voyage: job.voyage,
    portOfLoad: job.portOfLoad,
    destination: job.destination,
    job,
  };
}

export function getJobsForConsolAgentInvoice(consolNo: string) {
  return seaExportJobRepo.find((j) => j.consolNo === consolNo);
}

export interface SeaAgentInvoiceFilter {
  variant: SeaForeignAgentInvoiceVariant;
  branches?: string[];
  fAgentCode?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'POSTED' | 'UN_POSTED' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchSeaAgentInvoices(filter: SeaAgentInvoiceFilter): SeaForeignAgentInvoice[] {
  return seaForeignAgentInvoiceRepo.find((inv) => {
    if (inv.variant !== filter.variant) return false;
    if (filter.branches?.length && !filter.branches.includes(inv.branch)) return false;
    if (filter.fAgentCode && inv.fAgentCode !== filter.fAgentCode) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (inv.documentDate < filter.startDate || inv.documentDate > filter.endDate) return false;
    }

    switch (filter.status) {
      case 'FINAL':
        if (!inv.status.final) return false;
        break;
      case 'UN_FINAL':
        if (inv.status.final) return false;
        break;
      case 'POSTED':
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

export function finalizeSeaAgentInvoice(id: string): SeaForeignAgentInvoice | undefined {
  const inv = seaForeignAgentInvoiceRepo.get(id);
  if (!inv) return undefined;
  return seaForeignAgentInvoiceRepo.save({ ...inv, status: { ...inv.status, final: true } });
}

export function finalizeMultipleSeaAgentInvoices(ids: string[]): SeaForeignAgentInvoice[] {
  return ids.map((id) => finalizeSeaAgentInvoice(id)).filter((i): i is SeaForeignAgentInvoice => !!i);
}

export function voidSeaAgentInvoice(id: string): SeaForeignAgentInvoice | undefined {
  const inv = seaForeignAgentInvoiceRepo.get(id);
  if (!inv) return undefined;
  return seaForeignAgentInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
