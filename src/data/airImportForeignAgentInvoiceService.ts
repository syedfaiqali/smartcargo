import { AirImportForeignAgentInvoice, AirImportForeignAgentInvoiceVariant } from '../domain/airImportForeignAgentInvoice';
import { Repository } from './repository';
import { airImportJobRepo } from './airImportJobService';
import { AIR_IMPORT_VARIANT_CONFIG } from '../features/airImportForeignAgentInvoice/variantConfig';

export const airImportAgentInvoiceRepo = new Repository<AirImportForeignAgentInvoice>('airImportForeignAgentInvoices');

let sequence = 100;

export function nextAirImportAgentDocumentNo(variant: AirImportForeignAgentInvoiceVariant, branch: string): string {
  const prefix = AIR_IMPORT_VARIANT_CONFIG[variant].numberingPrefix;
  const existing = airImportAgentInvoiceRepo.find((i) => i.variant === variant && i.branch === branch);
  const maxSeq = existing.reduce((max, i) => {
    const seq = parseInt(i.documentNo.split('-').pop() ?? '', 10);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, sequence);
  sequence = maxSeq + 1;
  return `${branch}-${prefix}-${sequence}`;
}

/** Pulls MAWB No./Date/Party/Route from a selected Air-Import Job No. */
export function lookupAirImportJobForAgentInvoice(jobNo: string) {
  const job = airImportJobRepo.find((j) => j.jobNo === jobNo)[0];
  if (!job) return null;
  return {
    jobYear: new Date(job.jobDate).getFullYear(),
    mawbNo: job.mawbNo,
    mawbDate: job.mawbDate,
    foreignAgent: job.foreignAgent,
    commodity: job.commodity,
    origin: job.origin,
    destination: job.destination,
    grossWeight: job.mawbGrossWeight,
    chargeableWeight: job.mawbChargeWeight,
    job,
  };
}

export interface AirImportAgentInvoiceFilter {
  variant: AirImportForeignAgentInvoiceVariant;
  branches?: string[];
  fAgentCode?: string;
  checkDate?: boolean;
  startDate?: string;
  endDate?: string;
  status?: 'FINAL' | 'UN_FINAL' | 'VOID' | 'UN_VOID' | 'ALL';
}

export function searchAirImportAgentInvoices(filter: AirImportAgentInvoiceFilter): AirImportForeignAgentInvoice[] {
  return airImportAgentInvoiceRepo.find((inv) => {
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

export function voidAirImportAgentInvoice(id: string): AirImportForeignAgentInvoice | undefined {
  const inv = airImportAgentInvoiceRepo.get(id);
  if (!inv) return undefined;
  return airImportAgentInvoiceRepo.save({ ...inv, status: { ...inv.status, void: true } });
}
