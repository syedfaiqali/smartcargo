import { ClearableSourceType, Voucher, VoucherKind } from '../domain/voucher';
import { Repository } from './repository';
import { jobRepo, syncHouseAwbsOnMaster } from './jobService';
import { localInvoiceRepo } from './localInvoiceService';
import { foreignAgentInvoiceRepo } from './foreignAgentInvoiceService';
import { payableRepo } from './otherChargesPayableService';

export const voucherRepo = new Repository<Voucher>('vouchers');

const PREFIX: Record<VoucherKind, string> = { RECEIPT: 'RV', PAYMENT: 'PV', JOURNAL: 'JV' };

export function nextVoucherNo(kind: VoucherKind, branch: string): string {
  const existing = voucherRepo.find((v) => v.kind === kind && v.branch === branch);
  const seqs = existing.map((v) => parseInt(v.voucherNo.split('-').pop() ?? '', 10)).filter((n) => Number.isFinite(n));
  const next = (seqs.length ? Math.max(...seqs) : 100) + 1;
  return `${branch}-${PREFIX[kind]}-${next}`;
}

/** A source document eligible to be cleared by a Receipt (AR) or Payment (AP) Voucher. */
export interface ClearableSource {
  type: ClearableSourceType;
  id: string;
  docNo: string;
  jobNo: string;
  partyCode: string;
  partyName: string;
  totalAmount: number;
  clearedAmount: number;
  balance: number;
}

function sumClearedForSource(type: ClearableSourceType, id: string): number {
  return voucherRepo
    .find((v) => v.final)
    .flatMap((v) => v.clearingLines)
    .filter((l) => l.sourceType === type && l.sourceId === id)
    .reduce((sum, l) => sum + l.amountCleared, 0);
}

/** Receivable-side sources for a Receipt Voucher: finalized Local Invoices and Foreign Agent "Invoices To" invoices. */
export function findReceivableSources(partyCode?: string): ClearableSource[] {
  const sources: ClearableSource[] = [];

  localInvoiceRepo
    .find((inv) => inv.status.final && !inv.status.void && (!partyCode || inv.partyCode === partyCode))
    .forEach((inv) => {
      const cleared = sumClearedForSource('LOCAL_INVOICE', inv.id);
      sources.push({
        type: 'LOCAL_INVOICE',
        id: inv.id,
        docNo: inv.invoiceNo,
        jobNo: inv.master.jobNo || inv.house.jobNo,
        partyCode: inv.partyCode,
        partyName: inv.partyName,
        totalAmount: inv.invoiceTotal,
        clearedAmount: cleared,
        balance: inv.invoiceTotal - cleared,
      });
    });

  foreignAgentInvoiceRepo
    .find((inv) => inv.variant === 'INVOICE_TO' && inv.status.final && !inv.status.void && (!partyCode || inv.fAgentCode === partyCode))
    .forEach((inv) => {
      const cleared = sumClearedForSource('FOREIGN_AGENT_INVOICE', inv.id);
      sources.push({
        type: 'FOREIGN_AGENT_INVOICE',
        id: inv.id,
        docNo: inv.documentNo,
        jobNo: inv.mawbJobNo,
        partyCode: inv.fAgentCode,
        partyName: inv.fAgentName,
        totalAmount: inv.totalInvoiceAmount,
        clearedAmount: cleared,
        balance: inv.totalInvoiceAmount - cleared,
      });
    });

  return sources.filter((s) => s.balance > 0);
}

/** Payable-side sources for a Payment Voucher: finalized Other Charges Payable records. */
export function findPayableSources(partyCode?: string): ClearableSource[] {
  return payableRepo
    .find((p) => p.status.final && (!partyCode || p.partyCode === partyCode))
    .map((p) => {
      const cleared = sumClearedForSource('OTHER_CHARGES_PAYABLE', p.id);
      return {
        type: 'OTHER_CHARGES_PAYABLE' as const,
        id: p.id,
        docNo: p.creditNoteNo,
        jobNo: p.mJobNo,
        partyCode: p.partyCode,
        partyName: p.partyName,
        totalAmount: p.totalCharges,
        clearedAmount: cleared,
        balance: p.totalCharges - cleared,
      };
    })
    .filter((s) => s.balance > 0);
}

/**
 * Applies a saved voucher's clearing lines back onto their source documents, so the source's
 * "USED/CLEARED in Vouchers" grid (docs 2.8, 5.6) and — for invoices — Receipts panel (4.3, 6.3)
 * reflect this voucher. Call after finalizing a Receipt or Payment Voucher.
 */
