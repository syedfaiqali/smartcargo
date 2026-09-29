import { AuditFields } from './common';

export interface AirlineCode extends AuditFields {
  code: string;
  name: string;
  flightName: string;
  standardAwb: 'Y' | 'N';
  airlineCass: 'Y' | 'N' | '';
  address?: string;
  attention?: string;
  phoneNo?: string;
  faxNo?: string;
  email?: string;
  website?: string;
  gsaName?: string;
  gsaIataCode?: string;
  uaiCode?: string;
  aisCharges?: number;
  awbFee?: number;
  exchangeRate?: number;
  printSecuritySurcharge?: string;
  printFuelSurcharge?: string;
  printScanningCharges?: string;
  printCaaCharges?: string;
  commissionPercent?: number;
  whtPercent?: number;
  logoName?: string;
  airportOfDeparture?: string;
  effectiveFrom?: string;
  chargesCurrency?: string;
  dueCarrierCharges?: AirlineDueCarrierCharge[];
}

export interface AirlineDueCarrierCharge {
  id: string;
  label: string;
  rate: number;
  cwGw: 'CW' | 'GW';
  fixAmount: number;
  ppCc: 'PP' | 'CC' | 'BOTH';
}

export interface OwnerCode extends AuditFields {
  code: string;
  name: string;
  station: string;
  phoneFaxNo: string;
  email: string;
  website: string;
  iataCode: string;
  accountNo: string;
  commissionPercent: number;
  whtPercent: number;
  logoName: string;
}

export interface PartyCode extends AuditFields {
  code: string;
  name: string;
  address: string;
  creditLimit: number;
}

export interface ForeignAgentCode extends AuditFields {
  code: string;
  name: string;
  address: string;
}

export interface AirportCode extends AuditFields {
  code: string;
  name: string;
  /** Country Code, linked to CountryCode.code. */
  countryCode: string;
  sectorCode: string;
}

export interface SpoCode extends AuditFields {
  code: string;
  /** SPO Name — kept as `description` so existing SPO-code dropdowns across job/invoice entry forms keep working unchanged. */
  description: string;
  sharePercent: number;
  splitedSharePercent: number;
  financeCode: string;
  designation: string;
  mobileNo: string;
  email: string;
  active: 'Y' | 'N';
}

export interface CurrencyCode extends AuditFields {
  code: string;
  name: string;
  defaultExchangeRate: number;
}

export interface AgentCode extends AuditFields {
  code: string;
  name: string;
  kind: 'CLEARING' | 'DELIVERY';
  address: string;
  countryCode: string;
  phoneNo: string;
  faxNo: string;
  contactPerson: string;
  email: string;
  website: string;
}

export interface BankCode extends AuditFields {
  code: string;
  name: string;
  accountDetail: string;
}

export type PayableTypeDept = 'AIR_EXPORT' | 'SEA_EXPORT' | 'AIR_IMPORT' | 'SEA_IMPORT' | 'CLEARANCE' | 'CONSIGNMENT' | 'LOGISTICS' | 'TRANSPORT' | 'OTHERS';

export interface PayableTypeDeptRow {
  dept: PayableTypeDept;
  /** Finance control code for the "Other Expense (Dr.)" side. */
  otherExpenseCode: string;
  otherExpenseAmount: number;
  /** Finance control code for the "Other Income (Cr.)" side. */
  otherIncomeCode: string;
  otherIncomeAmount: number;
}

export interface PayableTypeCode extends AuditFields {
  code: string;
  description: string;
  vendorCode: string;
  deptRows: PayableTypeDeptRow[];
}

export const PAYABLE_TYPE_DEPTS: { dept: PayableTypeDept; label: string }[] = [
  { dept: 'AIR_EXPORT', label: 'Air Export' },
  { dept: 'SEA_EXPORT', label: 'Sea Export' },
  { dept: 'AIR_IMPORT', label: 'Air Import' },
  { dept: 'SEA_IMPORT', label: 'Sea Import' },
  { dept: 'CLEARANCE', label: 'Clearance' },
  { dept: 'CONSIGNMENT', label: 'Consignment' },
  { dept: 'LOGISTICS', label: 'Logistics' },
  { dept: 'TRANSPORT', label: 'Transport' },
  { dept: 'OTHERS', label: 'Others' },
];

export interface ShippingLineCode extends AuditFields {
  code: string;
  name: string;
  address: string;
  email: string;
  website: string;
  phoneNo: string;
  faxNo: string;
  contactPerson: string;
  ntnNo: string;
}

export interface SeaPortCode extends AuditFields {
  code: string;
  name: string;
  country: string;
}

export interface SectorCode extends AuditFields {
  code: string;
  name: string;
}

export interface CountryCode extends AuditFields {
  code: string;
  name: string;
  sectorCode: string;
}

export type CommodityType = 'Dry Cargo' | 'Perishable';

export interface CommodityCode extends AuditFields {
  code: string;
  /** Commodity Name — kept as `description` so the existing commodity dropdown in Job (MAWB/HAWB) entry keeps working unchanged. */
  description: string;
  commodityType: CommodityType | '';
  hsCode: string;
}

export interface ContainerType extends AuditFields {
  code: string;
  /** Container Size in feet, e.g. "20", "40". */
  size: string;
  /** Container Type, e.g. "General Purpose", "High Cube". */
  containerType: string;
  /** Number of TEUs (twenty-foot equivalent units) this container size represents. */
  teus: number;
}

export interface SubAgentParty extends AuditFields {
  code: string;
  name: string;
  address: string;
  phoneNo: string;
  faxNo: string;
  contactPerson: string;
  exportRegNo: string;
  saleTaxNo: string;
  ntnNo: string;
  zipCode: string;
  cityCode: string;
  countryCode: string;
  email: string;
  website: string;
}

export interface AssociateCode extends AuditFields {
  code: string;
  name: string;
  address: string;
  countryCode: string;
  phoneNo: string;
  faxNo: string;
  contactPerson: string;
  email: string;
  website: string;
}

export interface ChargeableCode extends AuditFields {
  code: string;
  name: string;
  /** Description(For Awb) — kept as `description` so the existing chargeable-code dropdowns in Job (MAWB) entry / Sea Import Quotation keep working unchanged. */
  description: string;
  ppCc: 'PP' | 'CC';
}

export interface InvoiceChargeCode extends AuditFields {
  code: string;
  description: string;
  /** Abbreviation shown on the AWB printout. */
  awbAbbreviation: string;
  financeCode: string;
}

export interface SignatoryCode extends AuditFields {
  code: string;
  name: string;
  designation: string;
  fatherName: string;
  cnicNo: string;
  email: string;
  signatureImageName: string;
}

export interface JobType extends AuditFields {
  code: string;
  description: string;
  incomeCode: string;
  incomeDescription: string;
}

export interface JobStatusCode extends AuditFields {
  code: string;
  description: string;
}

export interface TermsAndConditions extends AuditFields {
  code: string;
  description: string;
}
