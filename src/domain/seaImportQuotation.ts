import { AuditFields, IsoDate, YesNo } from './common';

export interface QuotationCurrencyRow {
  currencyCode: string;
  exRate: number;
}

export interface QuotationJobInfoRow {
  jobNo: string;
  date: IsoDate;
  type: string;
}

/** Service Charges At Origin / At Destination grid line — Buying & Selling side by side. */
export interface QuotationServiceChargeLine {
  id: string;
  description: string;
  buyingCurr: string;
  buyingAmount: number;
  sellingCurr: string;
  sellingAmount: number;
}

export interface QuotationRefundLine {
  id: string;
  curr: string;
  amountFcr: number;
  amount: number;
}

export interface QuotationDimensionRow {
  length: number;
  width: number;
  height: number;
  noOfCtns: number;
  total: number;
}

/** Quotations (Sea-Import) */
export interface SeaImportQuotation extends AuditFields {
  branch: string;
  transportMode: string;
  date: IsoDate;
  validity: string;
  quotationNo: string;
  callType: string;
  callTypeRef: string;
  supplQuoteNo: string;
  relatedQuoteNo: string;
  localIntl: 'Local' | "Int'l";

  customerCode: string;
  partyCode: string;
  name: string;
  address: string;

  foreignAgentCode: string;
  spoCode: string;
  origin: string;
  destination: string;
  commodity: string;
  ccPort: string;
  ccDate: IsoDate | '';
  customerRefNo: string;
  pickUpLocation: string;
  dropOffLocation: string;

  noOfPkgs: number;
  uom: string;
  grossWeight: number;
  chWeight: number;
  incoTerm: string;
  cargoType: string;
  cargoValue: number;
  cargoCurr: string;
  cbm: number;
  chargeCode: string;
  allIn: YesNo;
  win: YesNo;

  reason: string;
  hsCode: string;
  preparedBy: string;
  approvedBy: string;
  approvedByDate: IsoDate | '';
  closingReason: string;
  closingReasonDate: IsoDate | '';
  remarks: string;

  currencies: QuotationCurrencyRow[];
  jobInfo: QuotationJobInfoRow[];

  termsAndConditions: string;
  extraSheet: string;

  serviceChargesOrigin: QuotationServiceChargeLine[];
  serviceChargesDestination: QuotationServiceChargeLine[];
  grandTotalBuying: number;
  grandTotalSelling: number;
  difference: number;

  refundLines: QuotationRefundLine[];

  dimensions: QuotationDimensionRow[];
  dimWeight: number;
  dimWeightDivisor: number;
  dimCbm: number;
  dimCbmDivisor: number;

  status: {
    final: boolean;
  };
}
