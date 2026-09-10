import { ForeignAgentInvoice, ForeignAgentInvoiceVariant } from '../domain/foreignAgentInvoice';
import { Repository } from './repository';
import { jobRepo } from './jobService';
import { VARIANT_CONFIG } from '../features/foreignAgentInvoice/variantConfig';

export const foreignAgentInvoiceRepo = new Repository<ForeignAgentInvoice>('foreignAgentInvoices');

let sequence = 100;

export function nextDocumentNo(variant: ForeignAgentInvoiceVariant, branch: string): string {
  const prefix = VARIANT_CONFIG[variant].numberingPrefix;
  const existing = foreignAgentInvoiceRepo.find((i) => i.variant === variant && i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.documentNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, sequence);
  sequence = maxSeq + 1;
  return `${branch}-${prefix}-${sequence}`;
}

/** Pulls MAWB No./Date (docs 6.2) from a selected Master Job No. */
export function lookupMasterJobForAgentInvoice(jobNo: string) {
  const job = jobRepo.find((j) => j.kind === 'MAWB' && j.jobNo === jobNo)[0];
  if (!job) return null;
  return { mawbNo: job.mawbNo, mawbDate: job.awbDate, jobYear: new Date(job.jobDate).getFullYear(), job };
}

export function getHouseJobsForMasterInvoice(masterJobNo: string) {
  return jobRepo.find((j) => j.kind === 'HAWB' && j.parentJobNo === masterJobNo);
}

export interface AgentInvoiceFilter {
  variant: ForeignAgentInvoiceVariant;
  branches?: string[];
  fAgentCode?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'POSTED' | 'UN_POSTED' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchAgentInvoices(filter: AgentInvoiceFilter): ForeignAgentInvoice[] {
  return foreignAgentInvoiceRepo.find((inv) => {
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

export function finalizeAgentInvoice(id: string): ForeignAgentInvoice | undefined {
  const inv = foreignAgentInvoiceRepo.get(id);
  if (!inv) return undefined;
  return foreignAgentInvoiceRepo.save({ ...inv, status: { ...inv.status, final: true } });
}

export function finalizeMultipleAgentInvoices(ids: string[]): ForeignAgentInvoice[] {
  return ids.map((id) => finalizeAgentInvoice(id)).filter((i): i is ForeignAgentInvoice => !!i);
}

export function voidAgentInvoice(id: string): ForeignAgentInvoice | undefined {
  const inv = foreignAgentInvoiceRepo.get(id);
  if (!inv) return undefined;
  return foreignAgentInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
