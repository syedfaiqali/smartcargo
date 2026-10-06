import { localInvoiceRepo } from './localInvoiceService';
import { foreignAgentInvoiceRepo } from './foreignAgentInvoiceService';
import { payableRepo } from './otherChargesPayableService';
import { voucherRepo, findReceivableSources, findPayableSources } from './voucherService';
import { jobRepo } from './jobService';
import { seaExportJobRepo } from './seaExportJobService';
import { Voucher } from '../domain/voucher';

export interface AgingRow {
  docNo: string;
  jobNo: string;
  partyCode: string;
  partyName: string;
  docDate: string;
  totalAmount: number;
  balance: number;
  daysOutstanding: number;
  bucket: '0-30' | '31-60' | '61-90' | '90+';
}

function bucketFor(days: number): AgingRow['bucket'] {
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

/** AR Aging — outstanding Local Invoices and Foreign Agent "Invoices To". */
export function getArAging(asOfDate: string): AgingRow[] {
  const rows: AgingRow[] = [];

  localInvoiceRepo.find((inv) => inv.status.final && !inv.status.void).forEach((inv) => {
    const source = findReceivableSources().find((s) => s.type === 'LOCAL_INVOICE' && s.id === inv.id);
    const balance = source?.balance ?? inv.invoiceTotal;
    if (balance <= 0) return;
    const days = daysBetween(inv.invoiceDate, asOfDate);
    rows.push({
      docNo: inv.invoiceNo,
      jobNo: inv.master.jobNo || inv.house.jobNo,
      partyCode: inv.partyCode,
      partyName: inv.partyName,
      docDate: inv.invoiceDate,
      totalAmount: inv.invoiceTotal,
      balance,
      daysOutstanding: days,
      bucket: bucketFor(days),
    });
  });

  foreignAgentInvoiceRepo.find((inv) => inv.variant === 'INVOICE_TO' && inv.status.final && !inv.status.void).forEach((inv) => {
    const source = findReceivableSources().find((s) => s.type === 'FOREIGN_AGENT_INVOICE' && s.id === inv.id);
    const balance = source?.balance ?? inv.totalInvoiceAmount;
    if (balance <= 0) return;
    const days = daysBetween(inv.documentDate, asOfDate);
    rows.push({
      docNo: inv.documentNo,
      jobNo: inv.mawbJobNo,
      partyCode: inv.fAgentCode,
      partyName: inv.fAgentName,
      docDate: inv.documentDate,
      totalAmount: inv.totalInvoiceAmount,
      balance,
      daysOutstanding: days,
      bucket: bucketFor(days),
    });
  });

  return rows.sort((a, b) => b.daysOutstanding - a.daysOutstanding);
}

/** AP Aging — outstanding Other Charges Payable records. */
export function getApAging(asOfDate: string): AgingRow[] {
  return payableRepo
    .find((p) => p.status.final)
    .map((p) => {
      const source = findPayableSources().find((s) => s.id === p.id);
      const balance = source?.balance ?? p.totalCharges;
      const days = daysBetween(p.date, asOfDate);
      return {
        docNo: p.creditNoteNo,
        jobNo: p.mJobNo,
        partyCode: p.partyCode,
        partyName: p.partyName,
        docDate: p.date,
        totalAmount: p.totalCharges,
        balance,
        daysOutstanding: days,
        bucket: bucketFor(days),
      };
    })
    .filter((r) => r.balance > 0)
    .sort((a, b) => b.daysOutstanding - a.daysOutstanding);
}

export interface LedgerEntry {
  date: string;
  voucherNo: string;
  kind: 'RECEIPT' | 'PAYMENT';
  bankCode: string;
  partyName: string;
  amount: number;
}

/** Bank/Cash Ledger — every finalized Receipt (inflow) and Payment (outflow) voucher. */
export function getBankCashLedger(): LedgerEntry[] {
  return voucherRepo
    .find((v) => v.final && (v.kind === 'RECEIPT' || v.kind === 'PAYMENT'))
    .map((v) => ({
      date: v.voucherDate,
      voucherNo: v.voucherNo,
      kind: v.kind as 'RECEIPT' | 'PAYMENT',
      bankCode: v.bankCode || 'CASH',
      partyName: v.partyName,
      amount: v.amount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface JobProfitabilityRow {
  jobNo: string;
  jobKind: 'AIR_MAWB' | 'AIR_HAWB' | 'SEA';
  partyName: string;
  revenue: number;
  cost: number;
  profit: number;
}

/** Job Profitability — revenue (job totals) vs. cost (linked Other Charges Payable) per job. */
export function getJobProfitability(): JobProfitabilityRow[] {
  const rows: JobProfitabilityRow[] = [];

  jobRepo.find((j) => j.status.final).forEach((j) => {
    const cost = payableRepo.find((p) => p.mJobNo === j.jobNo).reduce((sum, p) => sum + p.totalCharges, 0);
    const revenue = j.totals.totalAwbAmount;
    rows.push({
      jobNo: j.jobNo,
      jobKind: j.kind === 'MAWB' ? 'AIR_MAWB' : 'AIR_HAWB',
      partyName: j.party.name,
      revenue,
      cost,
      profit: revenue - cost,
    });
  });

  seaExportJobRepo.find((j) => j.status.final).forEach((j) => {
    const cost = payableRepo.find((p) => p.mJobNo === j.jobNo).reduce((sum, p) => sum + p.totalCharges, 0) + j.jobCharges.totalBuyCharges;
    const revenue = j.jobCharges.totalSellCharges;
    rows.push({
      jobNo: j.jobNo,
      jobKind: 'SEA',
      partyName: j.partyName,
      revenue,
      cost,
      profit: revenue - cost,
    });
  });

  return rows.sort((a, b) => b.profit - a.profit);
}

/** One un-cleared BPV/BRV cheque row shown in the Bank Reconciliation worksheet. */
export interface ReconciliationChequeRow {
  voucherId: string;
  branch: string;
  type: 'BPV' | 'BRV';
  voucherNo: string;
  voucherDate: string;
  particulars: string;
  chequeNo: string;
  chequeDate: string;
  amount: number;
}

export interface BankReconciliationData {
  /** Balance per books = all finalized Receipts minus Payments for this bank, up to the As On date. */
  bookBalance: number;
  /** Cheques issued (BPV) but not yet presented/debited by the bank — added back to the bank statement balance. */
  issuedUncleared: ReconciliationChequeRow[];
  /** Cheques deposited (BRV) but not yet credited by the bank — subtracted from the bank statement balance. */
  depositedUncleared: ReconciliationChequeRow[];
}

function voucherToRow(v: Voucher, type: 'BPV' | 'BRV'): ReconciliationChequeRow {
  return {
    voucherId: v.id,
    branch: v.branch,
    type,
    voucherNo: v.voucherNo,
    voucherDate: v.voucherDate,
    particulars: v.accountLines?.[0]?.particulars || v.remarks || v.partyName || '—',
    chequeNo: v.chequeNo || '',
    chequeDate: v.chequeDate || '',
    amount: v.amount,
  };
}

/** Builds the Bank Reconciliation worksheet for one bank, as of a given date. */
export function getBankReconciliation(bankCode: string, asOnDate: string, branches?: string[]): BankReconciliationData {
  const inScope = (v: Voucher) =>
    v.final &&
    v.bankCode === bankCode &&
    v.voucherDate <= asOnDate &&
    (!branches?.length || branches.includes(v.branch));

  const finalizedForBank = voucherRepo.find((v) => inScope(v) && (v.kind === 'RECEIPT' || v.kind === 'PAYMENT'));
  const bookBalance = finalizedForBank.reduce((sum, v) => sum + (v.kind === 'RECEIPT' ? v.amount : -v.amount), 0);

  const issuedUncleared = finalizedForBank
    .filter((v) => v.kind === 'PAYMENT' && v.chequeStatus !== 'CLEARED')
    .map((v) => voucherToRow(v, 'BPV'))
    .sort((a, b) => a.voucherDate.localeCompare(b.voucherDate));

  const depositedUncleared = finalizedForBank
    .filter((v) => v.kind === 'RECEIPT' && v.chequeStatus !== 'CLEARED')
    .map((v) => voucherToRow(v, 'BRV'))
    .sort((a, b) => a.voucherDate.localeCompare(b.voucherDate));

  return { bookBalance, issuedUncleared, depositedUncleared };
}

/** Marks the given vouchers' cheques as cleared with the supplied clearing date — used by the Update action. */
export function markChequesCleared(voucherIds: string[], clearingDate: string): void {
  for (const id of voucherIds) {
    const v = voucherRepo.get(id);
    if (!v) continue;
    voucherRepo.save({ ...v, chequeStatus: 'CLEARED', clearingDate });
  }
}
