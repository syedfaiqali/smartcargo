import { AuditFields, IsoDate } from './common';

export type VoucherKind = 'RECEIPT' | 'PAYMENT' | 'JOURNAL';

/** What a Receipt/Payment Voucher line clears — the source document being settled. */
export type ClearableSourceType = 'LOCAL_INVOICE' | 'FOREIGN_AGENT_INVOICE' | 'OTHER_CHARGES_PAYABLE';

/** One line of a Receipt/Payment Voucher — the amount applied against a specific source document. */
export interface VoucherClearingLine {
  id: string;
  sourceType: ClearableSourceType;
  sourceId: string;
  sourceDocNo: string;
  /** Job No. of the underlying job, purely for display/traceability on the voucher. */
  jobNo: string;
  amountCleared: number;
}

/** One line of a Journal Voucher — a debit/credit posting to a GL-style account head. */
export interface JournalLine {
  id: string;
  accountHead: string;
  description: string;
  debit: number;
  credit: number;
}

export interface Voucher extends AuditFields {
  kind: VoucherKind;
  branch: string;
  voucherNo: string;
  voucherDate: IsoDate;

  // Receipt / Payment specific
  partyCode: string;
  partyName: string;
  bankCode: string;
  amount: number;
  currencyCode: string;
  exchangeRate: number;
  clearingLines: VoucherClearingLine[];

  // Journal specific
  journalLines: JournalLine[];

  remarks: string;
  final: boolean;
}
