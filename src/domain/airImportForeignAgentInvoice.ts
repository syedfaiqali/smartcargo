import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** The 4 structurally-identical screens, mirroring the Sea-Export SeaForeignAgentInvoiceVariant. */
export type AirImportForeignAgentInvoiceVariant =
  | 'INVOICE_TO' // Invoices To Foreign Agents (payable)
  | 'CREDIT_NOTE_TO' // Credit Notes To Foreign Agents (payable adjustment)
  | 'INVOICE_RECEIVED' // Invoices/Dr. Notes Received From Foreign Agents (receivable)
  | 'CREDIT_NOTE_RECEIVED'; // Credit Notes Received From Foreign Agents (receivable adjustment)

/** Auto Calculate Cost grid — HAWB shipments this document is charged against. */
export interface AirImportAgentCostLine {
  id: string;
  year: number;
  jobNo: string;
  hawbNo: string;
  hawbDate: IsoDate | '';
  ppCc: 'PP' | 'CC';
  pcs: number;
  uom: string;
  grossWeight: number;
  chargeableWeight: number;
  cost: number;
  freightAmount: number;
}

/** Charges grid line — Charges/Rate/Amount. */
export interface AirImportAgentChargeLine {
  id: string;
  description: string;
  rate: number;
  amount: number;
  editableDescription: boolean;
}

export interface AirImportAgentReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/** Invoices/Credit Notes To/From Foreign Agents (Air-Import) */
export interface AirImportForeignAgentInvoice extends AuditFields {
  variant: AirImportForeignAgentInvoiceVariant;
  branch: string;
  documentNo: string;
  documentDate: IsoDate;

  fAgentDocNo: string;
  fAgentDocDate: IsoDate | '';
  jobNo: string;
  jobYear: number;
  recordNo: string;

  mawbNo: string;
  mawbDate: IsoDate | '';
  fAgentCode: string;
  fAgentName: string;
  commodity: string;
  origin: string;
  destination: string;

  postInPkr: YesNo;
  currencyCode: string;
  exchangeRate: number;
  pieces: number;
  unit: string;
  grossWeight: number;
  chargeableWeight: number;

  autoCalculateCost: YesNo;
  costLines: AirImportAgentCostLine[];

  chargeLines: AirImportAgentChargeLine[];
  totalAmount: number;

  bankCode: string;
  bankDetailText: string;
  receipts: AirImportAgentReceiptRef[];
  remarks: string;

  status: RecordStatus;
}
