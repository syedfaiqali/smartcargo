import { AuditFields, IsoDate, YesNo } from './common';

/** Auto Calculate Cost grid — jobs/HBLs this payable is charged against. */
export interface SeaPayableCostLine {
  id: string;
  jobNo: string;
  hblNo: string;
  pcs: number;
  grossWeight: number;
  cbm: number;
  cost: number;
  partyName: string;
}

/** Container grid — container No./Size/Rate used for CBM-based cost calculation. */
export interface SeaPayableContainerLine {
  id: string;
  containerNo: string;
  size: string;
  rate: number;
}

/** Other Charges / Less Charges grid line. */
export interface SeaPayableChargeLine {
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

export interface SeaPayableCreditNoteRef {
  no: string;
  date: IsoDate;
  payableType: string;
  jobNo: string;
  jobPartyCode: string;
  jobPartyName: string;
  creditPartyCode: string;
  creditPartyName: string;
  amount: number;
}

export interface SeaPayableVoucherRef {
  voucherNo: string;
  voucherDate: IsoDate;
  amount: number;
}

/** Other Charges Payables (Sea-Export) */
export interface SeaOtherChargesPayable extends AuditFields {
  branch: string;
  creditNoteNo: string;
  year: number;
  date: IsoDate;

  payableType: string;
  dueDate: IsoDate | '';
  partyCode: string;
  partyName: string;
  partyAddress: string;

  consolNo: string;
  jobYear: number;
  jobNo: string;
  mblNo: string;
  lclFcl: 'LCL' | 'FCL';

  fobCif: 'FOB' | 'CIF';
  cbm: number;
  cbmRate: number;

  billNo: string;
  billDate: IsoDate | '';
  remarks: string;

  postInLocalCurrency: YesNo;
  currency1: string;
  exRate1: number;
  currency2: string;
  exRate2: number;
  currency3: string;
  exRate3: number;

  containers: SeaPayableContainerLine[];
  costLines: SeaPayableCostLine[];

  chargeLines: SeaPayableChargeLine[];
  lessChargeLines: SeaPayableChargeLine[];

  subTotal: number;
  lessTotal: number;
  grandTotal: number;

  jobHistory: SeaPayableCreditNoteRef[];
  usedClearedVouchers: SeaPayableVoucherRef[];
  attachmentNote: string;

  status: {
    final: boolean;
  };
}
