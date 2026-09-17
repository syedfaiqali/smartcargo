import { AuditFields, IsoDate, YesNo } from './common';

/** Auto Calculate Cost grid — jobs/HBLs this payable is charged against. */
export interface SeaImportPayableCostLine {
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
export interface SeaImportPayableContainerLine {
  id: string;
  containerNo: string;
  size: string;
  rate: number;
}

/** Other Charges grid line. */
export interface SeaImportPayableChargeLine {
  id: string;
  code: string;
  description: string;
  curr: string;
  fAmount: number;
  pkrAmount: number;
}

export interface SeaImportPayableCreditNoteRef {
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

export interface SeaImportPayableVoucherRef {
  voucherNo: string;
  voucherDate: IsoDate;
  amount: number;
}

/** Other Charges Payables (Sea-Import) */
export interface SeaImportOtherChargesPayable extends AuditFields {
  branch: string;
  creditNoteNo: string;
  year: number;
  date: IsoDate;

  payableType: string;
  dueDate: IsoDate | '';
  partyCode: string;
  partyName: string;
  partyAddress: string;
  takeEffectInGp: YesNo;

  consoleJobNo: string;
  jobYear: number;

  cbm: number;
  cbmRate: number;

  billNo: string;
  billDate: IsoDate | '';

  currencies: { currencyCode: string; exRate: number }[];

  containers: SeaImportPayableContainerLine[];
  remarks: string;

  costLines: SeaImportPayableCostLine[];

  chargeLines: SeaImportPayableChargeLine[];
  grandTotal: number;
  totalCharges: number;

  jobHistory: SeaImportPayableCreditNoteRef[];
  usedClearedVouchers: SeaImportPayableVoucherRef[];
  attachmentNote: string;

  status: {
    final: boolean;
  };
}
