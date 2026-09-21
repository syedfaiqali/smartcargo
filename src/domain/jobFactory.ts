import { v4 as uuid } from 'uuid';
import { emptyStatus } from './common';
import {
  ChargesTab,
  DocChecklistItem,
  DueAgentChargeLine,
  DueCarrierChargeLine,
  Job,
  JobKind,
  KbTab,
  PrintingOptions,
  ProcessMilestone,
  RemarksTab,
} from './job';

const nowIso = () => new Date().toISOString();

const DOC_CODES: DocChecklistItem['code'][] = ['FEC', 'APC', 'IPB', 'C/M', 'Encash'];

const MILESTONE_DEFS: { key: ProcessMilestone['key']; label: string }[] = [
  { key: 'customClearanceLocal', label: 'Custom Clearance (Local Hub)' },
  { key: 'departureInTransit', label: 'Departure (In Transit)' },
  { key: 'arrivalAtDestination', label: 'Arrival At Destination (Process at Foreign Hub)' },
  { key: 'customClearanceDestination', label: 'Custom Clearance At Destination (Foreign Hub)' },
];

const DUE_CARRIER_DEFAULT_LABELS = [
  'Due Carrier',
  'AMS Charges',
  'HAWB Charges',
  'AWC Charges',
  'Bar Coding',
  'Security Charges',
  'Fuel SurCharge',
  'Scan Charges',
  'CAA Charges',
];

const DUE_AGENT_DEFAULT_LABELS = ['AWB Fee', 'AIS Charges'];

/** Shared Due Carrier charge-head defaults — reused by Job (MAWB/HAWB) Charges tab and Local Invoice 4.4. */
export function emptyDueCarrierLines(): DueCarrierChargeLine[] {
  return DUE_CARRIER_DEFAULT_LABELS.map((label, i) => ({
    id: uuid(),
    label,
    rate: 0,
    cwGwBasis: 'CW',
    charges: 0,
    chargesPkr: 0,
    editableLabel: i >= DUE_CARRIER_DEFAULT_LABELS.length - 5,
  }));
}

/** Shared Due Agent charge-head defaults — reused by Job (MAWB/HAWB) Charges tab and Local Invoice 4.4. */
export function emptyDueAgentLines(): DueAgentChargeLine[] {
  return DUE_AGENT_DEFAULT_LABELS.map((label) => ({
    id: uuid(),
    label,
    chargesForeign: 0,
    chargesPkr: 0,
    printOnAwb: false,
    manualInput: label === 'AIS Charges',
    editableLabel: false,
  }));
}

export function emptyChargesTab(): ChargesTab {
  return {
    dueCarrierLines: emptyDueCarrierLines(),
    totalDueCarrier: 0,
    totalDueCarrierPkr: 0,
    dueAgentLines: emptyDueAgentLines(),
    totalDueAgent: 0,
    totalDueAgentPkr: 0,
    ccScanningPayable: 'N',
  };
}

export function emptyKbTab(): KbTab {
  return {
    lines: [1, 2, 3].map((lineNo) => ({
      id: uuid(),
      lineNo: lineNo as 1 | 2 | 3,
      pcs: 0,
      cl: '',
      commodity: '',
      grossWeight: 0,
      chargeWeight: 0,
      rate: 0,
      ratePkr: 0,
      totalFreight: 0,
      totalFreightPkr: 0,
      commissionApplies: 'N',
      netRate: 'N',
      agreedRate: 0,
      agreedFreight: 0,
      freightDifference: 0,
      lessCommission: 'N',
      kbFreight: 0,
      kbRatePercent: 0,
      kbAmount: 0,
    })),
    otherCharges: [{ id: uuid(), label: 'AWB Fee', foreign: 0, pkr: 0 }],
    totalOtherChargesPayable: 0,
    netPayable: 0,
    kbAdjustment: 'N',
    kbAdjustmentDate: '',
    interLineRevenue: 0,
    totalDeduction: 0,
    ownerCommOnNet: 'N',
    ownerCommPercent: 0,
    ownerWhtPercent: 0,
    shipperAgreedRate: 0,
    shipperAgreedFreight: 0,
    invoicedRate: 0,
    invoicedFreight: 0,
    printableRemarks: '',
  };
}

export function emptyRemarksTab(): RemarksTab {
  return {
    flightLegs: Array.from({ length: 6 }, () => ({
      id: uuid(),
      flightNo: '',
      flightDate: '',
      routing: '',
      status: '',
    })),
    receivedOn: '',
    arrivalDate: '',
    arrivalTime: '',
    forwardedOn: '',
    vehicleNo: '',
    delivered: 'N',
    heldDate: '',
    releaseDate: '',
    pendingShipment: 'N',
    handedOverToAirline: 'N',
    receivedFromShipper: 'N',
    deliveryRequired: 'N',
    deliveryDate: '',
    milestones: MILESTONE_DEFS.map((m) => ({ ...m, date: '', time: '', confirmed: false })),
    docChecklist: DOC_CODES.map((code) => ({ code, airline: 'N' as const, party: 'N' as const })),
    airlineNoOfCopies: 0,
    partyChecklistRemarks: '',
    nonPrintableRemarks: '',
    printableRemarks: '',
    extraSheets: '',
    labelAdditionalInstructions: '',
  };
}

