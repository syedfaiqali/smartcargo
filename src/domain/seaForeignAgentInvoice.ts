import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** The 4 structurally-identical screens, mirroring the Air-Export ForeignAgentInvoiceVariant. */
export type SeaForeignAgentInvoiceVariant =
  | 'INVOICE_TO' // Invoices To Foreign Agents (receivable)
  | 'CREDIT_NOTE_TO' // Credit Notes To Foreign Agents (receivable adjustment)
  | 'INVOICE_RECEIVED' // Invoices/Dr. Notes Received From Foreign Agents (payable)
  | 'CREDIT_NOTE_RECEIVED'; // Credit Notes Received From Foreign Agents (payable adjustment)

/** Container grid line — Container No./Type, with a Selling and a Buying rate. */
export interface SeaAgentContainerLine {
  id: string;
  containerNo: string;
  type: string;
  selling: number;
  buying: number;
}

/** Selling & Buying charge line (Code/Description/Rate/Charges, tagged Selling or Buying). */
export interface SeaAgentChargeLine {
  id: string;
  side: 'SELLING' | 'BUYING';
  code: string;
  description: string;
  rate: number;
  charges: number;
}

/** Less Expenses / Handling-Other Charges line. */
export interface SeaAgentExpenseLine {
  id: string;
  code: string;
  description: string;
  rate: number;
  charges: number;
}

/** Auto Calculate Cost strip — Job#/HBL No./Pcs/Grs.Weight/CBM/Cost/Party Name. */
export interface SeaAutoCalcCostLine {
  id: string;
  jobNo: string;
  hblNo: string;
  pcs: number;
  grsWeight: number;
  cbm: number;
  cost: number;
  partyName: string;
}

/** Year/C-N No./Tracking No./Run No. cost allocation strip. */
export interface SeaAgentCreditNoteCostLine {
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

export interface SeaAgentPrintingOptions {
  printOn: 'LETTER_PAD' | 'PLAIN_PAPER';
  printIn: 'PKR' | 'FOREIGN';
  printHeadingAs: 'INVOICE' | 'DEBIT_NOTE';
  printSignatorys: YesNo;
  printCopyType: 'ORIGINAL' | 'REVISED' | 'DUPLICATE' | 'OFFICE_COPY';
}

export interface SeaAgentReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/**
 * Invoices/Credit Notes To/From Foreign Agents (Sea-Export).
 * One shared shape for all 4 variants; `variant` drives the document-number label and screen title.
 */
export interface SeaForeignAgentInvoice extends AuditFields {
  variant: SeaForeignAgentInvoiceVariant;
  branch: string;
  documentNo: string;
  documentDate: IsoDate;

  jobNo: string;
  jobYear: number;
  consolNo: string;
  fAgentDocNo: string;
  dueDate: IsoDate | '';
  mblNo: string;
  mblDate: IsoDate | '';
  runNo: string;
  mPpCc: 'PP' | 'CC';
  hPpCc: 'PP' | 'CC';
  fAgentCode: string;
  fAgentName: string;
  origin: string;
  destination: string;

  pieces: number;
  uom: string;
  lclFcl: 'LCL' | 'FCL';
  grossWeight: number;
  netWeight: number;
  cbm: number;
  vessel: string;
  voyage: string;
  carrier: string;
  remarks: string;

  postInPkr: YesNo;
  currencyCode: string;
  exchangeRate: number;
  reference: string;
  consignee: string;
  bankCode: string;
  bankDetailText: string;
  receipts: SeaAgentReceiptRef[];

  containers: SeaAgentContainerLine[];

  chargeLines: SeaAgentChargeLine[];
  totalSelling: number;
  totalBuying: number;
  difference: number;
  profitSharePercent: number;

  lessExpenseLines: SeaAgentExpenseLine[];
  totalLessExpenses: number;

  handlingLines: SeaAgentExpenseLine[];
  totalOtherCharges: number;
  totalInvoiceAmount: number;

  autoCalculateCost: YesNo;
  autoCalcCostLines: SeaAutoCalcCostLine[];
  autoCalcLines: SeaAgentCreditNoteCostLine[];

  printing: SeaAgentPrintingOptions;

  status: RecordStatus;
}
