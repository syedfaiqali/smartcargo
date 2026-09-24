import { ForeignAgentInvoice, ForeignAgentInvoiceVariant } from '../domain/foreignAgentInvoice';
import { CreditNoteRef, LinkedInvoiceRef } from '../domain/job';
import { Repository } from './repository';
import { jobRepo } from './jobService';
import { getLocalInvoiceLinksForJob } from './localInvoiceService';
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

export interface ForeignAgentInvoiceLink extends LinkedInvoiceRef {
  invoiceId: string;
  variant: 'INVOICE_TO' | 'INVOICE_RECEIVED';
}

/** Returns foreign-agent invoice rows displayed on the related MAWB job. */
export function getForeignAgentInvoiceLinksForJob(jobNo: string): ForeignAgentInvoiceLink[] {
  return foreignAgentInvoiceRepo
    .find((invoice) =>
      (invoice.variant === 'INVOICE_TO' || invoice.variant === 'INVOICE_RECEIVED')
      && invoice.mawbJobNo === jobNo,
    )
    .map((invoice) => {
      const variant = invoice.variant === 'INVOICE_TO' ? 'INVOICE_TO' : 'INVOICE_RECEIVED';
      return {
        invoiceId: invoice.id,
        variant,
        no: invoice.documentNo,
        date: invoice.documentDate,
        year: invoice.mawbJobYear,
        type: variant === 'INVOICE_TO' ? 'AE-FAG-INV' : 'AE-FAG-DRN',
        name: invoice.fAgentName,
        curr: invoice.currencyCode,
        fAmount: invoice.totalSelling,
        pkrAmount: invoice.totalInvoiceAmount,
        final: invoice.status.final,
      };
    });
}

/** Rebuilds the MAWB Local/International Invoices grid after an agent invoice changes. */
export function syncForeignAgentInvoiceLinks(invoice: ForeignAgentInvoice, previous?: ForeignAgentInvoice): void {
  const jobNos = new Set([invoice.mawbJobNo, previous?.mawbJobNo ?? ''].filter(Boolean));
  jobNos.forEach((jobNo) => {
    const job = jobRepo.find((item) => item.kind === 'MAWB' && item.jobNo === jobNo)[0];
    if (!job) return;
    jobRepo.save({
      ...job,
      linkedInvoices: [...getLocalInvoiceLinksForJob(jobNo), ...getForeignAgentInvoiceLinksForJob(jobNo)],
    });
  });
}

/** Returns the C/N rows displayed on the related MAWB job. */
export function getCreditNoteLinksForJob(jobNo: string): CreditNoteRef[] {
  return foreignAgentInvoiceRepo
    .find((invoice) =>
      (invoice.variant === 'CREDIT_NOTE_TO' || invoice.variant === 'CREDIT_NOTE_RECEIVED')
      && invoice.mawbJobNo === jobNo,
    )
    .flatMap((invoice) => {
      const allocations = invoice.allocationLines.length
        ? invoice.allocationLines
        : [{ hawbNo: '' }];

      return allocations.map((allocation) => ({
        invoiceId: invoice.id,
        variant: invoice.variant === 'CREDIT_NOTE_TO' ? 'CREDIT_NOTE_TO' : 'CREDIT_NOTE_RECEIVED',
        hawbNo: allocation.hawbNo,
        runNo: invoice.runNo,
        cnNo: invoice.documentNo,
        manualCn: false,
      }));
    });
}

/**
 * Rebuilds the C/N Details grid for the MAWB referenced by a foreign-agent
 * credit note. This mirrors the Local Invoice and HAWB linkage behaviour.
 */
export function syncCreditNoteLinks(invoice: ForeignAgentInvoice, previous?: ForeignAgentInvoice): void {
  const jobNos = new Set([
    invoice.mawbJobNo,
    previous?.mawbJobNo ?? '',
  ].filter(Boolean));

  jobNos.forEach((jobNo) => {
    const job = jobRepo.find((item) => item.kind === 'MAWB' && item.jobNo === jobNo)[0];
    if (!job) return;
    jobRepo.save({ ...job, creditNoteDetails: getCreditNoteLinksForJob(jobNo) });
  });
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
