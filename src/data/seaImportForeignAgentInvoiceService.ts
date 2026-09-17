import { SeaImportForeignAgentInvoice, SeaImportForeignAgentInvoiceVariant } from '../domain/seaImportForeignAgentInvoice';
import { Repository } from './repository';
import { seaImportJobRepo } from './seaImportJobService';
import { SEA_IMPORT_VARIANT_CONFIG } from '../features/seaImportForeignAgentInvoice/variantConfig';

export const seaImportAgentInvoiceRepo = new Repository<SeaImportForeignAgentInvoice>('seaImportForeignAgentInvoices');

let sequence = 100;

export function nextSeaImportAgentDocumentNo(variant: SeaImportForeignAgentInvoiceVariant, branch: string): string {
  const prefix = SEA_IMPORT_VARIANT_CONFIG[variant].numberingPrefix;
  const existing = seaImportAgentInvoiceRepo.find((i) => i.variant === variant && i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.documentNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, sequence);
  sequence = maxSeq + 1;
  return `${branch}-${prefix}-${sequence}`;
}

/** Pulls B/L No./Party/Route from a selected Sea-Import Job No. */
export function lookupSeaImportJobForAgentInvoice(jobNo: string) {
  const job = seaImportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    blNo: job.mblNo,
    foreignAgent: job.foreignAgent,
    commodity: job.commodity,
    origin: job.origin,
    destination: job.destination,
    job,
  };
}

export interface SeaImportAgentInvoiceFilter {
  variant: SeaImportForeignAgentInvoiceVariant;
  branches?: string[];
  fAgentCode?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchSeaImportAgentInvoices(filter: SeaImportAgentInvoiceFilter): SeaImportForeignAgentInvoice[] {
  return seaImportAgentInvoiceRepo.find((inv) => {
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

export function voidSeaImportAgentInvoice(id: string): SeaImportForeignAgentInvoice | undefined {
  const inv = seaImportAgentInvoiceRepo.get(id);
  if (!inv) return undefined;
  return seaImportAgentInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
