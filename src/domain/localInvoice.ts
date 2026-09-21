import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';
import { DueAgentChargeLine, DueCarrierChargeLine } from './job';

/** HOUSE / MASTER job-reference panel — docs Section 4.2 */
export interface JobRefPanel {
  jobNo: string;
  jobDate: IsoDate | '';
  awbNo: string;
  awbDate: IsoDate | '';
  pp: string;
  refNo: string;
}

/** Invoice grid line (4.5) — the billable freight lines on this invoice. */
export interface InvoiceLine {
  id: string;
  pcs: number;
  grossWeight: number;
  cl: string;
  comdty: string;
  chWeight: number;
  curr: string;
  rate: number;
  ratePkr: number;
  freight: number;
  freightPkr: number;
}

/** Airway Bill grid line (4.6) — actual AWB freight, compared against invoice freight for KB. */
export interface AirwayBillLine {
  id: string;
  pcs: number;
  grossWeight: number;
  cl: string;
  comdty: string;
  chWeight: number;
  rate: number;
  ratePkr: number;
  freight: number;
  freightPkr: number;
  netNet: number;
  netRate: number;
  kbPercent: number;
  kbAmount: number;
}

export interface InvoicePrintingOptions {
  documentType: 'INVOICE' | 'CREDIT_NOTE_DISCOUNTS_ONLY' | 'SALES_TAX_INVOICE' | 'PRA_TAX_INVOICE';
  printHeadingAs: 'INVOICE' | 'SALE_TAX_INVOICE';
  startingInvoiceNo: string;
  endingInvoiceNo: string;
  printOn: 'LETTER_PAD' | 'PLAIN_PAPER';
  printIn: 'PKR' | 'FOREIGN';
  printCopyType: 'ORIGINAL' | 'REVISED' | 'DUPLICATE' | 'OFFICE_COPY' | 'ADDITIONAL' | 'CORRECTED';
  printQuotationNo: YesNo;
  printDueDate: YesNo;
  printConsignee: YesNo;
  printSpoCodeName: YesNo;
  printExRate: YesNo;
  printReceivedBy: YesNo;
  printSignatorys: YesNo;
  printNtnNo: YesNo;
}

export interface ReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/** Local Invoices Entry and Printing (Air-Export) — docs/screens-phase.md Section 4 */
export interface LocalInvoice extends AuditFields {
  branch: string;
  invoiceNo: string;
  invoiceDate: IsoDate;
  jobYear: number;
  jobType: string;
  ccPort: string;

  house: JobRefPanel;
  master: JobRefPanel;

  ownerCode: string;
  partyCode: string;
  partyName: string;
  partyAddress: string;
  agentParty: string;
  moveChargesFromLastPartyInvoice: YesNo;

  airportOfDeparture: string;
  destination: string;
  spoCode: string;

  formENo: string;
  formEDate: IsoDate | '';
  sbNo: string;
  sbDate: IsoDate | '';
  shipperInvoiceNo: string;
  shipperInvoiceDate: IsoDate | '';

  postInPkr: YesNo;
  currency1: string;
  exRate1: number;
  currency2: string;
  exRate2: number;
  currency3: string;
  exRate3: number;

  consignee: string;
  printableRemarks: string;
  nonPrintableRemarks: string;
  bankCode: string;
  bankDetailText: string;

  // 4.3 Tax, Commission & Totals
  salesTaxPercent: number;
  pstAmount: number;
  praTax: number;
  whtSalesTaxPercent: number;
  whtSalesTaxAmount: number;
  salesTaxInvoiceNo: string;
  praSrbTaxInvoiceNo: string;

  totalFreight: number;
  totalDueCarrier: number;
  totalDueAgent: number;
  grossInvoiceAmount: number;

  commissionPercent: number;
  commissionAmount: number;
  whtPercent: number;
  whtAmount: number;

  netRate: YesNo;
  agreedRate: number;
  agreedFreight: number;
  freightDifference: number;
  lessCommission: number;
  kbRatePercent: number;
  kbAmount: number;

  totalDiscount: number;
  invoiceTotal: number;

  printIncentiveCommissionWht: YesNo;
  receipts: ReceiptRef[];

  // 4.4 Due Carrier / Due Agent charges (same shape as Job Charges tab)
  dueCarrierLines: DueCarrierChargeLine[];
  totalDueCarrierComputed: number;
  dueAgentLines: DueAgentChargeLine[];
  totalDueAgentComputed: number;

  invoiceLines: InvoiceLine[];
  airwayBillLines: AirwayBillLine[];
  awbCommissionAmount: number;
  awbPayableToAirline: number;
  awbExchangeRate: number;

  printing: InvoicePrintingOptions;

  status: RecordStatus;
}
