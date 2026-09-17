import { AuditFields, IsoDate, YesNo } from './common';

/** Charges grid line — itemized refund lines (e.g. Ocean Freight), rated per CBM. */
export interface SeaImportRefundChargeLine {
  id: string;
  description: string;
  ratePerCbm: number;
  amount1: number;
  amount2: number;
}

/** Refund From Shipping Lines Entry and Printing (Sea-Import) */
export interface SeaImportRefundFromShippingLines extends AuditFields {
  branch: string;
  documentNo: string;
  date: IsoDate;
  jobNo: string;
  jobYear: number;
  lclFcl: 'LCL' | 'FCL';

  sLineAgent: string;

  postInPkrCurrency: YesNo;
  currency: string;
  exRate: number;
  billNo: string;
  billDate: IsoDate | '';
  cbm: number;

  partyCode: string;
  partyName: string;
  agentParty: string;

  mblNo: string;
  hblNo: string;
  vessel: string;
  origin: string;
  destination: string;

  remarks: string;
  docNo: string;

  chargeLines: SeaImportRefundChargeLine[];
  totalAmount: number;

  status: {
    final: boolean;
  };
}
