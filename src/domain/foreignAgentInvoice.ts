import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** The 4 structurally-identical screens documented in Sections 6-9. */
export type ForeignAgentInvoiceVariant =
  | 'INVOICE_TO' // Section 6 — Invoices To Foreign Agents (receivable)
  | 'CREDIT_NOTE_TO' // Section 7 — Credit Notes To Foreign Agents (receivable adjustment)
  | 'INVOICE_RECEIVED' // Section 8 — Invoices/Dr. Notes Received From Foreign Agents (payable)
  | 'CREDIT_NOTE_RECEIVED'; // Section 9 — Credit Notes Received From Foreign Agents (payable adjustment)

/** 6.4 Job / HAWB Allocation Grid line. */
export interface AgentAllocationLine {
  id: string;
  jobNo: string;
  hawbNo: string;
  pcs: number;
  grWeight: number;
  chWeight: number;
  cost: number;
  partyName: string;
}

/** 6.5 Selling & Buying charge line (Code/Description/Rate/Charges, tagged Selling or Buying). */
export interface AgentChargeLine {
  id: string;
  side: 'SELLING' | 'BUYING';
  code: string;
  description: string;
  rate: number;
  charges: number;
}

/** 6.6 Handling / Service charge line. */
export interface HandlingChargeLine {
  id: string;
  code: string;
  description: string;
  rate: number;
  charges: number;
}

/** 6.7 Auto Calculate Cost strip line. */
export interface AutoCalcCostLine {
  id: string;
  year: number;
  cnNo: string;
  trackingNo: string;
  runNo: string;
  pkgs: number;
  weight: number;
  cost: number;
  partyName: string;
}

export interface AgentPrintingOptions {
  printOn: 'LETTER_PAD' | 'PLAIN_PAPER';
  printIn: 'PKR' | 'FOREIGN';
  printHeadingAs: 'INVOICE' | 'DEBIT_NOTE';
  printSignatorys: YesNo;
  printCopyType: 'ORIGINAL' | 'REVISED' | 'DUPLICATE' | 'OFFICE_COPY';
}

export interface AgentReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/**
 * Invoices/Credit Notes To/From Foreign Agents (Air-Export) — docs/screens-phase.md Sections 6-9.
 * One shared shape for all 4 variants; `variant` drives the document-number label, screen title,
 * and which of the label quirks documented in 7.1/9.1 apply (Printing tab and Detail/Search grid
 * intentionally keep "Invoice No." / "INVOICE" even on Credit Note variants, per the docs).
 */
export interface ForeignAgentInvoice extends AuditFields {
  variant: ForeignAgentInvoiceVariant;
  branch: string;
  documentNo: string;
  documentDate: IsoDate;

  mawbJobNo: string;
  mawbJobYear: number;
  mawbNo: string;
  mawbDate: IsoDate | '';
  dueDate: IsoDate | '';
  runNo: string;
  fAgentDocNo: string;
  ppCc: 'PP' | 'CC';
  fAgentCode: string;
  fAgentName: string;
  origin: string;
  destination: string;
  pieces: number;
  grossWeight: number;
  chargeWeight: number;
  remarks: string;

  postInPkr: YesNo;
  currencyCode: string;
  exchangeRate: number;
  reference: string;
  consignee: string;
  bankCode: string;
  bankDetailText: string;
  receipts: AgentReceiptRef[];

  allocationLines: AgentAllocationLine[];
  chargeLines: AgentChargeLine[];
  totalSelling: number;
  totalBuying: number;
  difference: number;
  profitSharePercent: number;

  handlingLines: HandlingChargeLine[];
  totalOtherCharges: number;
  totalInvoiceAmount: number;

  autoCalculateCost: YesNo;
  autoCalcLines: AutoCalcCostLine[];

  printing: AgentPrintingOptions;

  status: RecordStatus;
}
