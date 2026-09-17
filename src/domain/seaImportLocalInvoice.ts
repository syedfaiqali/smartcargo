import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** Charges grid line — Description/CBM-WT/Currency/Qty/Rate/F-Amount. */
export interface SeaImportInvoiceChargeLine {
  id: string;
  description: string;
  cbmWtBasis: 'CBM' | 'WT';
  curr: string;
  qty: number;
  rate: number;
  fAmount: number;
  editableDescription: boolean;
}

/** Container grid line — No./Size/Rate. */
export interface SeaImportInvoiceContainerLine {
  id: string;
  containerNo: string;
  size: string;
  rate: number;
}

export interface SeaImportInvoiceCurrencyRow {
  currencyCode: string;
  exRate: number;
}

export interface SeaImportInvoiceReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/** Local Invoices Entry and Printing (Sea-Import) */
export interface SeaImportLocalInvoice extends AuditFields {
  branch: string;
  invoiceNo: string;
  date: IsoDate;
  jobNo: string;
  jobYear: number;
  jobType: string;

  mblNo: string;
  mblDate: IsoDate | '';
  mblPpCc: string;
  mblPcs: number;
  mblCbm: number;
  mblGrossWeight: number;
  mblNetWeight: number;

  hblNo: string;
  hblDate: IsoDate | '';
  hblPpCc: string;
  hblPcs: number;
  hblCbm: number;
  hblGrossWeight: number;
  hblNetWeight: number;

  quotRefNo: string;
  partyCode: string;
  partyName: string;
  partyAddress: string;
  subAgentParty: string;
  spoCode: string;
  foreignAgent: string;
  commodity: string;
  origin: string;
  destination: string;

  postInPkr: YesNo;
  currencies: SeaImportInvoiceCurrencyRow[];

  remarks: string;
  bankCode: string;
  bankDetailText: string;

  salesTaxPercent: number;
  salesTaxInvoiceNo: string;
  whtSalesTaxPercent: number;

  chargeLines: SeaImportInvoiceChargeLine[];
  invoiceTotal: number;

  containers: SeaImportInvoiceContainerLine[];

  refund: number;
  refundExRate: number;
  refund2: number;
  refund3: number;
  totalRefundAmount: number;
  invoiceTotalPkr: number;
  printRefundOnInvoice: YesNo;

  receipts: SeaImportInvoiceReceiptRef[];

  status: RecordStatus;
}
