import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** Charges grid line — Description/CBM-WT/Curr/Rate/F-Amount. */
export interface AirImportInvoiceChargeLine {
  id: string;
  description: string;
  cbmWtBasis: 'CBM' | 'WT';
  curr: string;
  rate: number;
  fAmount: number;
  editableDescription: boolean;
}

export interface AirImportInvoiceCurrencyRow {
  currencyCode: string;
  exRate: number;
}

export interface AirImportInvoiceReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/** Local Invoices Entry and Printing (Air-Import) */
export interface AirImportLocalInvoice extends AuditFields {
  branch: string;
  invoiceNo: string;
  date: IsoDate;
  jobNo: string;
  jobYear: number;
  jobType: string;

  mawbNo: string;
  mawbDate: IsoDate | '';
  mawbPpCc: string;
  mawbPcs: number;
  mawbCbm: number;
  mawbGrossWeight: number;
  mawbChargeWeight: number;

  hawbNo: string;
  hawbDate: IsoDate | '';
  hawbPpCc: string;
  hawbPcs: number;
  hawbCbm: number;
  hawbGrossWeight: number;
  hawbChargeWeight: number;

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
  currencies: AirImportInvoiceCurrencyRow[];

  remarks: string;
  bankCode: string;
  bankDetailText: string;

  salesTaxPercent: number;
  salesTaxInvoiceNo: string;
  whtSalesTaxPercent: number;

  chargeLines: AirImportInvoiceChargeLine[];
  invoiceTotal: number;

  refund: number;
  refundExRate: number;
  refund2: number;
  refund3: number;
  totalRefundAmount: number;
  invoiceTotalPkr: number;
  printRefundOnInvoice: YesNo;

  receipts: AirImportInvoiceReceiptRef[];

  status: RecordStatus;
}
