import { AuditFields, IsoDate, YesNo } from './common';

/** 5.3 Job/HAWB Allocation Grid — which shipments this payable is charged against. */
export interface PayableAllocationLine {
  id: string;
  jobNo: string;
  hawbNo: string;
  pcs: number;
  grossWeight: number;
  chargeWeight: number;
  cost: number;
  partyName: string;
}

/** 5.4 Other Charges Grid — itemized charge lines. */
export interface PayableChargeLine {
  id: string;
  code: string;
  description: string;
  wtPcBasis: 'WT' | 'PC';
  curr: string;
  qty: number;
  rate: number;
  fAmount: number;
  pkrAmount: number;
}

/** 5.5 Job History / Credit Note Grid — credit notes issued against this payable. */
export interface PayableCreditNoteRef {
  no: string;
  date: IsoDate;
  payableType: string;
  hJobNo: string;
  jobPartyCode: string;
  jobPartyName: string;
  creditPartyCode: string;
  creditPartyName: string;
  amount: number;
}

export interface PayableVoucherRef {
  voucherNo: string;
  voucherDate: IsoDate;
  amount: number;
}

/** Other Charges Payable (Air-Export) — docs/screens-phase.md Section 5 */
export interface OtherChargesPayable extends AuditFields {
  branch: string;
  creditNoteNo: string;
  year: number;
  date: IsoDate;

  payableType: string;
  dueDate: IsoDate | '';
  partyCode: string;
  partyName: string;
  partyAddress: string;

  mJobNo: string;
  jobYear: number;
  mawbNo: string;
  grossWeight: number;
  chargeWeight: number;

  postInLocalCurrency: YesNo;
  currency1: string;
  exRate1: number;
  currency2: string;
  exRate2: number;
  currency3: string;
  exRate3: number;

  billNo: string;
  billDate: IsoDate | '';
  remarks: string;

  allocationLines: PayableAllocationLine[];
  chargeLines: PayableChargeLine[];
  grandTotal: number;
  totalCharges: number;

  jobHistory: PayableCreditNoteRef[];
  usedClearedVouchers: PayableVoucherRef[];
  attachmentNote: string;

  status: {
    final: boolean;
  };
}
