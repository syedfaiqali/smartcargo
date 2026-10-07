import { LocalInvoice } from '../domain/localInvoice';
import { Repository } from './repository';
import { jobRepo } from './jobService';

export const localInvoiceRepo = new Repository<LocalInvoice>('localInvoices');

/** Returns the invoice rows displayed under a Job's Local/International Invoices panel. */
export function getLocalInvoiceLinksForJob(jobNo: string) {
  return localInvoiceRepo
    .list()
    .filter((item) => item.master.jobNo === jobNo || item.house.jobNo === jobNo)
    .map((item) => ({
      invoiceId: item.id,
      no: item.invoiceNo,
      date: item.invoiceDate,
      year: item.jobYear,
      type: 'AE-LOC-INV',
      name: item.partyName,
      curr: item.currency1,
      fAmount: item.totalFreight,
      pkrAmount: item.invoiceTotal,
      final: item.status.final,
    }));
}

/**
 * Rebuilds the Local/International Invoices grid on jobs related to a Local
 * Invoice. Rebuilding from saved invoices prevents stale rows after invoice
 * edits, job reassignment, voiding, or deletion.
 */
export function syncLocalInvoiceLinks(invoice: LocalInvoice, previous?: LocalInvoice): void {
  const jobNos = new Set([
    invoice.master.jobNo,
    invoice.house.jobNo,
    previous?.master.jobNo ?? '',
    previous?.house.jobNo ?? '',
  ].filter(Boolean));

  jobNos.forEach((jobNo) => {
    const job = jobRepo.find((item) => item.jobNo === jobNo)[0];
    if (!job) return;

    jobRepo.save({ ...job, linkedInvoices: getLocalInvoiceLinksForJob(jobNo) });
  });
}

/**
 * Previews the next available invoice number from persisted invoices.
 * A draft is not a saved invoice, so clicking New repeatedly must not consume
 * a number. The number advances only after the invoice has been saved.
 */
export function nextInvoiceNo(branch: string): string {
  const existing = localInvoiceRepo.find((i) => i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.invoiceNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 100);
  return `${branch}-INV-${maxSeq + 1}`;
}

/** Pulls the HOUSE/MASTER job-reference panel (docs 4.2) from a selected Job No. */
export function lookupJobRef(jobNo: string) {
  const job = jobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobNo: job.jobNo,
    jobDate: job.jobDate,
    awbNo: job.kind === 'MAWB' ? job.mawbNo : job.hawbNo ?? '',
    awbDate: job.awbDate,
    pp: '',
    refNo: '',
    job,
  };
}

export interface LocalInvoiceFilter {
  branches?: string[];
  partyCode?: string;
  airportOfDeparture?: string;
  destination?: string;
  consignee?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'POSTED' | 'UN_POSTED' | 'VOID' | 'UN_VOID' | 'ALL';
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  startInvoiceNo?: string;
  endInvoiceNo?: string;
  mawbJobNo?: string;
  mawbNo?: string;
  hawbJobNo?: string;
  hawbNo?: string;
}

export function searchLocalInvoices(filter: LocalInvoiceFilter): LocalInvoice[] {
  return localInvoiceRepo.find((inv) => {
    if (filter.branches?.length && !filter.branches.includes(inv.branch)) return false;
    if (filter.partyCode && inv.partyCode !== filter.partyCode) return false;
    if (filter.airportOfDeparture && inv.airportOfDeparture !== filter.airportOfDeparture) return false;
    if (filter.destination && inv.destination !== filter.destination) return false;
    if (filter.consignee && !inv.consignee.toLowerCase().includes(filter.consignee.toLowerCase())) return false;
    if (filter.startInvoiceNo && inv.invoiceNo < filter.startInvoiceNo) return false;
    if (filter.endInvoiceNo && inv.invoiceNo > filter.endInvoiceNo) return false;
    if (filter.mawbJobNo && inv.master.jobNo !== filter.mawbJobNo) return false;
    if (filter.mawbNo && inv.master.awbNo !== filter.mawbNo) return false;
    if (filter.hawbJobNo && inv.house.jobNo !== filter.hawbJobNo) return false;
    if (filter.hawbNo && inv.house.awbNo !== filter.hawbNo) return false;

    if (filter.checkDate && filter.startDate && filter.endDate) {
      if (inv.invoiceDate < filter.startDate || inv.invoiceDate > filter.endDate) return false;
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

export function finalizeLocalInvoice(id: string): LocalInvoice | undefined {
  const inv = localInvoiceRepo.get(id);
  if (!inv) return undefined;
  return localInvoiceRepo.save({ ...inv, status: { ...inv.status, final: true } });
}

export function finalizeMultipleLocalInvoices(ids: string[]): LocalInvoice[] {
  return ids.map((id) => finalizeLocalInvoice(id)).filter((i): i is LocalInvoice => !!i);
}

export function voidLocalInvoice(id: string): LocalInvoice | undefined {
  const inv = localInvoiceRepo.get(id);
  if (!inv) return undefined;
  return localInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
