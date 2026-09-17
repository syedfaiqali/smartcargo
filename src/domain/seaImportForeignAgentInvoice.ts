import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

/** The 4 structurally-identical screens, mirroring the Air-Import AirImportForeignAgentInvoiceVariant. */
export type SeaImportForeignAgentInvoiceVariant =
  | 'INVOICE_TO' // Invoices To Foreign Agents (payable)
  | 'CREDIT_NOTE_TO' // Credit Notes To Foreign Agents (payable adjustment)
  | 'INVOICE_RECEIVED' // Invoices/Dr. Notes Received From Foreign Agents (receivable)
  | 'CREDIT_NOTE_RECEIVED'; // Credit Notes Received From Foreign Agents (receivable adjustment)

/** Auto Calculate Cost grid — HBL shipments this document is charged against. */
export interface SeaImportAgentCostLine {
  id: string;
  year: number;
  jobNo: string;
  hblNo: string;
  hblDate: IsoDate | '';
  ppCc: 'PP' | 'CC';
  pcs: number;
  cbm: number;
  cost: number;
  freightAmount: number;
}

/** Charges grid line — Description + two amount columns. */
export interface SeaImportAgentChargeLine {
  id: string;
  description: string;
  amount1: number;
  amount2: number;
  editableDescription: boolean;
}

export interface SeaImportAgentReceiptRef {
  receiptNo: string;
  receiptDate: IsoDate;
  amount: number;
}

/** Invoices/Credit Notes To/From Foreign Agents (Sea-Import) */
export interface SeaImportForeignAgentInvoice extends AuditFields {
  variant: SeaImportForeignAgentInvoiceVariant;
  branch: string;
  documentNo: string;
  documentDate: IsoDate;

  fAgentDocNo: string;
  fAgentDocDate: IsoDate | '';
  jobNo: string;
  jobYear: number;
  recordNo: string;

  blNo: string;
  fAgentCode: string;
  fAgentName: string;
  commodity: string;
  origin: string;
  destination: string;

  currencyCode: string;
  exchangeRate: number;

  autoCalculateCost: YesNo;
  costLines: SeaImportAgentCostLine[];

  chargeLines: SeaImportAgentChargeLine[];
  totalAmount: number;

  bankCode: string;
  bankDetailText: string;
  receipts: SeaImportAgentReceiptRef[];
  remarks: string;

  status: RecordStatus;
}
