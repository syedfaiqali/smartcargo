import { AuditFields, IsoDate, YesNo } from './common';

/** Job Allocation Grid — which shipments this refund is claimed against. */
export interface RefundAllocationLine {
  id: string;
  year: number;
  jobNo: string;
  mblNo: string;
  hblNo: string;
  pcs: number;
  grossWeight: number;
  cbm: number;
  cost: number;
  partyName: string;
}

/** Charges Detail Grid — itemized refund lines (e.g. Ocean Freight). */
export interface RefundChargeLine {
  id: string;
  code: string;
  description: string;
  ratePerCbm: number;
  curr: string;
  fAmount: number;
  pkrAmount: number;
}

export interface RefundCreditNoteRef {
  no: string;
  date: IsoDate;
  jobNo: string;
  jobPartyCode: string;
  jobPartyName: string;
  creditPartyCode: string;
  creditPartyName: string;
  amount: number;
}

/** Refund from Shipping Lines Entry and Printing (Sea-Export) */
export interface SeaRefundFromShippingLines extends AuditFields {
  branch: string;
  documentNo: string;
  year: number;
  date: IsoDate;

  consolNo: string;
  jobYear: number;
  jobNo: string;

  sLineAgent: string;

  postInLocalCurrency: YesNo;
  currency: string;
  exRate: number;

  billNo: string;
  billDate: IsoDate | '';
  cbm: number;
  remarks: string;

  allocationLines: RefundAllocationLine[];
  chargeLines: RefundChargeLine[];
  totalAmount: number;

  jobHistory: RefundCreditNoteRef[];

  status: {
    final: boolean;
  };
}
