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

/** Manual accounting detail entered on a payment/receipt voucher. */
export interface VoucherAccountLine {
  id: string;
  action: string;
  debitCredit: 'D' | 'C';
  accountCode: string;
  particulars: string;
  analysis: string;
  /** Supplier/customer bill reference entered on the voucher detail row. */
  billNo: string;
  /** Date of the referenced bill. */
  billDate: IsoDate | '';
  /** Allows vouchers saved before the Bill No./Bill Date split to continue loading. */
  bill?: string;
  currencyCode: string;
  exchangeRate: number;
  amount: number;
}

export interface Voucher extends AuditFields {
  kind: VoucherKind;
  branch: string;
  voucherNo: string;
  voucherDate: IsoDate;
  entryDate?: IsoDate;
  receivedFrom?: string;
  chequeNo?: string;
  chequeDate?: IsoDate;
  chequeStatus?: 'UNCLEARED' | 'CLEARED' | 'RETURNED' | 'CANCELLED' | 'BOUNCED';
  clearingDate?: IsoDate;
  chequeType?: 'OPEN' | 'CROSSED' | 'PAYEE_ACCOUNT_ONLY' | 'BANK_TRANSFER' | 'ONLINE_TRANSFER' | 'CREDIT_CARD' | 'PO' | 'TT' | 'CASH' | 'PERSONAL_CHEQUE' | 'ONLINE_PERSONAL' | 'DIGITAL_WALLET' | 'ATM_TRANSFER' | 'RTGS' | 'IBFT';
  attachment?: { name: string; dataUrl: string };
  accountCode?: string;
  analysisCode?: string;
  posted?: boolean;
  void?: boolean;
  checked?: boolean;
  costLines?: VoucherCostLine[];
  receiptEntryLines?: ReceiptEntryLine[];

  // Receipt / Payment specific
  partyCode: string;
  partyName: string;
  bankCode: string;
  amount: number;
  currencyCode: string;
  exchangeRate: number;
  clearingLines: VoucherClearingLine[];
  accountLines: VoucherAccountLine[];
  entryDate: IsoDate;
  chequeNo: string;
  chequeDate: IsoDate | '';
  chequeStatus: 'Un Cleared' | 'Cleared';
  clearingDate: IsoDate | '';
  chequeType: 'Open' | 'Crossed';
  accountCode: string;

  // Journal specific
  journalLines: JournalLine[];

  remarks: string;
  final: boolean;
}

export interface ReceiptEntryLine {
  id: string;
  /** Prevents duplicate automatic rows; deleting a row never deletes its counterpart. */
  counterpartId?: string;
  dc: 'DEBIT' | 'CREDIT';
  accountCode: string;
  accountDescription: string;
  particulars: string;
  analysisCode: string;
  billNo: string;
  billDate: IsoDate;
  currencyCode: string;
  exchangeRate: string;
  amount: string;
}

export interface VoucherCostLine {
  id: string;
  accountCode: string;
  description: string;
  jobType: string;
  jobYear: string;
  station: string;
  houseJobNo: string;
  masterJobNo: string;
  masterJobPrefix?: string;
  courierNo: string;
  houseBlNo: string;
  masterBlNo: string;
  amount: number;
  partyName: string;
  invoiceNo: string;
  invoiceYear: string;
  invoiceAmount: number;
}
