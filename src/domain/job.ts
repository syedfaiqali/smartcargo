import { AuditFields, IsoDate, RecordStatus, YesNo } from './common';

export type JobKind = 'MAWB' | 'HAWB';

/** One line of the Entry-tab Charges grid — docs Section 2.5 */
export interface ChargeLine {
  id: string;
  rcp: string;
  pcs: number;
  grossWt: number;
  cl: string;
  comdty: string;
  chargeWt: number;
  dimensionWt: number;
  rate: number;
  ratePkr: number;
  total: number;
  totalPkr: number;
}

/** Entry-tab Totals block — docs Section 2.6 */
export interface JobTotals {
  freight: number;
  freightPkr: number;
  dueCarrier: number;
  dueCarrierPkr: number;
  dueAgent: number;
  dueAgentPkr: number;
  totalAwbAmount: number;
  totalAwbAmountPkr: number;
  totalKbAmount: number;
  commission: number;
  whtAmount: number;
  payableToAirline: number;
  payableToAirlinePkr: number;
}

/** Charges-tab Due Carrier charge line — docs Section 2.9 */
export interface DueCarrierChargeLine {
  id: string;
  label: string;
  rate: number;
  cwGwBasis: 'CW' | 'GW';
  charges: number;
  chargesPkr: number;
  editableLabel: boolean;
}

/** Charges-tab Due Agent charge line — docs Section 2.9 */
export interface DueAgentChargeLine {
  id: string;
  label: string;
  chargesForeign: number;
  chargesPkr: number;
  printOnAwb: boolean;
  manualInput: boolean;
  editableLabel: boolean;
}

export interface ChargesTab {
  dueCarrierLines: DueCarrierChargeLine[];
  /** Extra carrier-charge rows entered below the standard airline charge heads. */
  additionalDueCarrierLines: DueCarrierChargeLine[];
  totalDueCarrier: number;
  totalDueCarrierPkr: number;
  dueAgentLines: DueAgentChargeLine[];
  totalDueAgent: number;
  totalDueAgentPkr: number;
  ccScanningPayable: YesNo;
}

/** K.B. tab per-line freight — docs Section 2.10 */
export interface KbFreightLine {
  id: string;
  lineNo: 1 | 2 | 3;
  pcs: number;
  cl: string;
  commodity: string;
  newCommodity: string;
  grossWeight: number;
  chargeWeight: number;
  rate: number;
  ratePkr: number;
  totalFreight: number;
  totalFreightPkr: number;
  commissionApplies: YesNo;
  netRate: YesNo;
  agreedRate: number;
  agreedFreight: number;
  freightDifference: number;
  lessCommission: YesNo;
  kbFreight: number;
  kbFreightPkr: number;
  kbRatePercent: number;
  kbAmount: number;
  kbAmountPkr: number;
}

export interface KbOtherChargeLine {
  id: string;
  label: string;
  foreign: number;
  pkr: number;
}

export interface KbTab {
  lines: KbFreightLine[];
  otherCharges: KbOtherChargeLine[];
  totalOtherChargesPayable: number;
  totalOtherChargesPayablePkr: number;
  netPayable: number;
  netPayablePkr: number;
  kbAdjustment: YesNo;
  kbAdjustmentDate: IsoDate | '';
  interLineRevenue: number;
  totalDeduction: number;
  ownerCommOnNet: YesNo;
  ownerCommPercent: number;
  ownerWhtPercent: number;
  shipperAgreedRate: number;
  shipperAgreedFreight: number;
  invoicedRate: number;
  invoicedFreight: number;
  printableRemarks: string;
}

export type DocStatus = 'Y' | 'N' | 'P';

export interface DocChecklistItem {
  code: 'FEC' | 'APC' | 'IPB' | 'C/M' | 'Encash';
  airline: DocStatus;
  party: DocStatus;
}

export interface FlightLeg {
  id: string;
  flightNo: string;
  flightDate: IsoDate | '';
  routing: string;
  status: string;
}

export interface ProcessMilestone {
  key: 'customClearanceLocal' | 'departureInTransit' | 'arrivalAtDestination' | 'customClearanceDestination';
  label: string;
  date: IsoDate | '';
  time: string;
  confirmed: boolean;
}

export interface RemarksTab {
  flightLegs: FlightLeg[];
  receivedOn: IsoDate | '';
  arrivalDate: IsoDate | '';
  arrivalTime: string;
  forwardedOn: IsoDate | '';
  vehicleNo: string;
  delivered: YesNo;
  heldDate: IsoDate | '';
  releaseDate: IsoDate | '';
  pendingShipment: YesNo;
  handedOverToAirline: YesNo;
  receivedFromShipper: YesNo;
  deliveryRequired: YesNo;
  deliveryDate: IsoDate | '';
  milestones: ProcessMilestone[];
  docChecklist: DocChecklistItem[];
  airlineNoOfCopies: number;
  partyChecklistRemarks: string;
  nonPrintableRemarks: string;
  printableRemarks: string;
  extraSheets: string;
  labelAdditionalInstructions: string;
}

