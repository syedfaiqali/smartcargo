import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** Container grid line — No./Size/Rate. */
export interface SeaInvoiceContainerLine {
  id: string;
  containerNo: string;
  size: string;
  rate: number;
}

/** Shipping Line Charges / Other Charges grid line. */
export interface SeaInvoiceChargeLine {
  id: string;
  code: string;
  description: string;
  cbmWtBasis: 'CBM' | 'WT';
  curr: string;
  qty: number;
  rate: number;
  fAmount: number;
  pkrAmount: number;
}

/** Local/Intl Documents grid — credit notes / other documents issued against this invoice. */
export interface SeaInvoiceDocumentRef {
  no: string;
  date: IsoDate;
  year: number;
  type: string;
  name: string;
  curr: string;
  fAmount: number;
  amount: number;
  final: boolean;
}

export interface SeaInvoiceReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/** Local Invoices Entry and Printing (Sea-Export) */
export interface SeaLocalInvoice extends AuditFields {
  branch: string;
  invoiceNo: string;
  date: IsoDate;
  jobNo: string;
  jobYear: number;
  type: string;

  quotRefNo: string;
  partyCode: string;
  partyName: string;
  partyAddress: string;
  subAgentParty: string;

  mblNo: string;
  hblNo: string;
  shipperInvoiceNo: string;
  shipperInvoiceDate: IsoDate | '';

  portOfLoad: string;
  destination: string;
  lclFcl: 'LCL' | 'FCL';
  spoCode: string;
  consignee: string;
  remarks: string;

  cbm: number;
  cbmRate: number;
  fobCif: 'FOB' | 'CIF';

  bankCode: string;
  bankDetailText: string;

  pkgs: number;
  weightGrs: number;
  weightNet: number;
  weightVol: number;

  postInPkr: YesNo;
  currency1: string;
  exRate1: number;
  currency2: string;
  exRate2: number;
  currency3: string;
  exRate3: number;

  containers: SeaInvoiceContainerLine[];

  freight1: number;
  freight2: number;
  salesTaxPercent: number;
  pstAmount: number;
  whtSalesTaxPercent: number;
  whtSalesTaxAmount: number;
  praCode: string;
  praCharges: number;
  salesTaxInvoiceNo: string;
  praSrbTaxInvoiceNo: string;
  slCharges: number;
  otherCharges: number;
  grossTotal: number;

  refundCbmRate: number;
  refund1: number;
  refundExRate: number;
  refund2: number;
  refund3: number;
  totalRefund: number;
  invoiceTotal: number;
  printRefundOnInvoice: YesNo;

  shippingLineChargeLines: SeaInvoiceChargeLine[];
  totalSLineCharges: number;
  otherChargeLines: SeaInvoiceChargeLine[];
  totalOtherCharges: number;
  invoiceTotalPkr: number;

  documents: SeaInvoiceDocumentRef[];
  receipts: SeaInvoiceReceiptRef[];

  status: RecordStatus;
}
