import { AuditFields, IsoDate, YesNo } from './common';

/** Job/HAWB Allocation Grid — which shipments this payable is charged against. */
export interface AirImportPayableAllocationLine {
  id: string;
  jobNo: string;
  hawbNo: string;
  pcs: number;
  grossWeight: number;
  chargeWeight: number;
  cost: number;
  partyName: string;
}

/** Other Charges Grid — itemized charge lines. */
export interface AirImportPayableChargeLine {
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

/** Job History / Credit Note Grid — credit notes issued against this payable. */
export interface AirImportPayableCreditNoteRef {
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

export interface AirImportPayableVoucherRef {
  voucherNo: string;
  voucherDate: IsoDate;
  amount: number;
}

/** Other Charges Payable (Air-Import) */
export interface AirImportOtherChargesPayable extends AuditFields {
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
  distributeCostEquallyOnAllJobs: YesNo;

  allocationLines: AirImportPayableAllocationLine[];
  chargeLines: AirImportPayableChargeLine[];
  grandTotal: number;
  totalCharges: number;

  jobHistory: AirImportPayableCreditNoteRef[];
  usedClearedVouchers: AirImportPayableVoucherRef[];
  attachmentNote: string;

  status: {
    final: boolean;
  };
}