export interface PrintingOptions {
  documentType: string;
  printCurrency: 'LOCAL' | 'FOREIGN';
  printAwbNo: YesNo;
  printAsAgreed: YesNo;
  printChargeableCode: YesNo;
  printPartyNameAtBottom: YesNo;
  printAgentPartyNameAtBottom: YesNo;
  printWeight: YesNo;
  printCompanyName: YesNo;
  printExRate: YesNo;
  printStamp: YesNo;
  printConsigneeNameAddress: YesNo;
  printRateBasis: 'RATE_KG' | 'RATE_KG_AMOUNT' | 'AMOUNT';
  printIssuingCarrierBox: 'ISSUING_CARRIER' | 'NOTIFY' | 'NOTHING' | 'DELIVERY_AGENT' | 'GSA_NAME';
  printChargeType: 'PP' | 'PX';
  printShipperNameAddress: YesNo;
  printAirlineAddress: YesNo;
  printMemberOfIata: YesNo;
  printOn: 'PLAIN_PAPER' | 'PRE_PRINTED_AWB';
  printOnStationery: 'LETTER_PAD' | 'PLAIN_PAPER';
  undertakingSignatoryCode: string;
  undertakingPrintOn: 'LETTER_PAD' | 'PLAIN_PAPER';
  undertakingPrintDate: IsoDate | '';
  cargoManifestLetterDate: IsoDate | '';
  cargoManifestPrintOn: 'LETTER_PAD' | 'PLAIN_PAPER';
  cargoManifestSpecialNote: string;
  cargoManifestSignatoryCode: string;
  labelPrintQuantity: 'TWO' | 'FOUR' | 'ONE_4X6' | 'ONE_4X3';
  labelPrintLogo: 'COMPANY' | 'AIRLINE';
  printBarCode: YesNo;
  signatureLine: string;
  copies: Record<string, boolean>;
}

export interface JobParty {
  creditLimit: number;
  partyCode: string;
  agentParty: string;
  name: string;
  address: string;
}

export interface JobConsignee {
  consolidation: YesNo;
  code: string;
  name: string;
  address: string;
}

export interface JobRouting {
  ccPort: string;
  airportOfDeparture: string;
  legs: { to: string; by: string }[];
  destination: string;
  accountNo: string;
  hsCode: string;
  flightNo1: string;
  flightNo2: string;
  /** Date for Flight No. 2; `flightDate` remains the date for Flight No. 1. */
  flightDate2: IsoDate | '';
  flightDate: IsoDate | '';
  formEType: '' | 'FORM_E_NO' | 'FIN_INST_NO' | 'PERMISSION_NO';
  formENo: string;
  formEDate: IsoDate | '';
  shipperInvoiceNo: string;
  shipperInvoiceDate: IsoDate | '';
  sbNo: string;
  sbDate: IsoDate | '';
}

export interface JobAgents {
  clearingAgent: string;
  deliveryAgent: string;
  spoCode: string;
  runNo: string;
  prefix: string;
  roNo: string;
}

export interface LinkedInvoiceRef {
  no: string;
  date: IsoDate;
  year: number;
  type: string;
  name: string;
  curr: string;
  fAmount: number;
  pkrAmount: number;
  final: boolean;
}

export interface HouseAwbRef {
  jobNo: string;
  hawbNo: string;
  runNo: string;
}

export interface CreditNoteRef {
  invoiceId?: string;
  variant?: 'CREDIT_NOTE_TO' | 'CREDIT_NOTE_RECEIVED';
  hawbNo: string;
  runNo: string;
  cnNo: string;
  manualCn: boolean;
}

export interface VoucherRef {
  voucherNo: string;
  voucherDate: IsoDate;
  amount: number;
}

/** The full Job (MAWB) / Job (HAWB) anchor record — docs Sections 2 & 3 */
export interface Job extends AuditFields {
  kind: JobKind;
  branch: string;
  jobNo: string;
  jobDate: IsoDate;
  jobType: string;
  nomination: YesNo;
  quotRefNo: string;
  mawbNo: string;
  /** For HAWB jobs: the parent MAWB job's jobNo. */
  parentJobNo?: string;
  hawbNo?: string;
  awbDate: IsoDate | '';
  saleDate: IsoDate | '';
  owner: string;
  chargeCode: string;
  station: string;
  incoTerm: string;

  party: JobParty;
  consignee: JobConsignee;
  routing: JobRouting;
  agents: JobAgents;

  shipmentStatus: string;
  shipmentStatusDate: IsoDate | '';

  insurance: string;
  declaredValCarriage: string;
  declaredValCustoms: string;
  handlingInformation: string;
  currency: string;
  exRate: number;
  printableExRate: number;

  chargeLines: ChargeLine[];
  totals: JobTotals;

  accountingInformationNotify: string;
  saidToContain: string;
  otherInformation: string;
  invoiceRequired: YesNo;
  localInvoice: YesNo;

  linkedInvoices: LinkedInvoiceRef[];
  usedClearedVouchers: VoucherRef[];
  houseAwbs: HouseAwbRef[];
  creditNoteDetails: CreditNoteRef[];

  charges: ChargesTab;
  kb: KbTab;
  remarks: RemarksTab;
  printing: PrintingOptions;

  status: RecordStatus;
}