export function emptyPrintingOptions(): PrintingOptions {
  return {
    documentType: 'AIR_WAYBILL',
    printCurrency: 'LOCAL',
    printAwbNo: 'Y',
    printAsAgreed: 'N',
    printChargeableCode: 'N',
    printPartyNameAtBottom: 'N',
    printAgentPartyNameAtBottom: 'N',
    printWeight: 'Y',
    printCompanyName: 'Y',
    printExRate: 'Y',
    printStamp: 'N',
    printConsigneeNameAddress: 'Y',
    printRateBasis: 'RATE_KG_AMOUNT',
    printIssuingCarrierBox: 'ISSUING_CARRIER',
    printChargeType: 'PP',
    printShipperNameAddress: 'Y',
    printAirlineAddress: 'Y',
    printMemberOfIata: 'N',
    printOn: 'PLAIN_PAPER',
    printBarCode: 'N',
    signatureLine: 'SIGNED BY THE AGENT ON BEHALF OF CARRIER',
    copies: {
      'Original 3 (for Shipper)': true,
      'Copy 8 (for Agent)': true,
      'Original 1 (for Issuing Carrier)': true,
      'Original 2 (for Consignee)': true,
      'Copy 4 (for Delivery Receipt)': false,
      'Copy 5 (For Airport of Destination)': false,
      'Copy 6 (Extra Copy)': false,
      'Copy 7 (Extra Copy)': false,
      'Copy 9 (Extra Copy for Carrier)': false,
      'Copy 10 (Extra Copy for Carrier)': false,
      'Copy 11 (Extra Copy for Carrier)': false,
      Dummy: false,
    },
  };
}

export function createEmptyJob(kind: JobKind, branch = 'KHI'): Job {
  return {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    kind,
    branch,
    jobNo: '',
    jobDate: new Date().toISOString().slice(0, 10),
    jobType: '',
    nomination: 'N',
    quotRefNo: '',
    mawbNo: '',
    hawbNo: kind === 'HAWB' ? '' : undefined,
    parentJobNo: kind === 'HAWB' ? '' : undefined,
    awbDate: '',
    saleDate: '',
    owner: '',
    chargeCode: '',
    station: '',
    incoTerm: '',
    party: { creditLimit: 0, partyCode: '', agentParty: '', name: '', address: '' },
    consignee: { consolidation: 'N', code: '', name: '', address: '' },
    routing: {
      ccPort: '',
      airportOfDeparture: '',
      legs: [
        { to: '', by: '' },
        { to: '', by: '' },
        { to: '', by: '' },
      ],
      destination: '',
      accountNo: '',
      hsCode: '',
      flightNo1: '',
      flightNo2: '',
      flightDate: '',
      formENo: '',
      formEDate: '',
      shipperInvoiceNo: '',
      shipperInvoiceDate: '',
      sbNo: '',
      sbDate: '',
    },
    agents: { clearingAgent: '', deliveryAgent: '', spoCode: '', runNo: '', prefix: '', roNo: '' },
    shipmentStatus: '',
    shipmentStatusDate: '',
    insurance: '',
    declaredValCarriage: '',
    declaredValCustoms: '',
    handlingInformation: '',
    currency: 'PKR',
    exRate: 1,
    printableExRate: 1,
    chargeLines: Array.from({ length: 3 }, (_, index) => ({
      id: uuid(),
      rcp: index === 0 ? '' : 'NEW',
      pcs: 0,
      grossWt: 0,
      cl: '',
      comdty: '',
      chargeWt: 0,
      dimensionWt: 0,
      rate: 0,
      ratePkr: 0,
      total: 0,
      totalPkr: 0,
    })),
    totals: {
      freight: 0,
      freightPkr: 0,
      dueCarrier: 0,
      dueCarrierPkr: 0,
      dueAgent: 0,
      dueAgentPkr: 0,
      totalAwbAmount: 0,
      totalAwbAmountPkr: 0,
      totalKbAmount: 0,
      commission: 0,
      whtAmount: 0,
      payableToAirline: 0,
      payableToAirlinePkr: 0,
    },
    accountingInformationNotify: '',
    saidToContain: '',
    otherInformation: '',
    invoiceRequired: 'N',
    localInvoice: 'N',
    linkedInvoices: [],
    usedClearedVouchers: [],
    houseAwbs: [],
    creditNoteDetails: [],
    charges: emptyChargesTab(),
    kb: emptyKbTab(),
    remarks: emptyRemarksTab(),
    printing: emptyPrintingOptions(),
    status: emptyStatus(),
  };
}
