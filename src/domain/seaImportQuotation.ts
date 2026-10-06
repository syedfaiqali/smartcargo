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

/** One Airline Rate comparison row — lets a quotation carry multiple carriers' quoted rates (PIA, ETH, ...). */
export interface QuotationAirlineRateLine {
  id: string;
  airlineCode: string;
  rate: number;
  currencyCode: string;
}

/** One routed carrier option on a vendor rate quotation (e.g. "TK - Turkish Airlines", "QR - Qatar Airways"). */
export interface QuotationCarrierOption {
  id: string;
  optionCode: string;
  carrierName: string;
  routing: string;
  scheduleNote: string;
  ratePerKg: number;
  currencyCode: string;
}

/** A local/handling charge line shown ahead of carrier options on a vendor rate quotation. */
export interface QuotationLocalCharge {
  id: string;
  description: string;
  amount: number;
  currencyCode: string;
}

/** Sender/receiver + compliance details for a vendor rate quotation received (e.g. from Cargomind). */
export interface QuotationVendorInfo {
  serviceSolicitorName: string;
  serviceSolicitorAddress: string;
  serviceSolicitorContact: string;
  serviceProviderName: string;
  serviceProviderAddress: string;
  issuedByName: string;
  issuedByCompany: string;
  issuedByPhone: string;
  issuedByEmail: string;
  co2EmissionsKg: number;
  originCity: string;
  destinationCity: string;
  placeOfAcceptance: string;
  /** Free-text points shown under "Not included in this quotation" on the vendor-quote print. */
  notIncluded: string[];
  /** Free-text "Terms and Conditions" paragraph shown on the vendor-quote print. */
  termsText: string;
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
export type QuotationTransportMode = 'AIR' | 'SEA' | '';

export interface SeaImportQuotation extends AuditFields {
  branch: string;
  transportMode: QuotationTransportMode;
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
  packageType: string;
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
  airlineRates: QuotationAirlineRateLine[];

  /** Present only on quotations received FROM a vendor (e.g. Cargomind) rather than issued to a customer. */
  localCharges: QuotationLocalCharge[];
  carrierOptions: QuotationCarrierOption[];
  vendorInfo: QuotationVendorInfo | null;

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