export function applyVoucherToSources(voucher: Voucher): void {
  for (const line of voucher.clearingLines) {
    const voucherRef = { voucherNo: voucher.voucherNo, voucherDate: voucher.voucherDate, amount: line.amountCleared };

    if (line.sourceType === 'LOCAL_INVOICE') {
      const inv = localInvoiceRepo.get(line.sourceId);
      if (inv) {
        localInvoiceRepo.save({
          ...inv,
          receipts: [...inv.receipts, { receiptNo: voucher.voucherNo, receiptDate: voucher.voucherDate, amount: line.amountCleared }],
        });
      }
    } else if (line.sourceType === 'FOREIGN_AGENT_INVOICE') {
      const inv = foreignAgentInvoiceRepo.get(line.sourceId);
      if (inv) {
        foreignAgentInvoiceRepo.save({
          ...inv,
          receipts: [...inv.receipts, { receiptNo: voucher.voucherNo, receiptDate: voucher.voucherDate, amount: line.amountCleared }],
        });
      }
    } else if (line.sourceType === 'OTHER_CHARGES_PAYABLE') {
      const payable = payableRepo.get(line.sourceId);
      if (payable) {
        payableRepo.save({ ...payable, usedClearedVouchers: [...payable.usedClearedVouchers, voucherRef] });
      }
    }

    // Also mirror onto the underlying Job's USED/CLEARED grid (docs 2.8) when we can resolve one.
    if (line.jobNo) {
      const job = jobRepo.find((j) => j.jobNo === line.jobNo)[0];
      if (job) {
        jobRepo.save({ ...job, usedClearedVouchers: [...job.usedClearedVouchers, voucherRef] });
        if (job.kind === 'HAWB' && job.parentJobNo) syncHouseAwbsOnMaster(job.parentJobNo);
      }
    }
  }
}

export function finalizeVoucher(id: string): Voucher | undefined {
  const v = voucherRepo.get(id);
  if (!v) return undefined;
  if (v.final || v.void) return v;
  const saved = voucherRepo.save({ ...v, final: true });
  if (saved.kind !== 'JOURNAL') applyVoucherToSources(saved);
  return saved;
}

/** Reopens a voucher and removes the receipts it applied to source documents. */
export function unfinalizeVoucher(id: string): Voucher | undefined {
  const v = voucherRepo.get(id);
  if (!v || !v.final || v.posted) return v;
  for (const line of v.clearingLines) {
    if (line.sourceType === 'LOCAL_INVOICE') {
      const invoice = localInvoiceRepo.get(line.sourceId);
      if (invoice) localInvoiceRepo.save({ ...invoice, receipts: invoice.receipts.filter(r => r.receiptNo !== v.voucherNo) });
    } else if (line.sourceType === 'FOREIGN_AGENT_INVOICE') {
      const invoice = foreignAgentInvoiceRepo.get(line.sourceId);
      if (invoice) foreignAgentInvoiceRepo.save({ ...invoice, receipts: invoice.receipts.filter(r => r.receiptNo !== v.voucherNo) });
    } else {
      const payable = payableRepo.get(line.sourceId);
      if (payable) payableRepo.save({ ...payable, usedClearedVouchers: payable.usedClearedVouchers.filter(r => r.voucherNo !== v.voucherNo) });
    }
    if (line.jobNo) {
      const job = jobRepo.find(j => j.jobNo === line.jobNo)[0];
      if (job) {
        jobRepo.save({ ...job, usedClearedVouchers: job.usedClearedVouchers.filter(r => r.voucherNo !== v.voucherNo) });
        if (job.kind === 'HAWB' && job.parentJobNo) syncHouseAwbsOnMaster(job.parentJobNo);
      }
    }
  }
  return voucherRepo.save({ ...v, final: false });
}

export interface VoucherFilter {
  kind: VoucherKind;
  branches?: string[];
  partyCode?: string;
  startDate?: string;
  endDate?: string;
}

export function searchVouchers(filter: VoucherFilter): Voucher[] {
  return voucherRepo.find((v) => {
    if (v.kind !== filter.kind) return false;
    if (filter.branches?.length && !filter.branches.includes(v.branch)) return false;
    if (filter.partyCode && v.partyCode !== filter.partyCode) return false;
    if (filter.startDate && v.voucherDate < filter.startDate) return false;
    if (filter.endDate && v.voucherDate > filter.endDate) return false;
    return true;
  });
}
